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

injectEnv();

const redisConfig = {
    redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

// async function callPublisher(channel: string, msg: string) {
//     await Redis.publish(channel, msg);
// }

async function getMatches() {
    await Redis.init();
    const matches = JSON.parse(await Redis.get('matches'));

    setInterval(async () => {
        await publishMessage({
            channel: 'fixtures',
            message: JSON.stringify(matches)
        })
    }, 1000);
}

/**
 * Self executing anonymous function using TS.
 */
 (async ()=> {
    try {
        await getMatches();
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();