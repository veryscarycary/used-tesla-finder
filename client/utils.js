const { Builder, By, logging } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runScriptInDevTools(script) {
  // Set up Chrome options
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-extensions',
    '--remote-debugging-port=9222',
    '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
  );

  // Enable browser logging
  const logPrefs = new logging.Preferences();
  logPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
  chromeOptions.setLoggingPrefs(logPrefs);

  // Launch the browser
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  try {
    // Navigate to a website
    await driver.get('https://www.tesla.com');

    // Execute a script in the DevTools console
    await driver.executeScript(script);

    // Wait for logs and any other async activity
    await driver.sleep(5000);

    // Fetch browser logs
    const logs = await driver.manage().logs().get(logging.Type.BROWSER);
    logs.forEach(entry => {
      console.log(`[${entry.level.name}] ${entry.message}`);
    });
  } finally {
    // Optionally quit the driver
    // await driver.quit();
  }
};

module.exports = {
  runScriptInDevTools,
};

// const { Builder, By } = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');
// const path = require('path');
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

// async function runScriptInDevTools(script) {
//   // Path to your custom chromedriver
//   let chromeDriverPath;
//   let chromeService;

//   // Set up Chrome options to enable DevTools
//   const chromeOptions = new chrome.Options();
//   chromeOptions.addArguments('--auto-open-devtools-for-tabs');

//   try {
//     const { stdout, stderr } = await exec('which chromedriver');
//     chromeDriverPath = stdout;

//     // Set up Chrome service with custom chromedriver
//     chromeService = new chrome.ServiceBuilder(chromeDriverPath);
//   } catch (err) {
//     console.error(
//       `INFO: Could not find a local executable for chromedriver (required for RaspberryPI, but likely not for other OS's). (${err.message}). Using the project's node_modules chromedriver instead...`
//     );
//   }


//   // Launch the browser
//   let driver = await new Builder()
//     .forBrowser('chrome')
//     .setChromeOptions(chromeOptions) // Set Chrome options here
    
//   if (chromeDriverPath) {
//     driver.setChromeService(chromeService) // Set Chrome service here
//   }

//   driver = driver.build();

//   try {
//     // Navigate to a website
//     await driver.get('https://www.tesla.com');

//     // Execute a script in the DevTools console
//     await driver.executeScript(script);

//     // Optionally, you can wait for some time to see the DevTools console output
//     await driver.sleep(5000); // 5 seconds
//   } finally {
//     // Close the browser
//     await driver.quit();
//   }
// }

module.exports = {
  runScriptInDevTools,
};
