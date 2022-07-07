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
import { Time, remindInNHours } from "../constants/time-conversion";
import { calculateDateDiffsInHours } from "../libs/calculation";

injectEnv();

const redisConfig = {
  redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

interface IBody {
  hours_to_match: number;
  message: Record<string, unknown>;
}

async function getMatchesAndPublish() {
  await Redis.init();
  const matches = JSON.parse(await Redis.get(RedisTerms.keyName));
  /*
        // this is assuming matches is always available
        // TODO: make sure the above assumption is correct at all times
  */
  const now = new Date();
  const upcomingMatch = new Date(matches[0].date_time);

  const diffInHours = await calculateDateDiffsInHours(now, upcomingMatch);

  if (diffInHours <= Time.hoursInADay) {
    const msg: IBody = {
      message: matches[0],
      hours_to_match: diffInHours
    };
    await publishMessage({
      channel: RedisTerms.topicName,
      message: JSON.stringify(msg)
    });

    if (remindInNHours.includes(diffInHours)) {
      // remove the entry from the key
      matches.shift();
      const currentTTL = await Redis.getTTL(RedisTerms.keyName);

      await Redis.set(RedisTerms.keyName, JSON.stringify(matches), currentTTL);
    }
  }
}

(async () => {
  try {
    setInterval(async () => {
      await getMatchesAndPublish();
    }, 5000);
  } catch (e) {
    console.log(`an error occured`, e);
    process.exit(1);
  }
})();
