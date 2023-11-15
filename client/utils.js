const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runScriptInDevTools(script) {
  // Set up Chrome options to enable DevTools
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments('--auto-open-devtools-for-tabs');

  // Launch the browser
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions) // Set Chrome options here
    .build();

  try {
    // Navigate to a website
    await driver.get('https://www.tesla.com');

    // Execute a script in the DevTools console
    await driver.executeScript(script);

    // Optionally, you can wait for some time to see the DevTools console output
    await driver.sleep(5000); // 5 seconds
  } finally {
    // Close the browser
    // await driver.quit();
  }
};

module.exports = {
  runScriptInDevTools,
};
