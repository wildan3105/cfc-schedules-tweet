import { injectEnv } from '../libs/inject-env';
import Redis from 'ioredis';

injectEnv();

async function subscribeMessage(channel: string) {
    try {
        const redisClient = new Redis(process.env.REDIS_URL);
        redisClient.subscribe(channel);
        redisClient.on('message', (channel, message) => {
            console.log(channel, message);
        })
    } catch (e) {
        console.log(e);
    }
}

(async ()=> {
    try {
        console.log(process.env.REDIS_URL)
        await subscribeMessage('fixtures');
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();