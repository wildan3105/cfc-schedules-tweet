import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { HTTP } from "../modules/http";
import { transformToTweetableContent } from "../libs/tweet";
import { remindInNHours } from "../constants/time-conversion";
import { RedisStorage } from "../modules/redis";
import { loggerService } from "../modules/log";

injectEnv();

const { REDIS_URL } = process.env;

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
  private httpController: HTTP;

  constructor(
    private redis: RedisStorage
  ) {
    this.httpController = new HTTP();
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
      date_time: matchSchedule
    };
    const transformedTweetContent = transformToTweetableContent(contentToTransform);
    const tweetMsg = {
      text: transformedTweetContent
    };
    await this.httpController.post(tweetMsg);
  }
  
  private shouldSendReminder(reminder_time: number): boolean {
    if (remindInNHours.includes(reminder_time)) {
      return true;
    }
    return false;
  }
  
  public async subscribeMessage(channel: string): Promise<void> {
    loggerService.info(`Subscribing to ${channel} ...`)
    try {
      await this.initializeRedis();
      await this.redis.subscribe(channel);
      this.redis.on("message", async (_, message) => {
        const cleansed = JSON.parse(message);
        loggerService.info(`New message received: ${cleansed}`);
        if (this.shouldSendReminder(cleansed.hours_to_match)) {
          loggerService.info(`This is attempting to tweet a match that's about to begin in ${cleansed.hours_to_match} hours`)
          await this.sendTweet(cleansed);
        }
      });
    } catch (e) {
      loggerService.error(`an error occured when subscribing message to ${channel}: ${e} `);
    }
  }
}

(async () => {
  try {
    const redisClient = new RedisStorage(redisConfig);
    const subscriber = new Subscriber(redisClient);
    await subscriber.subscribeMessage(RedisTerms.channelName);
  } catch (e) {
    loggerService.error(`an error occured: ${e}`);
    process.exit(1);
  }
})();
