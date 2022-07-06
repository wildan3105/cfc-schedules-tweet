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
  await Redis.init();

  // const data = await httpController.get();
  // const fixtures = data.sports_results.games;
  const fixtures = [
    {
      date: "Wed, Jul 6",
      time: "16:00",
      teams: [{ name: "Chelsea" }, { name: "Club America" }],
      tournament: "#OtherMatch"
    },
    {
      date: "Jul 21",
      time: "06:00",
      teams: [{ name: "Charlotte" }, { name: "Chelsea " }],
      participants: "Charlotte vs Chelsea",
      tournament: "#OtherMatch"
    }
  ];
  const convertedData = await serpApiToRedis(fixtures);

  await Redis.set(RedisTerms.keyName, JSON.stringify(convertedData), defaultTTLInSeconds);
  await Redis.close();
}

(async () => {
  try {
    await fetchAndSet();
  } catch (e) {
    console.log(`an error occured`, e);
    process.exit(1);
  }
})();
