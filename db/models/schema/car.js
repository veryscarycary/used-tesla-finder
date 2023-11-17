'use strict';
const { DataTypes } = require('sequelize');
const STR = DataTypes.STRING; //varchar(255)
const BOOL = DataTypes.BOOLEAN; //tinyint(1)
const DATE = DataTypes.DATE; //Timestamp with time zone
const INT = DataTypes.INTEGER; //tinyint(1)
const ENUM = DataTypes.ENUM; //enumerated

const carSchema = {
  // id: {
  //   type: INT,
  //   autoIncrement: true,
  //   unique: true,
  //   required: true,
  //   primaryKey: true,
  // },
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
};

module.exports = carSchema;
