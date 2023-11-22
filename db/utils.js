const sequelize = require('./sequelize');
const Car = require('./models/car.js');
const CarUpdate = require('./models/carUpdate.js');
const {
  getPriceMessage,
  sendNotification,
  getAddedMessage,
  getRemovedMessage,
} = require('../server/utils.js');

const CONFIG = require('../.config.js');

const modelMap = {
  ms: 'Model S',
  m3: 'Model 3',
  mx: 'Model X',
  my: 'Model Y',
};

const hasFsd = (autopilotOptions) => {
  return autopilotOptions.includes('AUTOPILOT_FULL_SELF_DRIVING');
};

const hasAccelerationBoost = (additionalOptions) => {
  return additionalOptions.includes('ACCELERATION_BOOST');
};

const wasDamaged = (damageDisclosure, hasDamagePhotos) => {
  return damageDisclosure || hasDamagePhotos;
};

const isPreferredCar = (car) => {
  return Object.entries(CONFIG).reduce((acc, curr) => {
    if (acc === false) return false; // car doesn't match preferences

    const configKey = curr[0];
    const configValue = curr[1];
    const key = configKey.slice(configKey[0].indexOf('_') + 1);

    if (!configValue === '' && !configValue === undefined) {
      // config has preferred values

      switch (configKey) {
        // number, equal or less
        case 'PREFERRED_price':
        case 'PREFERRED_year':
        case 'PREFERRED_odometer':
        case 'PREFERRED_transportationFee':
          return car[key] <= configValue;
        // string, exact match
        case 'PREFERRED_model':
        case 'PREFERRED_color':
        case 'PREFERRED_city':
        case 'PREFERRED_state':
        case 'PREFERRED_storeName':
        case 'PREFERRED_trim':
        case 'PREFERRED_interior':
        case 'PREFERRED_seatLayout':
        case 'PREFERRED_wheels':
        case 'PREFERRED_vin':
        // boolean, exact match
        case 'PREFERRED_wasDamaged':
        case 'PREFERRED_hasFsd':
        case 'PREFERRED_hasAccelerationBoost':
          return car[key] === configValue;
        // date, after date
        case 'PREFERRED_originalInCustomerGarageDate':
          return new Date(car[key]) >= new Date(configValue);
        default:
          return true;
      }
    }

    // if no config value specified, we keep going
    return true;
  }, true);
};

const getPreferredCars = (cars) => cars.filter(isPreferredCar);

const addNewCarsToDb = async (carDTOs) => {
  const addedCars = [];

  const carsInDb = await Car.findAll();

  for (const carDTO of carDTOs) {
    if (carsInDb.some((car) => car.vin === carDTO.VIN)) {
      continue;
    } else {
      const car = await addCarToDb(carDTO);
      addedCars.push(car);
    }
  }

  return addedCars;
};

const addCarToDb = async (carDTO) => {
  const {
    Price,
    Model,
    Year,
    City,
    StateProvince,
    VrlName,
    Odometer,
    PAINT,
    TrimName,
    TransportationFee,
    AUTOPILOT,
    ADL_OPTS,
    INTERIOR,
    DamageDisclosure,
    HasDamagePhotos,
    OriginalInCustomerGarageDate,
    CABIN_CONFIG,
    VIN,
    WHEELS,
  } = carDTO;

  try {
    const car = await Car.create({
      model: modelMap[Model],
      year: Year,
      trim: TrimName,
      odometer: Odometer,
      city: City,
      state: StateProvince,
      color: PAINT[0],
      interior: INTERIOR[0],
      wheels: WHEELS[0],
      seatLayout: CABIN_CONFIG[0],
      hasFsd: hasFsd(AUTOPILOT),
      hasAccelerationBoost: hasAccelerationBoost(ADL_OPTS),
      wasDamaged: wasDamaged(DamageDisclosure, HasDamagePhotos),
      storeName: VrlName,
      transportationFee: TransportationFee,
      originalInCustomerGarageDate: OriginalInCustomerGarageDate,
      vin: VIN,
      isAvailable: true,
      dateAdded: sequelize.literal('CURRENT_TIMESTAMP'),
    });

    const carUpdate = await CarUpdate.create({ price: Price });

    // // Associate the update with the car
    await car.addCarUpdate(carUpdate);

    return car;
  } catch (error) {
    console.error('Error adding car to database', error);
  }
};

