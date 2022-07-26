import Redis from "ioredis";

import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { HTTP } from "../modules/http";
import { transformToTweetableContent } from "../libs/tweet";
import { addHours } from "../libs/data-conversion";
import { remindInNHours, Time } from "../constants/time-conversion";

const httpController = new HTTP();

injectEnv();

const { ENVIRONMENT, REDIS_URL } = process.env;

interface ITweet {
  hours_to_match: number;
  message: {
    stadium: string;
    participants: string;
    date_time: string;
    tournament: string;
  };
}

async function sendTweet(tweetContent: ITweet): Promise<void> {
  const matchSchedule = new Date(tweetContent.message.date_time);
  const contentToTransform = {
    hours_to_match: tweetContent.hours_to_match,
    stadium: tweetContent.message.stadium,
    participants: tweetContent.message.participants,
    tournament: tweetContent.message.tournament,
    date_time:
      ENVIRONMENT === "production"
        ? await addHours(Time.UTCToLocalTimezone, matchSchedule)
        : matchSchedule
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

async function subscribeMessage(channel: string): Promise<void> {
  try {
    const redisClient = new Redis(REDIS_URL);
    redisClient.subscribe(channel);
    redisClient.on("message", async (channel, message) => {
      const cleansed = JSON.parse(message);
      if (shouldSendReminder(cleansed.hours_to_match)) {
        await sendTweet(cleansed);
      }
    });
  } catch (e) {
    console.log(`an error occured when subscribing message to ${channel} `, e);
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
