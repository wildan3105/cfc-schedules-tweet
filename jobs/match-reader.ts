import { RedisStorage } from "../modules/redis";
import { injectEnv } from "../libs/inject-env";
import { RedisTerms } from "../constants/redis";
import { Time } from "../constants/time-conversion";
import { calculateDateDiffsInHours } from "../libs/calculation";

injectEnv();

const REDIS_URL = process.env.REDIS_URL;
const redisConfig = {
  redisURL: REDIS_URL
};

interface IBody {
  hours_to_match: number;
  message: Record<string, unknown>;
}

class MatchReader {
  private redis: RedisStorage;

  constructor() {
    this.redis = new RedisStorage(redisConfig);
  }

  private async initializeRedis(): Promise<void> {
    if (!this.redis.initialized()) {
      await this.redis.init();
    }
  }

  public async getMatchesAndPublish(): Promise<void> {
    await this.initializeRedis();
    const matches = JSON.parse(await this.redis.get(RedisTerms.keyName));
    if (!Array.isArray(matches)) {
      console.log(`Nothing to read from redis. Exit early`)
      return;
    }
    const now = new Date();
    const upcomingMatch = new Date(matches[0].date_time);
  
    const diffInHours = calculateDateDiffsInHours(now, upcomingMatch);
  
    console.log(`Upcoming match ${JSON.stringify(matches[0])} will be played in ${diffInHours} hour(s)`);
  
    if (diffInHours <= Time.hoursInADay) {
      const msg: IBody = {
        message: matches[0],
        hours_to_match: diffInHours
      };

      await this.redis.publish(RedisTerms.channelName, JSON.stringify(msg))
  
      // remove the entry from the key if only difference is 1 hour
      if (diffInHours === 1) {
        matches.shift();
        const currentTTL = await this.redis.getTTL(RedisTerms.keyName);
  
        await this.redis.set(RedisTerms.keyName, JSON.stringify(matches), currentTTL);
      }
    }
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
    const matchReader = new MatchReader();
    await matchReader.getMatchesAndPublish();
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  } catch (e) {
    console.log(`an error occured when executing match reader cron`, e);
    process.exit(1);
  } finally {
    console.log(`Match reader cron executed.`)
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  }
})();