const getAvailableCarsFromDb = async (carDTO) => {
  return await Car.findAll({ where: { isAvailable: true } });
};

const updateCarAsRemovedFromDb = async (vin) => {
  let car;
  try {
    car = await Car.update(
      {
        dateRemoved: sequelize.literal('CURRENT_TIMESTAMP'),
        isAvailable: false,
      },
      {
        where: {
          vin,
        },
      }
    );
    return car;
  } catch (err) {
    console.error(
      `Encountered error while updating a car as removed from the db: ${err}`
    );
  }
};

const getCarPriceInDb = async (vin) => {
  const update = await CarUpdate.findOne({
    where: { carVin: vin },
    order: [['createdAt', 'DESC']],
  });
  return update.price;
};

const updatePriceInDb = async (car, price) => {
  let carUpdate;
  try {
    carUpdate = await CarUpdate.create({ price });
  } catch (err) {
    console.error(
      `Encountered error while updating the price in the car_update table: ${err}`
    );
  }

  try {
    // associate price record to car
    await car.addCarUpdate(carUpdate);
  } catch (err) {
    console.error(
      `Encountered error while updating a car's price in the db: ${err}`
    );
  }
};

const updatePriceAndCarInDb = async (carDTO) => {
  let car;
  try {
    car = await Car.findOne({
      where: {
        vin: carDTO.VIN,
      },
    });
  } catch (err) {
    console.error(
      `Encountered error while looking up a car by VIN in the db: ${err}`
    );
  }

  const carUpdate = await CarUpdate.create({ price: carDTO.Price });

  try {
    await car.addCarUpdate(carUpdate);
  } catch (err) {
    console.error(
      `Encountered error while updating a car's price in the db: ${err}`
    );
  }
};

const handleCarsDiff = async (newestCars) => {
  const priceChangeMessages = [];
  const priceChangeCars = []; // Tesla DTOs
  const addedCars = []; // Tesla DTOs
  const removedCars = []; // DB Cars

  for (const carDTO of newestCars) {
    let matchingCar;
    // Look up the car in the DB
    try {
      matchingCar = await Car.findOne({
        where: {
          vin: carDTO.VIN,
        },
      });
    } catch (err) {
      console.error(
        `Encountered error while looking up a car by VIN in the db: ${err}`
      );
    }

    // car found in the DB!
    if (matchingCar) {
      const price = await getCarPriceInDb(matchingCar.vin);
      /** CAR PRICE CHANGE **/
      if (price !== carDTO.Price) {
        const car = await updatePriceInDb(matchingCar, carDTO.Price);

        if (isPreferredCar(car)) {
          priceChangeCars.push(car);
          priceChangeMessages.push(getPriceMessage(price, car.price));
        }
      }
    } else {
      /** CAR ADDED TO INVENTORY **/
      const car = await addCarToDb(carDTO);

      if (isPreferredCar(car)) {
        addedCars.push(car);
      }
    }
  }

  // find cars in DB that are marked available but are not available on API (removed cars)
  const availableCars = await getAvailableCarsFromDb();

  const carsToRemove = availableCars.filter(
    (availableCar) =>
      !newestCars.find((newCar) => newCar.VIN === availableCar.vin)
  );

  for (const carToRemove of carsToRemove) {
    /** CAR REMOVED FROM INVENTORY **/
    const car = await updateCarAsRemovedFromDb(carToRemove.vin);

    if (isPreferredCar(car)) {
      removedCars.push(car);
    }
  }

  // Notify in bulk (preferred cars only)

  if (priceChangeCars.length) {
    console.log('Price Change Model Ys:', priceChangeCars);
    await sendNotification(
      priceChangeMessages.join(' and '), // TODO, need to get messages only for the preferred price change cars
      priceChangeCars
    );
  }

  if (addedCars.length) {
    console.log('Added Model Ys:', addedCars);
    const addedMessage = getAddedMessage(addedCars);
    await sendNotification(addedMessage, addedCars);
  }

  if (removedCars.length) {
    console.log('Removed Model Ys:', removedCars);
    const removedMessage = getRemovedMessage(removedCars);
    await sendNotification(removedMessage, removedCars);
  }
};

module.exports = {
  addCarToDb,
  addNewCarsToDb,
  getCarPriceInDb,
  handleCarsDiff,
  updateCarAsRemovedFromDb,
  updatePriceAndCarInDb,
};
