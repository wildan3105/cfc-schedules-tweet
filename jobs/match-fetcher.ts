import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";
import { RedisTerms, defaultTTLInSeconds } from "../constants/redis";
import { serpApiToRedis, convertToStandardSerpAPIResults, removeIncompleteSerpAPIData } from "../libs/data-conversion";
import { lowerLimitToFetchAPI } from "../constants/time-conversion";
import { loggerService } from "../modules/log";
import { APIResponse, Fixture } from "../interfaces/serp-api";

injectEnv();

const REDIS_URL = process.env.REDIS_URL;
const redisConfig = {
  redisURL: REDIS_URL
};

const customDateFormats = ["tomorrow", "today"];

export class MatchFetcher {
  private httpController: HTTP;

  constructor(
    private redis: RedisStorage
  ) {
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
      loggerService.error(`Failed to fetch matches from SerpAPI: ${e}`);
      const error = new Error(e);
      const errorMessage = `Title: <b> ${error.name} </b> <br><br> Message: ${error.message} <br><br> Stack: ${error.stack ? error.stack : ''}`;
      await this.sendReportingEmail(errorMessage, 'Match fetcher cron');
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

    loggerService.info(`Storing ${convertedData.length} fixture(s) into redis.`)
    await this.redis.set(RedisTerms.keyName, JSON.stringify(convertedData), defaultTTLInSeconds);
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
  
  private async sendReportingEmail(content: string, title: string): Promise<void> {
    await this.httpController.sendEmail(content, title);
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
      loggerService.error(`an error occurred when executing match fetcher cron: ${e}`);
      process.exit(1);
    } finally {
      loggerService.info(`Match fetcher cron executed.`)
      await redisClient.close()
    }
  })();
}
