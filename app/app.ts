import dotenv = require('dotenv');

dotenv.config();

import express = require('express');
import bodyParser = require('body-parser');
import { Tweet } from '../modules/tweet';
import { Content } from '../interfaces/tweet';

const app: express.Application = express();
app.use(bodyParser.json({ limit: '5mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

const tweetController = new Tweet();

app.get('/', function (req, res) {
  res.send('root!');
});

app.post('/send', async function (req, res) {
  const content: Content = req.body.content;
  // eslint-disable-next-line no-useless-catch
  try {
    await tweetController.sendTweet(content);
    res.send({
      status: 'ok'
    })
  } catch (e) {
    throw e;
  }
})

app.listen(process.env.PORT || 3000, function () {
  console.log('App is listening on port 3000!');
});

