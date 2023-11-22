// const {
//   updateCarAsRemovedFromDb,
//   updatePriceOfCarInDb,
// } = require('../db/utils.js');

const IFTTT_KEY = process.env.IFTTT_KEY;

const differenceBy = (arr1, arr2, iteratee) => {
  if (typeof iteratee === 'string') {
    const prop = iteratee;
    iteratee = (item) => item[prop];
  }
  return arr1.filter((c) => !arr2.map(iteratee).includes(iteratee(c)));
};

// const getModelYDiff = async (newestModelYs, lastModelYs) => {
//   // detect added/removed used inventory
//   const addedModelYs = differenceBy(newestModelYs, lastModelYs, 'VIN');
//   const removedModelYs = differenceBy(lastModelYs, newestModelYs, 'VIN');

//   if (addedModelYs.length) {
//     console.log('Added Model Ys:', addedModelYs);
//     const addedMessage = getAddedMessage(addedModelYs);
//     await sendNotification(addedMessage, addedModelYs);
//   }

//   if (removedModelYs.length) {
//     console.log('Removed Model Ys:', removedModelYs);
//     const removedMessage = getRemovedMessage(removedModelYs);
//     await sendNotification(removedMessage, removedModelYs);

//     for (const carDTO of removedModelYs) {
//       await updateCarAsRemovedFromDb(carDTO);
//     }
//   }

//   for (const newCar of newestModelYs) {
//     const matchingCar = lastModelYs.find(
//       (lastCar) => lastCar.VIN === newCar.VIN
//     );
//     if (matchingCar) {
//       if (matchingCar.Price !== newCar.Price) {
//         const priceChangeMessage = getPriceMessage(
//           matchingCar.Price,
//           newCar.Price
//         );
//         await sendNotification(priceChangeMessage, newCar);
//         await updatePriceOfCarInDb(newCar);
//       }
//     }
//   }
// };

const getRemovedMessage = (removedModelYs) => {
  const count = removedModelYs.length > 1 ? removedModelYs.length : 'A';
  const pluralS = removedModelYs.length > 1 ? 's' : '';
  const haveHas = removedModelYs.length > 1 ? 'have' : 'has';
  return (
    count +
    ' Model Y' +
    pluralS +
    ' ' +
    haveHas +
    ' been removed from inventory'
  );
};

const getAddedMessage = (addedModelYs) => {
  const count = addedModelYs.length > 1 ? addedModelYs.length : 'A';
  const pluralS = addedModelYs.length > 1 ? 's' : '';
  const haveHas = addedModelYs.length > 1 ? 'have' : 'has';
  return (
    count +
    ' Model Y' +
    pluralS +
    ' ' +
    haveHas +
    ' been added to the inventory'
  );
};

const getPriceMessage = (lastModelYPrice, newModelYPrice) =>
  'A Model Y changed price from $' + lastModelYPrice + ' to $' + newModelYPrice;

const sendNotification = async (message, diffedCars) => {
  const url = `https://maker.ifttt.com/trigger/send_tesla_text/with/key/${IFTTT_KEY}`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value1: message,
        value2: diffedCars,
      }),
    });

    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error while sending notification:', error);
  }
};

module.exports = {
  differenceBy,
  getPriceMessage,
  getAddedMessage,
  getRemovedMessage,
  // getModelYDiff,
  sendNotification,
};
