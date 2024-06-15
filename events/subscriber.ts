import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { HTTP } from "../modules/http";
import { transformToTweetableContent } from "../libs/tweet";
import { RedisStorage } from "../modules/redis";
import { loggerService } from "../modules/log";
import { IPublishedMessage } from "../interfaces/redis";
import { ITweet } from "../interfaces/tweet";

injectEnv();

const { REDIS_URL } = process.env;

const redisConfig = {
  redisURL: REDIS_URL
};

export class Subscriber {
  private httpController: HTTP;

  constructor(private redis: RedisStorage) {
    this.httpController = new HTTP();
  }

  public async subscribeToChannel(channel: string): Promise<void> {
    loggerService.info(`Subscribing to ${channel} ...`);
    try {
      await this.redis.subscribe(channel);
      this.redis.on("message", this.handleMessage.bind(this));
    } catch (e) {
      loggerService.error(`An error occurred when subscribing to ${channel}: ${JSON.stringify(e)}`);
    }
  }

  private async handleMessage(_: string, message: string): Promise<void> {
    try {
      const parsedMessage: IPublishedMessage = JSON.parse(message);

      loggerService.info(`New message received: ${JSON.stringify(parsedMessage)}`);
      loggerService.info(
        `Attempting to tweet a match that's about to begin in ${parsedMessage.hours_to_match} hours`
      );

      await this.sendTweet({
        hours_to_match: parsedMessage.hours_to_match,
        message: {
          stadium: parsedMessage.message.stadium,
          participants: parsedMessage.message.participants,
          match_time: parsedMessage.message.match_time,
          tournament: parsedMessage.message.tournament
        }
      });
    } catch (e) {
      loggerService.error(`Failed to handle message: ${JSON.stringify(e)}`);
    }
  }

  private async sendTweet(tweetContent: ITweet): Promise<void> {
    const matchSchedule = new Date(tweetContent.message.match_time);
    const contentToTransform = {
      hours_to_match: tweetContent.hours_to_match,
      stadium: tweetContent.message.stadium,
      participants: tweetContent.message.participants,
      tournament: tweetContent.message.tournament,
      match_time: matchSchedule
    };
    const transformedTweetContent = transformToTweetableContent(contentToTransform);
    const tweetMsg = { text: transformedTweetContent };

    try {
      await this.httpController.post(tweetMsg);
    } catch (e) {
      loggerService.error(`Failed to send tweet: ${JSON.stringify(e)}`);
    }
  }
}

if (require.main === module) {
  (async () => {
    const redisClient = new RedisStorage(redisConfig);
    await redisClient.init();
    const subscriber = new Subscriber(redisClient);

    try {
      await subscriber.subscribeToChannel(RedisTerms.channelName);
    } catch (e) {
      loggerService.error(`an error occured: ${JSON.stringify(e)}`);
      process.exit(1);
    }
  })();
}
