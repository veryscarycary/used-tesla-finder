'use strict';
const { DataTypes } = require('sequelize');
const INT = DataTypes.INTEGER; //tinyint(1)

const carUpdateSchema = {
  price: INT,
};

module.exports = carUpdateSchema;