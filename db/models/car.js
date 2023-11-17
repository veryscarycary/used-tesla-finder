const sequelize = require('../sequelize');
const carSchema = require('./schema/car.js');

const Car = sequelize.define('Car', carSchema);

module.exports = Car;
