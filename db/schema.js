'use strict';
const Sequelize = require('sequelize').sequelize,
  STR = Sequelize.STRING, //varchar(255)
  BOOL = Sequelize.BOOLEAN, //tinyint(1)
  DATE = Sequelize.DATE, //Timestamp with time zone
  INT = Sequelize.INTEGER, //tinyint(1)
  TXT = Sequelize.TEXT, //text
  ENUM = Sequelize.ENUM; //enumerated

module.exports = {
  car: {
    id: {
      type: INT,
      autoIncrement: true,
      unique: true,
      required: true,
      primaryKey: true,
    },
    model: {
      type: ENUM,
      values: ['Model S', 'Model 3', 'Model X', 'Model Y'],
    },
    trim: STR,
    color: STR,
    year: INT,
    odometer: INT,
    interior: STR,
    wheels: STR,
    seat_layout: INT,
    has_fsd: BOOL,
    has_acceleration_boost: BOOL,
    was_damaged: BOOL,
    city: STR,
    state: STR,
    transportation_fee: INT,
    dateAdded: DATE, // date added to inventory
    dateRemoved: DATE, // date removed from inventory(sold)
  },
  carUpdate: {
    id: {
      type: STR,
      required: true,
      primaryKey: true,
    },
    carId: {
      type: INT,
      required: true,
      foreignKey: true,
    },
    price: INT,
    date: DATE,
  },
};
