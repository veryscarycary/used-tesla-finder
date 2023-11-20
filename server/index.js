require('dotenv').config();
require('../db/index.js');
require('../client/index.js');

const { getBestModelYsUnderPrice, sendNotification } = require('./utils.js');
const { handleCarsDiff } = require('../db/utils.js');

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const MAX_PRICE = 44000;

// ROUTES

// Create a new example
// app.post('/create', async (req, res) => {
//   try {
//     const newExample = await Car.create({ model: 'Model Y', odometer: 123000 });
//     res.json(newExample);
//   } catch (error) {
//     console.error('Error creating example', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.post('/scrape', async (req, res) => {
  // retreiving Tesla Used Car Inventory
  const teslaResponse = req.body;
  const results = teslaResponse.results;

  const newModelYs = getBestModelYsUnderPrice(results, MAX_PRICE);

  console.log(newModelYs, `Date: ${new Date()}`);

  await handleCarsDiff(newModelYs);
});

app.post('/client-failure', async (req, res) => {
  const { message } = req.body;
  const errorMessage = `Client error encountered: ${message}`;
  console.error(errorMessage);
  await sendNotification(errorMessage);
});

app.get('/health', async (req, res) => {
  res.send('healthy');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
