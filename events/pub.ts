import dotenv = require('dotenv');
import { RedisStorage } from '../modules/redis';

dotenv.config();

const redisConfig = {
    redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

interface IMessage {
    channel: string;
    message: string;
}

export async function publishMessage(body: IMessage) {
    await Redis.init();
    await Redis.publish(body.channel, body.message);
}

(async ()=> {
    try {
        await publishMessage({
            channel: 'fixtures',
            message: 'ARSCHE'
        });
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();