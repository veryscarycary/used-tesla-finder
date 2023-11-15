const { runScriptInDevTools } = require('./utils');

const devToolsScript = `

const sendToServer = async (route, payload) => {
  const url = 'http://localhost:3000' + route;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

const fetchModelYsFromTesla = async () => {
  const url =
    'https://www.tesla.com/inventory/api/v4/inventory-results?query=%7B%22query%22%3A%7B%22model%22%3A%22my%22%2C%22condition%22%3A%22used%22%2C%22options%22%3A%7B%22TRIM%22%3A%5B%22PAWD%22%2C%22LRAWD%22%5D%2C%22PAINT%22%3A%5B%22SILVER%22%5D%2C%22INTERIOR%22%3A%5B%22PREMIUM_BLACK%22%5D%2C%22VehicleHistory%22%3A%5B%22CLEAN%22%5D%2C%22AUTOPILOT%22%3A%5B%22AUTOPILOT_FULL_SELF_DRIVING%22%5D%7D%2C%22arrangeby%22%3A%22Price%22%2C%22order%22%3A%22asc%22%2C%22market%22%3A%22US%22%2C%22language%22%3A%22en%22%2C%22super_region%22%3A%22north%20america%22%2C%22lng%22%3A-117.1558867%2C%22lat%22%3A32.8256427%2C%22zip%22%3A%2292111%22%2C%22range%22%3A0%2C%22region%22%3A%22CA%22%7D%2C%22offset%22%3A0%2C%22count%22%3A50%2C%22outsideOffset%22%3A0%2C%22outsideSearch%22%3Afalse%7D';

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
    referrer:
      'https://www.tesla.com/inventory/used/my?TRIM=PAWD,LRAWD&PAINT=SILVER&INTERIOR=PREMIUM_BLACK&VehicleHistory=CLEAN&AUTOPILOT=AUTOPILOT_FULL_SELF_DRIVING&arrangeby=plh&zip=92111',
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
    console.log(response, 'Date: ' + new Date());

    await sendToServer('/scrape', response);
  } catch (error) {
    console.error(
      'Error making the Tesla Used Car Inventory request:',
      error.message
    );
    await sendToServer('/client-failure', { message: error.message });
  }

  return response;
};


await fetchModelYsFromTesla();

setInterval(async function () {
  await fetchModelYsFromTesla();
}, 1000 * 30); // every 5 minutes;

`;

// Run the function
runScriptInDevTools(devToolsScript);