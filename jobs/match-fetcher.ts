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
import { RedisTerms } from '../constants/redis';
import { serpApiToRedis } from '../libs/data-conversion';

injectEnv();

const redisConfig = {
    redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

const httpController = new HTTP();

async function fetchAndSet() {
    await Redis.init();
    // const data = await httpController.get();
    // const fixtures = data.sports_results.games;
    const fixtures = [
        {
            teams: [
                {
                    name: "Chelsea"
                },
                {
                    name: "Real Madrid"
                }
            ],
            date: "Jul 20",
            time: "7:00 PM"
        },
        {
            teams: [
                {
                    name: "Tottenham"
                },
                {
                    name: "Chelsea FC"
                }
            ],
            date: "Sat, Jul 28",
            time: "8:00 PM",
            tournament: "Premier League"
        }
    ]
    const convertedData = await serpApiToRedis(fixtures);

    console.log(convertedData)

    await Redis.set(RedisTerms.keyName, JSON.stringify(convertedData));
    await Redis.close();
}

(async ()=> {
    try {
        await fetchAndSet();
    } catch(e) {
        console.log(`an error occured`, e)
        process.exit(1);
    }
})();