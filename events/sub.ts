import Redis from "ioredis";

import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { HTTP } from "../modules/http";
import { transformToTweetableContent } from "../libs/tweet";
import { remindInNHours } from "../constants/time-conversion";

const httpController = new HTTP();

injectEnv();

interface ITweet {
  hours_to_match: number;
  message: {
    stadium: string;
    participants: string;
    date_time: string;
  };
}

async function sendTweet(tweetContent: ITweet): Promise<void> {
  const contentToTransform = {
    hours_to_match: tweetContent.hours_to_match,
    stadium: tweetContent.message.stadium,
    participants: tweetContent.message.participants + ` ${new Date()}`,
    date_time: new Date(tweetContent.message.date_time)
  };
  const transformedTweetContent = await transformToTweetableContent(contentToTransform);
  const tweetMsg = {
    text: transformedTweetContent
  };
  await httpController.post(tweetMsg);
}

function shouldSendReminder(reminder_time: number): boolean {
  if (remindInNHours.includes(reminder_time)) {
    return true;
  }
  return false;
}

async function subscribeMessage(channel: string) {
  try {
    const redisClient = new Redis(process.env.REDIS_URL);
    redisClient.subscribe(channel);
    redisClient.on("message", async (channel, message) => {
      const cleansed = JSON.parse(message);
      if (shouldSendReminder(cleansed.hours_to_match)) {
        await sendTweet(cleansed);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

(async () => {
  try {
    await subscribeMessage(RedisTerms.topicName);
  } catch (e) {
    console.log(`an error occured`, e);
    process.exit(1);
  }
})();
