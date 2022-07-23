import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";
import { RedisTerms, defaultTTLInSeconds } from "../constants/redis";
import { serpApiToRedis } from "../libs/data-conversion";
import { lowerLimitToFetchAPI } from "../constants/time-conversion";

injectEnv();

const redisConfig = {
  redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

const httpController = new HTTP();

async function fetchAndSet(): Promise<void> {
  await Redis.init();

  const existingKeyTTL = await Redis.getTTL(RedisTerms.keyName);
  // only fetch the serp API and set the key if current key is expiring in an hour or less
  if (existingKeyTTL < 444000) {
    const data = await httpController.get();
    // TODO: need to handle game_spotlight data
    const fixtures = data.sports_results.games;

    const convertedData = await serpApiToRedis(fixtures);
    console.log(convertedData);
    await Redis.set(RedisTerms.keyName, JSON.stringify(convertedData), defaultTTLInSeconds);
  }

  await Redis.close();
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
    await fetchAndSet();
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  } catch (e) {
    console.log(`an error occured`, e);
    process.exit(1);
  }
})();
