const sequelize = require('../sequelize');
const carUpdateSchema = require('./schema/carUpdate.js');

const CarUpdate = sequelize.define('carUpdate', carUpdateSchema);

module.exports = CarUpdate;
