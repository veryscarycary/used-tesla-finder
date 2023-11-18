const sequelize = require('../sequelize');
const carSchema = require('./schema/car.js');

const Car = sequelize.define('car', carSchema);

module.exports = Car;
