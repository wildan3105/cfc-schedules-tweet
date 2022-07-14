/*
- goal(s):
    - call Serp API
    - set the key-value in redis
- period of running: monthly
- cron syntax: 0 0 1 * *
*/

import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";
import { RedisTerms, defaultTTLInSeconds } from "../constants/redis";
import { serpApiToRedis } from "../libs/data-conversion";

injectEnv();

const redisConfig = {
  redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

const httpController = new HTTP();

async function fetchAndSet(): Promise<void> {
  console.log(`start fetching upcoming matches from external API`);
  await Redis.init();

  const data = await httpController.get();
  const fixtures = data.sports_results.games;

  console.log(fixtures);

  const convertedData = await serpApiToRedis(fixtures);

  await Redis.set(RedisTerms.keyName, JSON.stringify(convertedData), defaultTTLInSeconds);
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
