const { Sequelize } = require('sequelize');
const { DB_USER, DB_PASS } = require('./dbAuth.js');
const DB_NAME = 'inventory';
const HOST = 'localhost';
const DIALECT = 'postgres';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: HOST,
  dialect: DIALECT,
  define: {
    underscored: true,
  },
  logging: false // set true to see SQL statements in terminal
});

module.exports = sequelize;
