const dotenv = require('dotenv');

dotenv.config();

import express = require('express');
import bodyParser = require('body-parser');
import { Tweet } from '../modules/tweet';

// Create a new express application instance
const app: express.Application = express();
app.use(bodyParser.json({ limit: '5mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

const tweetController = new Tweet();

app.get('/', function (req, res) {
  res.send('root!');
});

app.post('/send', async function (req, res) {
  const content = req.body.text;
  try {
    await tweetController.sendTweet(content);
    res.send('ok!')
  } catch (e) {
    throw e;
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

