'use strict';
const sequelize = require('./sequelize.js'); // initialize DB connection
const createLowestPriceView = require('./views/createLowestPriceView.js');
const Car = require('./models/car.js');
const CarUpdate = require('./models/carUpdate.js');

// Define the associations
Car.hasMany(CarUpdate);
CarUpdate.belongsTo(Car); // This sets up a foreign key in CarUpdate table referencing Car table

// Sync the Sequelize models with the database
// In other words, creates the tables if they do not exist already
sequelize.sync({ force: false }).then(() => {
  console.log('Database and tables synced. Tables created if not already present.');
  // creates the lowest price view after tables are set up
  createLowestPriceView();
}).catch(err => {
  console.error(`Encountered an error while syncing: ${err}`);
});

// const chalk = require('chalk');
// const DEFAULT_DATA = require('../data/default.json');
// const sequelize = require('./sequelize.js');

/* Server initialization */
// server will overwrite defaults each time its launched
// sequelize
//   .authenticate()
//   .then(() => {
//     let conflicts = 0,
//       creations = 0,
//       errors = 0,
//       done = 0;
//     console.log(
//       chalk.green('Database connected.') +
//         chalk.cyan('\nLoading default data...')
//     );
//     Car.sync({ force: true }).then(() =>
//       CarUpdate.sync({ force: true }).then(() =>
//         Promise.all(
//           DEFAULT_DATA.map((jsonItem, i, a) => {
//             let updates = [];
//             if (Array.isArray(jsonItem.carUpdates)) {
//               updates = jsonItem.carUpdates.slice();
//               delete jsonItem.carUpdates;
//             }
//             return Car.create(jsonItem).then((data) =>
//               CarUpdate.bulkCreate(
//                 updates.map((carUpdateId) => ({
//                   carId: data.id,
//                   carUpdateId: carUpdateId,
//                   id: `T${data.id}A${carUpdateId}`,
//                 }))
//               )
//             );
//           })
//         ).then((loads) =>
//           console.log(
//             chalk.green(`Load complete. `) +
//               chalk.magenta(`${loads.length} records loaded.`)
//           )
//         )
//       )
//     );
//   })
//   .catch((err) => console.log(chalk.red(err.name + ' ' + err.message)));

module.exports = {
  Car,
  CarUpdate,
};