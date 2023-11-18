const sequelize = require('./sequelize');
const Car = require('./models/car.js');
const CarUpdate = require('./models/carUpdate.js');

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

        console.log('PAINT[0]',  PAINT);
      console.log('INTERIOR[0]',  INTERIOR);
      console.log('WHEELS[0]',  WHEELS);
      console.log('CABIN_CONFIG[0]',  CABIN_CONFIG);

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

const updateCarAsRemovedFromDb = async (carDTO) => {
  let car;
  try {
    car = await Car.update(
      { dateRemoved: sequelize.literal('CURRENT_TIMESTAMP') },
      {
        where: {
          vin: carDTO.VIN,
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

const updatePriceOfCarInDb = async (carDTO) => {
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

  const carUpdate = await CarUpdate.create({ price: Price });

  try {
    await car.addCarUpdate(carUpdate);
  } catch (err) {
    console.error(
      `Encountered error while updating a car's price in the db: ${err}`
    );
  }
};

module.exports = {
  addCarToDb,
  addNewCarsToDb,
  updatePriceOfCarInDb,
  updateCarAsRemovedFromDb,
};
