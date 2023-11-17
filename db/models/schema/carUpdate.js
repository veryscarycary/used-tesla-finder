'use strict';
const { DataTypes } = require('sequelize');
const STR = DataTypes.STRING; //varchar(255)
const DATE = DataTypes.DATE; //Timestamp with time zone
const INT = DataTypes.INTEGER; //tinyint(1)

const carUpdateSchema = {
  // id: {
  //   type: STR,
  //   required: true,
  //   primaryKey: true,
  // },
  // carId: {
  //   type: INT,
  //   required: true,
  //   foreignKey: true,
  // },
  price: INT,
  date: DATE,
};

module.exports = carUpdateSchema;