import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";
import { RedisTerms, defaultTTLInSeconds } from "../constants/redis";
import {
  serpApiToRedis,
  convertToStandardSerpAPIResults,
  removeIncompleteSerpAPIData,
  adjustHours
} from "../libs/data-conversion";
import { lowerLimitToFetchAPI } from "../constants/time-conversion";
import { loggerService } from "../modules/log";
import { APIResponse, Fixture } from "../interfaces/serp-api";
import { remindInNHours } from "../constants/time-conversion";
import { RedisFixture, RedisWithReminder } from "../interfaces/redis";

injectEnv();

const REDIS_URL = process.env.REDIS_URL;
const redisConfig = {
  redisURL: REDIS_URL
};

const customDateFormats = ["tomorrow", "today"];

export class MatchFetcher {
  private httpController: HTTP;

  constructor(private redis: RedisStorage) {
    this.httpController = new HTTP();
  }

  public async fetchAndSet(): Promise<void> {
    try {
      const existingKeyTTL = await this.redis.getTTL(RedisTerms.keyName);
      if (existingKeyTTL < lowerLimitToFetchAPI) {
        const data = await this.fetchMatchesFromAPI();
        await this.processAndStoreData(data);
      }
    } catch (e) {
      throw e;
    }
  }

  private async fetchMatchesFromAPI(): Promise<APIResponse> {
    return await this.httpController.get();
  }

  private async processAndStoreData(data: APIResponse): Promise<void> {
    let fixtures = this.handleGameSpotlight(data);
    fixtures = this.handleCustomDateFormats(fixtures);
    const completedData = removeIncompleteSerpAPIData(fixtures);
    const convertedData = serpApiToRedis(completedData);

    const matchWithReminders = this.convertToReminders(convertedData);

    await this.redis.set(
      RedisTerms.keyName,
      JSON.stringify(matchWithReminders),
      defaultTTLInSeconds
    );
  }

  private convertToReminders(data: RedisFixture[]): RedisWithReminder[] {
    return data.reduce((acc: RedisWithReminder[], c: RedisFixture) => {
      remindInNHours.forEach(hours => {
        acc.push({
          reminder_time: adjustHours("substract", hours, c.match_time),
          hours_to_match: hours,
          ...c
        });
      });
      return acc;
    }, []);
  }

  private extractFeatures(data: APIResponse): Fixture[] {
    return data.sports_results.games;
  }

  private handleGameSpotlight(data: APIResponse): Fixture[] {
    const fixtures = this.extractFeatures(data);

    const { game_spotlight } = data.sports_results;
    if (game_spotlight) {
      return [convertToStandardSerpAPIResults(game_spotlight, true), ...fixtures];
    }
    return fixtures;
  }

  private handleCustomDateFormats(fixtures: Fixture[]): Fixture[] {
    const firstMatchDate = fixtures[0]?.date?.trim();
    if (firstMatchDate && customDateFormats.includes(firstMatchDate.toLowerCase())) {
      fixtures[0] = convertToStandardSerpAPIResults(fixtures[0], false);
    }
    return fixtures;
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

// this conditional is necessary so that other files importing this
// won't execute the file immediately
if (require.main === module) {
  (async () => {
    const redisClient = new RedisStorage(redisConfig);
    await redisClient.init();

    const matchFetcher = new MatchFetcher(redisClient);

    try {
      await matchFetcher.fetchAndSet();
    } catch (e) {
      loggerService.error(
        `an error occurred when executing match fetcher cron: ${e}`
      );
      process.exit(1);
    } finally {
      loggerService.info(`Match fetcher cron executed.`);
      await redisClient.close();
    }
  })();
}
