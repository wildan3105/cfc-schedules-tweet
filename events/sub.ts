import Redis from "ioredis";

import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { HTTP } from "../modules/http";

const httpController = new HTTP();

injectEnv();

async function sendTweet(content): Promise<void> {
  // call `sendTweet` here
  await httpController.post(content);
}

function routeReminder(): void {
  // only send tweet for H-24 & H-1
  // TODO: timezone conversion here
  return;
}

async function subscribeMessage(channel: string) {
  try {
    const redisClient = new Redis(process.env.REDIS_URL);
    redisClient.subscribe(channel);
    redisClient.on("message", async (channel, message) => {
      const cleansed = JSON.parse(message);
      const tweetMsg = {
        text: cleansed.participants
      };
      await sendTweet(tweetMsg);
      // send a tweet
    });
  } catch (e) {
    console.log(e);
  }
}

(async () => {
  try {
    await subscribeMessage(RedisTerms.topicName);
  } catch (e) {
    console.log(`error is`, e);
    process.exit(1);
  }
})();
