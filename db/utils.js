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

const getPreferredCars = (carDTOs) => {
  const preferredCars = carDTOs.filter((carDTO) => {
    const isPreferred = Object.entries(CONFIG).reduce((acc, curr) => {
      if (acc === false) return false; // car doesn't match preferences

      const currKey = curr[0];
      const currValue = curr[1];

      if (!currValue === '' && !currValue === undefined) {
        // config has preferred values

        switch (key) {
          // number, equal or less
          case 'PREFERRED_Price':
          case 'PREFERRED_Year':
          case 'PREFERRED_Odometer':
          case 'PREFERRED_TransportationFee':
            return carDTO[currKey] <= currValue;;
          // string, exact match
          case 'PREFERRED_Model':
          case 'PREFERRED_City':
          case 'PREFERRED_StateProvince':
          case 'PREFERRED_VrlName':
          case 'PREFERRED_TrimName':
          case 'PREFERRED_VIN':
          // boolean, exact match
          case 'PREFERRED_DamageDisclosure':
          case 'PREFERRED_HasDamagePhotos':
            return carDTO[currKey] === currValue;
          // array, includes string
          case 'PREFERRED_PAINT':
          case 'PREFERRED_AUTOPILOT':
          case 'PREFERRED_ADL_OPTS':
          case 'PREFERRED_INTERIOR':
          case 'PREFERRED_CABIN_CONFIG':
          case 'PREFERRED_WHEELS':
            return carDTO[currKey].includes(currValue);
          // date, after date
          case 'PREFERRED_OriginalInCustomerGarageDate':
            return new Date(carDTO[currKey]) >= new Date(currValue)
          default:
            return true;
        }
      }

      // if no config value specified, we keep going
      return true;
    }, true);
    
    return isPreferred;
  });

  return preferredCars;
};

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
        await updatePriceInDb(matchingCar, carDTO.Price);
        priceChangeCars.push(carDTO);
        priceChangeMessages.push(getPriceMessage(price, carDTO.Price));
      }
    } else {
      /** CAR ADDED TO INVENTORY **/
      await addCarToDb(carDTO);
      addedCars.push(carDTO);
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
    await updateCarAsRemovedFromDb(carToRemove.vin);
    removedCars.push(carToRemove);
  }

  // filter for only cars that we care about
  const preferredPriceChangeCars = getPreferredCars(priceChangeCars);
  const preferredAddedCars = getPreferredCars(addedCars);
  const preferredRemovedCars = getPreferredCars(removedCars);

  // Notify in bulk

  if (preferredPriceChangeCars.length) {
    console.log('Price Change Model Ys:', preferredPriceChangeCars);
    await sendNotification(
      priceChangeMessages.join(' and '), // TODO, need to get messages only for the preferred price change cars
      preferredPriceChangeCars
    );
  }

  if (preferredAddedCars.length) {
    console.log('Added Model Ys:', preferredAddedCars);
    const addedMessage = getAddedMessage(preferredAddedCars);
    await sendNotification(addedMessage, preferredAddedCars);
  }

  if (preferredRemovedCars.length) {
    console.log('Removed Model Ys:', preferredRemovedCars);
    const removedMessage = getRemovedMessage(preferredRemovedCars);
    await sendNotification(removedMessage, preferredRemovedCars);
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
