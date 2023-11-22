require('dotenv').config();
require('../db/index.js');
require('../client/index.js');

const { sendNotification, mapModelYs } = require('./utils.js');
const { handleCarsDiff } = require('../db/utils.js');

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// ROUTES

app.post('/scrape', async (req, res) => {
  // retreiving Tesla Used Car Inventory
  const teslaResponse = req.body;
  const results = teslaResponse.results;

  const newModelYs = mapModelYs(results);

  console.log(`${newModelYs.length} Model Ys pulled from Tesla @ Date: ${new Date()}`);

  await handleCarsDiff(newModelYs);

  res.set('Connection', 'close'); // close connection because requests eventually queue/block
  res.status(200).send('OK');
});

app.post('/client-failure', async (req, res) => {
  const { message } = req.body;
  const errorMessage = `Client error encountered: ${message}`;
  console.error(errorMessage);
  await sendNotification(errorMessage);
  res.status(200).send('OK');
});

app.get('/health', async (req, res) => {
  console.log('healthy');
  res.status(200).send('healthy');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
