const sequelize = require('../sequelize');
const carUpdateSchema = require('./schema/carUpdate.js');

const CarUpdate = sequelize.define('CarUpdate', carUpdateSchema);

module.exports = CarUpdate;
