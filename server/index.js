require('dotenv').config();
require('../client/index');
// require('./db/index.js');

const { getBestModelYsUnderPrice, getModelYDiff } = require('./utils');

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const MAX_PRICE = 44000;
let isFirstScrape = true;
let lastModelYs = [];

// ROUTES

app.post('/scrape', async (req, res) => {
  // retreiving Tesla Used Car Inventory
  const teslaResponse = req.body;
  const results = teslaResponse.results;

  const newModelYs = getBestModelYsUnderPrice(results, MAX_PRICE);

  console.log(newModelYs);

  if (!isFirstScrape) {
    await getModelYDiff(newModelYs, lastModelYs);
  } else {
    lastModelYs = newModelYs;
    isFirstScrape = false;
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
