import Redis from 'ioredis';

import { injectEnv } from '../libs/inject-env';
import { RedisTerms } from '../constants/redis';

injectEnv();

function sendTweet(): Promise<void> { return }

function routeReminder(): Promise<void> { return }

async function subscribeMessage(channel: string) {
    try {
        const redisClient = new Redis(process.env.REDIS_URL);
        redisClient.subscribe(channel);
        redisClient.on('message', (channel, message) => {
            console.log(channel, message);
            // send a tweet
        })
    } catch (e) {
        console.log(e);
    }
}

(async ()=> {
    try {
        await subscribeMessage(RedisTerms.topicName);
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();