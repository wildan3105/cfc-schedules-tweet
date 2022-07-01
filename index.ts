const dotenv = require('dotenv');

dotenv.config();

import { Tweet } from './tweet';

const tweetController = new Tweet();

async function main() {
  await tweetController.sendTweet('syahrun nahar')
};

main();

