/*
- goal(s):
    - get the 1st key-value in redis
    - call publisher
- period of running: hourly
- cron syntax: 0 * * * *
*/
import dotenv = require('dotenv');

dotenv.config();

import { RedisStorage } from '../modules/redis';

const redisConfig = {
    redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

async function fetchMatches() {
    await Redis.init();
    const expectPong = await Redis.get();

    console.log(expectPong);
}

/**
 * Self executing anonymous function using TS.
 */
 (async ()=> {
    try {
        await fetchMatches();
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();