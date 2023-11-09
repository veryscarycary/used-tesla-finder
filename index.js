require("dotenv").config();

const axios = require("axios");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const _ = require("lodash");

const IFTTT_KEY = process.env.IFTTT_KEY;

let teslaCookie = "";
let lastModelYs = [];

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

const fetchModelYsFromTesla = async () => {
  const url =
    "https://www.tesla.com/inventory/api/v1/inventory-results?query=%7B%22query%22%3A%7B%22model%22%3A%22my%22%2C%22condition%22%3A%22used%22%2C%22options%22%3A%7B%22TRIM%22%3A%5B%22PAWD%22%2C%22LRAWD%22%5D%2C%22PAINT%22%3A%5B%22SILVER%22%5D%2C%22INTERIOR%22%3A%5B%22PREMIUM_BLACK%22%5D%2C%22VehicleHistory%22%3A%5B%22CLEAN%22%5D%2C%22AUTOPILOT%22%3A%5B%22AUTOPILOT_FULL_SELF_DRIVING%22%5D%2C%22ADL_OPTS%22%3A%5B%22ACCELERATION_BOOST%22%5D%7D%2C%22arrangeby%22%3A%22Price%22%2C%22order%22%3A%22asc%22%2C%22market%22%3A%22US%22%2C%22language%22%3A%22en%22%2C%22super_region%22%3A%22north%20america%22%2C%22lng%22%3A-117.1558867%2C%22lat%22%3A32.8256427%2C%22zip%22%3A%2292111%22%2C%22range%22%3A0%2C%22region%22%3A%22CA%22%7D%2C%22offset%22%3A0%2C%22count%22%3A50%2C%22outsideOffset%22%3A0%2C%22outsideSearch%22%3Afalse%7D";

  const headers = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "sec-ch-ua":
      '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    Referer:
      "https://www.tesla.com/inventory/used/my?TRIM=PAWD,LRAWD&PAINT=SILVER&INTERIOR=PREMIUM_BLACK&VehicleHistory=CLEAN&AUTOPILOT=AUTOPILOT_FULL_SELF_DRIVING&ADL_OPTS=ACCELERATION_BOOST&arrangeby=plh&zip=92111",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  if (teslaCookie) {
    headers.cookie = teslaCookie;
  }

  let response;
  try {
    response = await axios.get(url, { headers });
  } catch (error) {
    console.error(
      "Error making the Tesla Used Car Inventory request:",
      error.message
    );
  }

  const setCookieHeader = response.headers["set-cookie"];

  if (setCookieHeader) {
    const newCookieValue = setCookieHeader[0].split(";")[0];
    teslaCookie = newCookieValue;
  } else {
    console.error("No Set-Cookie header found in the response.");
  }
};

async function getBestModelYsUnderPrice(price) {
  const response = await fetchModelYsFromTesla();

  let results = response.results;
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
  lastModelYs = await getBestModelYsUnderPrice(44000);
  console.log(lastModelYs);
})();

setInterval(async function () {
  const newestModelYs = await getBestModelYsUnderPrice(44000);
  console.log(newestModelYs);

  await getModelYDiff(newestModelYs);
}, 1000 * 60 * 5); // every 5 minutes
