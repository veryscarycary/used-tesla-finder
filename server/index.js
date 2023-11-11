require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

const IFTTT_KEY = process.env.IFTTT_KEY;

app.use(cors()); // Enable CORS for all routes

app.use(express.json());

app.post('/notification', async (req, res) => {
  const url = `https://maker.ifttt.com/trigger/send_tesla_text/with/key/${IFTTT_KEY}`;

  console.log(req.body);

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    res.json('Notification sent successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
