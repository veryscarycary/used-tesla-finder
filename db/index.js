'use strict';
const chalk = require('chalk');
const sequelize = require('sequelize');
const pg = require('pg');
const uris = require('./urls.js');
const schema = require('./schema.js');
const DEFAULT_DATA = require('../data/default.json');


let sequelize = (module.exports.sequelize = new sequelize(uris.database, {
  logging: false, //set true to see SQL in terminal
}));

//table definitions
let Car = (module.exports.ticket = sequelize.define(
  'car',
  schema.car
));
let CarUpdate = (module.exports.carUpdate = sequelize.define(
  'car_update',
  schema.carUpdate
));
Car.hasMany(CarUpdate, {
  as: 'carUpdates',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
//----server initialization----
//server will overwrite defaults each time its launched
sequelize
  .authenticate()
  .then(() => {
    let conflicts = 0,
      creations = 0,
      errors = 0,
      done = 0;
    console.log(
      chalk.green('Database connected.') +
        chalk.cyan('\nLoading default data...')
    );
    Car.sync({ force: true }).then(() =>
      CarUpdate.sync({ force: true }).then(() =>
        Promise.all(
          DEFAULT_DATA.map((jsonItem, i, a) => {
            let updates = [];
            if (Array.isArray(jsonItem.carUpdates)) {
              updates = jsonItem.carUpdates.slice();
              delete jsonItem.carUpdates;
            }
            return Car.create(jsonItem).then((data) =>
              CarUpdate.bulkCreate(
                updates.map((carUpdateId) => ({
                  carId: data.id,
                  carUpdateId: carUpdateId,
                  id: `T${data.id}A${carUpdateId}`,
                }))
              )
            );
          })
        ).then((loads) =>
          console.log(
            chalk.green(`Load complete. `) +
              chalk.magenta(`${loads.length} records loaded.`)
          )
        )
      )
    );
  })
  .catch((err) => console.log(chalk.red(err.name + ' ' + err.message)));
