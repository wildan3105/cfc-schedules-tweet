import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";
import { RedisTerms, defaultTTLInSeconds } from "../constants/redis";
import { serpApiToRedis, convertToStandardSerpAPIResults, removeIncompleteSerpAPIData } from "../libs/data-conversion";
import { lowerLimitToFetchAPI } from "../constants/time-conversion";
import { loggerService } from "../modules/log";
import { APIResponse } from "../interfaces/serp-api";

injectEnv();

const REDIS_URL = process.env.REDIS_URL;
const redisConfig = {
  redisURL: REDIS_URL
};

export class MatchFetcher {
  private httpController: HTTP;

  constructor(
    private redis: RedisStorage
  ) {
    this.redis = new RedisStorage(redisConfig);
    this.httpController = new HTTP();
  }

  private async initializeRedis(): Promise<void> {
    if (!this.redis.initialized()) {
      await this.redis.init();
    }
  }

  private async sendReportingEmail(content: string, title: string): Promise<void> {
    await this.httpController.sendEmail(content, title);
  }

  private async fetchMatchesFromAPI(): Promise<APIResponse> {
    const res = await this.httpController.get();
    return res;
  }

  private handleExit(): void {
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  }

  private async processAndStoreData(data: APIResponse): Promise<void> {
    const fixtures = data.sports_results.games;
    const firstMatchDate = data.sports_results.games[0]?.date?.trim();
    const customDateFormats = ["tomorrow", "today"];
    let gameSpotlight;
    if (data.sports_results.game_spotlight) {
      gameSpotlight = convertToStandardSerpAPIResults(
        data.sports_results.game_spotlight,
        true
      );
      fixtures.unshift(gameSpotlight);
    } else if (firstMatchDate && customDateFormats.includes(firstMatchDate.toLowerCase())) {
      const firstMatch = fixtures[0];
      fixtures[0] = convertToStandardSerpAPIResults(firstMatch, false);
    }
    const completedData = removeIncompleteSerpAPIData(fixtures);
    const convertedData = serpApiToRedis(completedData);

    loggerService.info(`Storing ${convertedData.length} fixture(s) into redis.`)
    await this.redis.set(RedisTerms.keyName, JSON.stringify(convertedData), defaultTTLInSeconds);

    this.handleExit();
  }

  public async fetchAndSet(): Promise<void> {
    try {
      await this.initializeRedis();

      const existingKeyTTL = await this.redis.getTTL(RedisTerms.keyName);
      if (existingKeyTTL < lowerLimitToFetchAPI) {
        const data = await this.fetchMatchesFromAPI();
        await this.processAndStoreData(data);
      }

      await this.redis.close();
    } catch (e) {
      loggerService.error(`Failed to fetch matches from SerpAPI: ${e}`);
      const error = new Error(e);
      const errorMessage = `Title: <b> ${error.name} </b> <br><br> Message: ${error.message} <br><br> Stack: ${error.stack ? error.stack : ''}`;
      await this.sendReportingEmail(errorMessage, 'Match fetcher cron');
    }
  }
}

process.on("uncaughtException", e => {
  setTimeout(() => {
    loggerService.error(`an error occurred [uncaughtException]: ${e}`);
    process.exit(1);
  }, 3000);
});

process.on("unhandledRejection", e => {
  setTimeout(() => {
    loggerService.error(`an error occurred [unhandledRejection]: ${e}`);
    process.exit(1);
  }, 3000);
});

(async () => {
  try {
    const redisClient = new RedisStorage(redisConfig);
    const matchFetcher = new MatchFetcher(redisClient);
    await matchFetcher.fetchAndSet();
  } catch (e) {
    loggerService.error(`an error occurred when executing match fetcher cron: ${e}`);
    process.exit(1);
  } finally {
    loggerService.info(`Match fetcher cron executed.`)
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  }
})();
