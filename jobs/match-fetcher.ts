/*
- goal(s):
    - call Serp API
    - set the key-value in redis
- period of running: monthly
- cron syntax: 0 0 1 * *
*/

import { injectEnv } from '../libs/inject-env';
import { HTTP } from '../modules/http';
import { RedisStorage } from '../modules/redis';

injectEnv();

const redisConfig = {
    redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

const httpController = new HTTP();

async function fetchAndSet() {
    await Redis.init();
    const data = await httpController.get();
    const games = data.data.sports_results.games;

    await Redis.set('matches', JSON.stringify(games));
    await Redis.close();
}

/**
 * Self executing anonymous function using TS.
 */
 (async ()=> {
    try {
        const data = await fetchAndSet();
        console.log(data)
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();