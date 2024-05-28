import { RedisStorage } from "../modules/redis";
import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { Time } from "../constants/time-conversion";
import { calculateDateDiffsInHours } from "../libs/calculation";
import { loggerService } from "../modules/log";
import { IPublishedMessage, RedisFixture } from "../interfaces/redis";

injectEnv();

const REDIS_URL = process.env.REDIS_URL;
const redisConfig = {
  redisURL: REDIS_URL
};

export class MatchReader {
  constructor(private redis: RedisStorage) {}

  public async getMatchesAndPublish(): Promise<void> {
    try {
      const matches = await this.fetchMatches();
      if (!this.isValidMatchList(matches)) {
        loggerService.warn(`Nothing to read from redis. Exit early`);
        return;
      }

      const now = new Date();
      const upcomingMatch = new Date(matches[0].date_time);
      const diffInHours = calculateDateDiffsInHours(now, upcomingMatch);

      loggerService.info(`Upcoming match ${JSON.stringify(matches[0])} will be played in ${diffInHours} hour(s)`);

      if (diffInHours <= Time.hoursInADay) {
        await this.publishMatch(matches[0], diffInHours);

        if (diffInHours === 1) {
          await this.removePublishedMatch(matches);
        }
      }
    } catch (e) {
      loggerService.error(`Failed to get matches and publish: ${JSON.stringify(e)}`);
    }
  }

  private async fetchMatches(): Promise<RedisFixture[]> {
    const matchData = await this.redis.get(RedisTerms.keyName);
    return JSON.parse(matchData);
  }

  private isValidMatchList(matches: RedisFixture[]): boolean {
    return Array.isArray(matches) && matches.length > 0;
  }

  private async publishMatch(match: RedisFixture, diffInHours: number): Promise<void> {
    const msg: IPublishedMessage = {
      message: match,
      hours_to_match: diffInHours,
    };
    await this.redis.publish(RedisTerms.channelName, JSON.stringify(msg));
  }

  private async removePublishedMatch(matches: RedisFixture[]): Promise<void> {
    matches.shift();
    const currentTTL = await this.redis.getTTL(RedisTerms.keyName);
    await this.redis.set(RedisTerms.keyName, JSON.stringify(matches), currentTTL);
  }
}

const handleUncaughtException = (e: Error) => {
  setTimeout(() => {
    loggerService.error(`An error occurred [uncaughtException]: ${JSON.stringify(e)}`);
    process.exit(1);
  }, 3000);
};

const handleUnhandledRejection = (e: Error) => {
  setTimeout(() => {
    loggerService.error(`An error occurred [unhandledRejection]: ${JSON.stringify(e)}`);
    process.exit(1);
  }, 3000);
};

process.on("uncaughtException", handleUncaughtException);
process.on("unhandledRejection", handleUnhandledRejection);

if (require.main === module) {
  (async () => {
    const redisClient = new RedisStorage(redisConfig);
    await redisClient.init();

    const matchReader = new MatchReader(redisClient);

    try {
      await matchReader.getMatchesAndPublish();
    } catch (e) {
      loggerService.error(`An error occurred when executing match reader cron: ${JSON.stringify(e)}`);
      process.exit(1);
    } finally {
      loggerService.info(`Match reader cron executed.`);
      await redisClient.close();
    }
  })();
}
