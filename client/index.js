const { runScriptInDevTools } = require('./utils');

const devToolsScript = `

const sendToServer = async (route, payload) => {
  const url = 'http://localhost:3000' + route;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Connection: 'close',
    },
    body: JSON.stringify(payload),
  });
};

// WARNING: This is not a drop in replacement solution and
// it might not work for some edge cases. Test your code!
const unionBy = (arr, ...args) => {
  let iteratee = args.pop();
  if (typeof iteratee === 'string') {
    const prop = iteratee;
    iteratee = (item) => item[prop];
  }

  return arr
    .concat(...args)
    .filter(
      (x, i, self) => i === self.findIndex((y) => iteratee(x) === iteratee(y))
    );
};

const mapModelYs = (results) => {
  const mappedResults = results.map(
    ({
      ADL_OPTS,
      AUTOPILOT,
      City,
      CABIN_CONFIG,
      DamageDisclosure,
      HasDamagePhotos,
      INTERIOR,
      Model,
      Odometer,
      OriginalInCustomerGarageDate,
      PAINT,
      Price,
      StateProvince,
      TrimName,
      TransportationFee,
      VrlName,
      VIN,
      WHEELS,
      Year,
    }) => ({
      Price,
      Model,
      Year,
      City,
      StateProvince,
      VrlName,
      Odometer,
      TransportationFee,
      TrimName,
      AUTOPILOT,
      ADL_OPTS,
      PAINT,
      INTERIOR,
      DamageDisclosure,
      HasDamagePhotos,
      OriginalInCustomerGarageDate,
      CABIN_CONFIG,
      WHEELS,
      VIN,
    })
  );

  return mappedResults;
};

const fetchModelYsFromTesla = async (results = []) => {
  const url =
    'https://www.tesla.com/inventory/api/v4/inventory-results?query=%7B%22query%22%3A%7B%22model%22%3A%22my%22%2C%22condition%22%3A%22used%22%2C%22options%22%3A%7B%7D%2C%22arrangeby%22%3A%22Price%22%2C%22order%22%3A%22asc%22%2C%22market%22%3A%22US%22%2C%22language%22%3A%22en%22%2C%22super_region%22%3A%22north%20america%22%2C%22lng%22%3A-117.1558867%2C%22lat%22%3A32.8256427%2C%22zip%22%3A%2292111%22%2C%22range%22%3A0%2C%22region%22%3A%22CA%22%7D%2C%22offset%22%3A' +
    results.length +
    '%2C%22count%22%3A50%2C%22outsideOffset%22%3A0%2C%22outsideSearch%22%3Afalse%2C%22isFalconDeliverySelectionEnabled%22%3Afalse%2C%22version%22%3Anull%7D';

  const headers = {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'sec-ch-ua':
        '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
    referrer: 'https://www.tesla.com/inventory/used/my?arrangeby=plh&zip=92111',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
  };

  let resp;
  let response;
  try {
    resp = await fetch(url, headers);
    response = await resp.json();
    results = results.concat(mapModelYs(response.results));
  } catch (error) {
    console.error(
      'Error making the Tesla Used Car Inventory request:',
      error.message
    );
    await sendToServer('/client-failure', { message: error.message });
  }

  const totalMatchesFound = Number(response.total_matches_found);

  // increase the offset and fetch more cars
  if (totalMatchesFound && results.length < totalMatchesFound) {
    response = fetchModelYsFromTesla(results);
  } else {
    response.results = results;
  }

  return response;
};

const fetchAllModelYs = async () => {
  const response = await fetchModelYsFromTesla();
  console.log('Fetched ' + response.results.length + ' results @ Date: ' + new Date());

  if (response.results.length) {
    try {
      await sendToServer('/scrape', response);
    } catch (error) {
      console.error('Error sending mapped Teslas to server:', error.message);
      await sendToServer('/client-failure', { message: error.message });
    }
  }
};

fetchAllModelYs();

setInterval(async function () {
  await fetchAllModelYs();
}, 1000 * 60 * 5); // every 5 minutes;

`;

// Run the function
runScriptInDevTools(devToolsScript);
