
const IFTTT_KEY = process.env.IFTTT_KEY;


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
  getPriceMessage,
  getAddedMessage,
  getRemovedMessage,
  sendNotification,
};
