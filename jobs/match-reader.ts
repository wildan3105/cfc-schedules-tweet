import { RedisStorage } from "../modules/redis";
import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { Time, remindInNHours } from "../constants/time-conversion";
import { calculateDateDiffsInHours } from "../libs/calculation";
import { loggerService } from "../modules/log";
import { IPublishedMessage, RedisFixture, RedisWithReminder } from "../interfaces/redis";

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
      const upcomingMatch = matches[0];
      const diffInHours = calculateDateDiffsInHours(now, upcomingMatch.reminder_time);

      if (diffInHours <= 1) {
        await this.publishMatch(upcomingMatch, upcomingMatch.hours_to_match);
        await this.removePublishedMatch(upcomingMatch);
      }
    } catch (e) {
      loggerService.error(`Failed to get matches and publish: ${JSON.stringify(e)}`);
    }
  }

  private async fetchMatches(): Promise<RedisWithReminder[]> {
    const matchData = await this.redis.get(RedisTerms.keyName);
    const parsedData: RedisWithReminder[] = JSON.parse(matchData);

    parsedData.sort((a, b) => new Date(a.reminder_time).getTime() - new Date(b.reminder_time).getTime());

    return parsedData;
  }

  private isValidMatchList(matches: RedisFixture[]): boolean {
    return Array.isArray(matches) && matches.length > 0;
  }

  private async publishMatch(match: RedisFixture, diffInHours: number): Promise<void> {
    const msg: IPublishedMessage = {
      message: match,
      hours_to_match: diffInHours
    };
    await this.redis.publish(RedisTerms.channelName, JSON.stringify(msg));
  }

  private async removePublishedMatch(match: RedisWithReminder): Promise<void> {
    const [currentTTL, matchData] = await Promise.all([
        this.redis.getTTL(RedisTerms.keyName),
        this.redis.get(RedisTerms.keyName)
    ]);

    const matches: RedisWithReminder[] = JSON.parse(matchData);
    const filteredMatches = matches.filter((f) => f.reminder_time !== match.reminder_time);

    await this.redis.set(RedisTerms.keyName, JSON.stringify(filteredMatches), currentTTL);
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
      loggerService.error(
        `An error occurred when executing match reader cron: ${JSON.stringify(e)}`
      );
      process.exit(1);
    } finally {
      loggerService.info(`Match reader cron executed.`);
      await redisClient.close();
    }
  })();
}
