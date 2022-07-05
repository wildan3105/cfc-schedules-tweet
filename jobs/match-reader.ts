/*
- goal(s):
    - get the 1st key-value in redis
    - call publisher
- period of running: hourly
- cron syntax: 0 * * * *
*/
import { RedisStorage } from "../modules/redis";
import { publishMessage } from "../events/pub";
import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { calculateDateDiffsInHours } from "../libs/calculation";

injectEnv();

const redisConfig = {
  redisURL: process.env.REDIS_URL,
};

const Redis = new RedisStorage(redisConfig);

async function getMatchesAndPublish() {
  await Redis.init();
  const matches = JSON.parse(await Redis.get(RedisTerms.keyName));

  /*
        // this is assuming matches is always available
        // TODO: make sure the above assumption is correct at all times
        // WARN: be aware of timezone conversion!
        // datetime is stored in UTC
        1. check if matches[0].date_time is equal or less than 1 day
            - if no, return
            - if yes, do the following
        2. 
    */
  const now = new Date();
  const upcomingMatch = new Date(matches[0].date_time);

  const diffInHours = await calculateDateDiffsInHours(
    upcomingMatch as never,
    now as never
  );

  if (diffInHours <= 24) {
    await publishMessage({
      channel: RedisTerms.topicName,
      message: JSON.stringify(matches),
    });
  }
}

(async () => {
  try {
    await getMatchesAndPublish();
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  } catch (e) {
    console.log(`an error occured`, e);
    process.exit(1);
  }
})();
