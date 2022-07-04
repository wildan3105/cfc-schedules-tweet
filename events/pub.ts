import { injectEnv } from '../libs/inject-env';
import { RedisStorage } from '../modules/redis';

injectEnv();

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
            message: 'ddd'
        });
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();