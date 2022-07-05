/*
- goal(s):
    - get the 1st key-value in redis
    - call publisher
- period of running: hourly
- cron syntax: 0 * * * *
*/
import { RedisStorage } from '../modules/redis';
import { publishMessage } from '../events/pub';
import { injectEnv } from '../libs/inject-env';
import { RedisTerms } from '../constants/redis';

injectEnv();

const redisConfig = {
    redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

async function getMatches() {
    await Redis.init();
    const matches = JSON.parse(await Redis.get(RedisTerms.keyName));

    await publishMessage({
        channel: 'fixtures',
        message: JSON.stringify(matches)
    });
}

(async ()=> {
    try {
        await getMatches();
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();