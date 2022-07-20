/* eslint-disable no-self-assign */
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";

import { RedisTerms, defaultTTLInSeconds } from "../constants/redis";
import { Team } from "../constants/team";
import { serpApiToRedis } from "../libs/data-conversion";
import { injectEnv } from "../libs/inject-env";
import { lowerLimitToFetchAPI } from "../constants/time-conversion";
import { Query } from "../enums/query";

injectEnv();

const redisConfig = {
  redisURL: process.env.REDIS_URL
};

const Redis = new RedisStorage(redisConfig);

const httpController = new HTTP();

async function getStadiumName(team: string): Promise<string> {
  let stadiumName;
  const isChelseaHomeTeam = team === Team.name ? true : false;

  if (isChelseaHomeTeam) {
    stadiumName = Team.stadium;
  } else {
    const cleansedTeamName = team.split(" ");
    const queryTeamName = cleansedTeamName.join("+").toLowerCase();
    const fetchedStadiumName = await httpController.get(queryTeamName + "+stadium");
    stadiumName = fetchedStadiumName?.sports_results?.title || "Opponent's Stadium";
  }

  return stadiumName;
}

async function fetchAndSet(): Promise<void> {
  await Redis.init();

  const existingKeyTTL = await Redis.getTTL(RedisTerms.keyName);

  // only fetch the serp API and set the key if current key is expiring in an hour or less
  if (existingKeyTTL < lowerLimitToFetchAPI) {
    const data = await httpController.get(Query.club);
    // TODO: need to handle game_spotlight data
    const fixtures = data.sports_results.games;

    await Promise.all(
      fixtures.map(async element => {
        element.stadium = await getStadiumName(element.teams[0].name);
      })
    );

    const convertedData = await serpApiToRedis(fixtures);

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
