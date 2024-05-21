import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";
import { RedisTerms, defaultTTLInSeconds } from "../constants/redis";
import { serpApiToRedis, convertToStandardSerpAPIResults, removeIncompleteSerpAPIData } from "../libs/data-conversion";
import { lowerLimitToFetchAPI } from "../constants/time-conversion";
import { loggerService } from "../modules/log";

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

  public async fetchAndSet(): Promise<void> {
    await this.initializeRedis();
  
    const existingKeyTTL = await this.redis.getTTL(RedisTerms.keyName);
    try {
      // only fetch the serp API and set the key if current key is expiring in an hour or less
      if (existingKeyTTL < lowerLimitToFetchAPI) {
        const data = await this.httpController.get(); // TODO: strick-checking data type
        const fixtures = data.sports_results.games;
        const firstMatchDate = data.sports_results.games[0]?.date?.trim();
        const customDateFormats = ["tomorrow", "today"];
        let gameHighlight;
        if (data.sports_results.game_spotlight) {
          // handle game highlight and append to the result
          gameHighlight = convertToStandardSerpAPIResults(
            data.sports_results.game_spotlight,
            true
          );
          fixtures.unshift(gameHighlight);
        } else if (firstMatchDate && customDateFormats.includes(firstMatchDate.toLowerCase())) {
          const firstMatch = fixtures[0];
          fixtures[0] = convertToStandardSerpAPIResults(firstMatch, false);
        }
        const completedData = removeIncompleteSerpAPIData(fixtures);
        const convertedData = serpApiToRedis(completedData);

        loggerService.info(`Storing ${convertedData.length} fixture(s) into redis.`)
        await this.redis.set(RedisTerms.keyName, JSON.stringify(convertedData), defaultTTLInSeconds);
      }

      await this.redis.close();
    } catch (e) {
      loggerService.error(`Failed to fetch matches from serp API: ${e}`);
      const error = new Error(e);
      const errorMessage = `Title: <b> ${error.name} </b> <br><br> Message: ${error.message} <br><br> Stack: ${error.stack ? error.stack : ''}`;
      await this.sendReportingEmail(errorMessage, 'Match fetcher cron');
    }
  }
}

process.on("uncaughtException", e => {
  setTimeout(() => {
    loggerService.error(`an error occured [uncaughtException]: ${e}`);
    process.exit(1);
  }, 3000);
});

process.on("unhandledRejection", e => {
  setTimeout(() => {
    loggerService.error(`an error occured [unhandledRejection]: ${e}`);
    process.exit(1);
  }, 3000);
});

(async () => {
  try {
    const redisClient = new RedisStorage(redisConfig);
    const matchFetcher = new MatchFetcher(redisClient);
    await matchFetcher.fetchAndSet();
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  } catch (e) {
    loggerService.error(`an error occured when executing match fetcher cron: ${e}`);
    process.exit(1);
  } finally {
    loggerService.info(`Match fetcher cron executed.`)
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  }
})();
