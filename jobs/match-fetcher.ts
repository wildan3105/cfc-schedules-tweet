import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";
import { RedisTerms, defaultTTLInSeconds } from "../constants/redis";
import { serpApiToRedis, convertToStandardSerpAPIResults, removeIncompleteSerpAPIData } from "../libs/data-conversion";
import { lowerLimitToFetchAPI } from "../constants/time-conversion";

injectEnv();

const REDIS_URL = process.env.REDIS_URL;
const redisConfig = {
  redisURL: REDIS_URL
};

const httpController = new HTTP();

class MatchFetcher {
  private redis: RedisStorage;

  constructor() {
    this.redis = new RedisStorage(redisConfig);
  }

  private async initializeRedis(): Promise<void> {
    if (!this.redis.initialized()) {
      await this.redis.init();
    }
  }

  public async fetchAndSet(): Promise<void> {
    await this.initializeRedis();
  
    const existingKeyTTL = await this.redis.getTTL(RedisTerms.keyName);
    // only fetch the serp API and set the key if current key is expiring in an hour or less
    if (existingKeyTTL < lowerLimitToFetchAPI) {
      const data = await httpController.get(); // TODO: strick-checking data type
      const fixtures = data.sports_results.games;
      const firstMatchDate = data.sports_results.games[0].date.toLocaleLowerCase().trim();
      const customDateFormats = ["tomorrow", "today"];
      let gameHighlight;
      if (data.sports_results.game_spotlight) {
        // handle game highlight and append to the result
        gameHighlight = convertToStandardSerpAPIResults(
          data.sports_results.game_spotlight,
          true
        );
        fixtures.unshift(gameHighlight);
      } else if (customDateFormats.includes(firstMatchDate)) {
        console.log(`this goes here for games with tomorrow as date`)
        const firstMatch = fixtures[0];
        fixtures[0] = convertToStandardSerpAPIResults(firstMatch, false);
      }
  
      const completedData = removeIncompleteSerpAPIData(fixtures);
      const convertedData = serpApiToRedis(completedData);
      console.log(convertedData);
      console.log(`Storing ${convertedData.length} fixture(s) into redis.`)
      await this.redis.set(RedisTerms.keyName, JSON.stringify(convertedData), defaultTTLInSeconds);
    }
  
    await this.redis.close();
  }
}

process.on("uncaughtException", e => {
  setTimeout(() => {
    console.log(`an error occured [uncaughtException]`, e);
    process.exit(1);
  }, 3000);
});

process.on("unhandledRejection", e => {
  setTimeout(() => {
    console.log(`an error occured [unhandledRejection]`, e);
    process.exit(1);
  }, 3000);
});

(async () => {
  try {
    const matchFetcher = new MatchFetcher();
    await matchFetcher.fetchAndSet();
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  } catch (e) {
    console.log(`an error occured`, e);
    process.exit(1);
  } finally {
    console.log(`Match fetcher cron executed.`)
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  }
})();
