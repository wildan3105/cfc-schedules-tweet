import dotenv = require('dotenv');
import Redis from 'ioredis';

dotenv.config();

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
        await subscribeMessage('fixtures');
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();