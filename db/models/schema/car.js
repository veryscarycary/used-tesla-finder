'use strict';
const { DataTypes } = require('sequelize');
const STR = DataTypes.STRING; //varchar(255)
const BOOL = DataTypes.BOOLEAN; //tinyint(1)
const DATE = DataTypes.DATE; //Timestamp with time zone
const INT = DataTypes.INTEGER; //tinyint(1)
const ENUM = DataTypes.ENUM; //enumerated

const carSchema = {
  vin: {
    type: STR,
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
  seatLayout: STR,
  hasFsd: BOOL,
  hasEap: BOOL,
  hasAccelerationBoost: BOOL,
  hasTowHitch: BOOL,
  wasDamaged: BOOL,
  isAvailable: BOOL,
  city: STR,
  state: STR,
  storeName: STR,
  transportationFee: INT,
  originalInCustomerGarageDate: DATE,
  dateAdded: DATE, // date added to inventory
  dateRemoved: DATE, // date removed from inventory(sold)
};

module.exports = carSchema;