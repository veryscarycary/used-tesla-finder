require('dotenv').config();

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const _ = require("lodash");

const IFTTT_KEY = process.env.IFTTT_KEY;

const getRemovedMessage = (removedModelYs) =>
  `${removedModelYs.length > 1 ? removedModelYs.length : "A"} Model Y${
    removedModelYs.length > 1 ? "s" : ""
  } ha${removedModelYs.length > 1 ? "ve" : "s"} been removed from inventory`;

const getAddedMessage = (addedModelYs) =>
  `${addedModelYs.length > 1 ? addedModelYs.length : "A"} Model Y${
    addedModelYs.length > 1 ? "s" : ""
  } ha${addedModelYs.length > 1 ? "ve" : "s"} been added to the inventory`;

const getPriceMessage = (lastModelYPrice, newModelYPrice) =>
  `A Model Y changed price from $${lastModelYPrice} to $${newModelYPrice}`;

const getCurl = (message, diffedCars) => {
  const escapedMessage = JSON.stringify({
    value1: message,
    value2: diffedCars,
  });
  return `curl -X POST -H "Content-Type: application/json" -d '${escapedMessage}' https://maker.ifttt.com/trigger/send_tesla_text/with/key/${IFTTT_KEY}`;
};

let lastModelYs = [];

async function getBestModelYsUnderPrice(price) {
  // Define the curl command
  const curlCommand = `curl 'https://www.tesla.com/inventory/api/v1/inventory-results?query=%7B%22query%22%3A%7B%22model%22%3A%22my%22%2C%22condition%22%3A%22used%22%2C%22options%22%3A%7B%22TRIM%22%3A%5B%22LRAWD%22%2C%22PAWD%22%5D%2C%22PAINT%22%3A%5B%22SILVER%22%5D%2C%22WHEELS%22%3A%5B%22NINETEEN%22%2C%22TWENTY_ONE%22%2C%22TWENTY%22%5D%2C%22VehicleHistory%22%3A%5B%22CLEAN%22%5D%2C%22AUTOPILOT%22%3A%5B%22AUTOPILOT_FULL_SELF_DRIVING%22%5D%2C%22ADL_OPTS%22%3A%5B%22ACCELERATION_BOOST%22%5D%7D%2C%22arrangeby%22%3A%22Price%22%2C%22order%22%3A%22asc%22%2C%22market%22%3A%22US%22%2C%22language%22%3A%22en%22%2C%22super_region%22%3A%22north%20america%22%2C%22lng%22%3A-117.1558867%2C%22lat%22%3A32.8256427%2C%22zip%22%3A%2292111%22%2C%22range%22%3A0%2C%22region%22%3A%22CA%22%7D%2C%22offset%22%3A0%2C%22count%22%3A50%2C%22outsideOffset%22%3A0%2C%22outsideSearch%22%3Afalse%7D' \
  -H 'authority: www.tesla.com' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'referer: https://www.tesla.com/inventory/used/my?TRIM=LRAWD,PAWD&PAINT=SILVER&WHEELS=NINETEEN,TWENTY_ONE,TWENTY&VehicleHistory=CLEAN&AUTOPILOT=AUTOPILOT_FULL_SELF_DRIVING&ADL_OPTS=ACCELERATION_BOOST&arrangeby=plh&zip=92111' \
  -H 'sec-ch-ua: "Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36' \
  --compressed`;

  try {
    const { stdout, stderr } = await exec(curlCommand);

    let results = JSON.parse(stdout).results;

    results = results.filter((car) => car.TransportationFee === 0);

    if (price) {
      results = results.filter((car) => car.Price <= price);
    }

    const mappedResults = results.map(
      ({
        DamageDisclosure,
        HasDamagePhotos,
        MetroName,
        Odometer,
        Price,
        TrimName,
        VrlName,
        VIN,
      }) => ({
        Price,
        MetroName,
        VrlName,
        Odometer,
        TrimName,
        DamageDisclosure,
        HasDamagePhotos,
        VIN,
      })
    );

    return mappedResults;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function getModelYDiff(newestModelYs) {
  // detect added/removed used inventory
  const addedModelYs = _.differenceBy(newestModelYs, lastModelYs, "VIN");
  const removedModelYs = _.differenceBy(lastModelYs, newestModelYs, "VIN");

  if (addedModelYs.length) {
    console.log("Added Model Ys:", addedModelYs);
    const addedMessage = getAddedMessage(addedModelYs);
    const addedCurl = getCurl(addedMessage, addedModelYs);
    await exec(addedCurl);
  }

  if (removedModelYs.length) {
    console.log("Removed Model Ys:", removedModelYs);
    const removedMessage = getRemovedMessage(removedModelYs);
    const removedCurl = getCurl(removedMessage, removedModelYs);
    await exec(removedCurl);
  }

  for (const newCar of newestModelYs) {
    const matchingCar = lastModelYs.find(
      (lastCar) => lastCar.VIN === newCar.VIN
    );
    if (matchingCar) {
      if (matchingCar.Price !== newCar.Price) {
        const priceChangeMessage = getPriceMessage(
          matchingCar.Price,
          newCar.Price
        );
        const priceChangeCurl = getCurl(priceChangeMessage, newCar);
        await exec(priceChangeCurl);
      }
    }
  }

  lastModelYs = newestModelYs;
}

// first, populate lastModelYs
(async function () {
  try {
    lastModelYs = await getBestModelYsUnderPrice(44000);
    console.log(lastModelYs);
  } catch (err) {
    console.error(`getBestModelYsUnderPrice failed: ${err}`);
    return;
  }
})();

setInterval(async function () {
  let newestModelYs;
  try {
    newestModelYs = await getBestModelYsUnderPrice(44000);
    console.log(newestModelYs);
  } catch (err) {
    console.error(`getBestModelYsUnderPrice failed: ${err}`);
    return;
  }
  await getModelYDiff(newestModelYs);
}, 1000 * 60 * 5); // every 5 minutes
