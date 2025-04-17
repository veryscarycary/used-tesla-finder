const { Sequelize } = require('sequelize');
const DB_NAME = process.env.DB_NAME || 'inventory';
const HOST = process.env.DOCKER_COMPOSE ? 'db' : 'localhost';
const DIALECT = 'postgres';
const { DB_USER, DB_PASS } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: HOST,
  port: 5432,
  dialect: DIALECT,
  define: {
    underscored: true,
  },
  logging: false // set true to see SQL statements in terminal
});

module.exports = sequelize;
