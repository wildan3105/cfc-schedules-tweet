import Redis from "ioredis";

import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { HTTP } from "../modules/http";
import { transformToTweetableContent } from "../libs/tweet";
import { addHours } from "../libs/data-conversion";
import { remindInNHours, Time } from "../constants/time-conversion";
import { RedisStorage } from "../modules/redis";

const httpController = new HTTP();

injectEnv();

const { ENVIRONMENT, REDIS_URL } = process.env;

const redisConfig = {
  redisURL: REDIS_URL
};

interface ITweet {
  hours_to_match: number;
  message: {
    stadium: string;
    participants: string;
    date_time: string;
    tournament: string;
  };
}

class Subscriber {
  private redis: RedisStorage;

  constructor() {
    this.redis = new RedisStorage(redisConfig);
  }

  private async initializeRedis(): Promise<void> {
    if (!this.redis.initialized()) {
      await this.redis.init();
    }
  }

  private async sendTweet(tweetContent: ITweet): Promise<void> {
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
  
  private shouldSendReminder(reminder_time: number): boolean {
    if (remindInNHours.includes(reminder_time)) {
      return true;
    }
    return false;
  }
  
  public async subscribeMessage(channel: string): Promise<void> {
    try {
      await this.initializeRedis();
      await this.redis.subscribe(channel);
      this.redis.on("message", async (_, message) => {
        const cleansed = JSON.parse(message);
        if (this.shouldSendReminder(cleansed.hours_to_match)) {
          await this.sendTweet(cleansed);
        }
      });
    } catch (e) {
      console.log(`an error occured when subscribing message to ${channel} `, e);
    }
  }
}

(async () => {
  try {
    const subscriber = new Subscriber();
    await subscriber.subscribeMessage(RedisTerms.channelName);
  } catch (e) {
    console.log(`an error occured`, e);
    process.exit(1);
  }
})();
