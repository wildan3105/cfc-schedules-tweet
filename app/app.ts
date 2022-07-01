import dotenv = require('dotenv');

dotenv.config();

import express = require('express');
import bodyParser = require('body-parser');
import { HTTP } from '../modules/http';
import { Content } from '../interfaces/tweet';
import { ok } from 'assert';

const app: express.Application = express();
app.use(bodyParser.json({ limit: '5mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

const httpController = new HTTP();

app.get('/', function (req, res) {
  res.send('root!');
});

app.post('/send', async function (req, res) {
  const content: Content = req.body.content;
  // eslint-disable-next-line no-useless-catch
  try {
    await httpController.post(content);
    res.send({
      status: 'ok'
    })
  } catch (e) {
    throw e;
  }
})

app.get('/matches', async function (req, res) {
  const result = await httpController.get();
  res.json(result.data);
});

app.listen(process.env.PORT || 3000, function () {
  console.log('App is listening on port 3000!');
});

