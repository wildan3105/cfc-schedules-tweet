import { MatchReader } from "./match-reader";
import { RedisStorage } from "../modules/redis";
import { loggerService } from "../modules/log";

import { RedisTerms } from "../constants/redis";
import { RedisFixture } from "../interfaces/redis";

jest.mock("../modules/log");

const DEFAULT_TTL = 3600;

describe("Match reader integration test", () => {
  let redisClient: RedisStorage;
  let matchReader: MatchReader;

  beforeAll(async () => {
    redisClient = new RedisStorage({
      redisURL: process.env.REDIS_URL
    });
    await redisClient.init();

    matchReader = new MatchReader(redisClient);
  });

  afterAll(async () => {
    await redisClient.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await redisClient.delete(RedisTerms.keyName);
  });

  describe("Match reader normal flow", () => {
    it("should not process any match if fixtures is empty", async () => {
      const stringArray: string[] = [];
      await redisClient.set(RedisTerms.keyName, JSON.stringify(stringArray), DEFAULT_TTL);

      await matchReader.getMatchesAndPublish();

      expect(loggerService.warn).toHaveBeenCalledWith(
        expect.stringContaining(`Nothing to read from redis. Exit early`)
      );
    });

    it("should log the upcoming match if the date_time is more than now and greater than 24 hours", async () => {
      const futureDate: Date = new Date(Date.now() + 48 * 60 * 60 * 1000); // add match with the date_time of now + x hours
      const fixtureToSet: RedisFixture[] = [
        {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          date_time: futureDate,
          stadium: "San Siro"
        }
      ];

      await redisClient.set(RedisTerms.keyName, JSON.stringify(fixtureToSet), DEFAULT_TTL);

      await matchReader.getMatchesAndPublish();

      expect(loggerService.info).toHaveBeenCalledWith(expect.stringMatching(/^Upcoming/));
    });

    it("should log the upcoming match and publish the match if the date_time is more than now and less than 24 hours", async () => {
      const futureDate: Date = new Date(Date.now() + 24 * 60 * 60 * 1000); // add match with the date_time of now + x hours
      const fixtureToSet: RedisFixture[] = [
        {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          date_time: futureDate,
          stadium: "San Siro"
        }
      ];

      await redisClient.set(RedisTerms.keyName, JSON.stringify(fixtureToSet), DEFAULT_TTL);

      await matchReader.getMatchesAndPublish();

      expect(loggerService.info).toHaveBeenCalledWith(expect.stringMatching(/^Upcoming/));
    });

    it("should log the upcoming match and publish the match and remove it from fixtures if the date_time is 1 hour from now", async () => {
      const futureDate: Date = new Date(Date.now() + 1 * 60 * 60 * 1000); // add match with the date_time of now + x hours
      const fixtureToSet: RedisFixture[] = [
        {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          date_time: futureDate,
          stadium: "San Siro"
        }
      ];

      await redisClient.set(RedisTerms.keyName, JSON.stringify(fixtureToSet), DEFAULT_TTL);

      await matchReader.getMatchesAndPublish();

      const keyAfterRemoved = JSON.parse(await redisClient.get(RedisTerms.keyName));

      expect(loggerService.info).toHaveBeenCalledWith(expect.stringMatching(/^Upcoming/));
      expect(keyAfterRemoved).toHaveLength(0);
    });

    it("should log the error if any processes fail during fetch and publish match", async () => {
      jest.spyOn(matchReader as any, "fetchMatches").mockImplementationOnce(() => {
        throw new Error("Fetch matches error");
      });

      await matchReader.getMatchesAndPublish();

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to get matches and publish: {}")
      );

      jest.spyOn(matchReader as any, "publishMatch").mockImplementationOnce(() => {
        throw new Error("Publish match error");
      });

      const futureDate: Date = new Date(Date.now() + 1 * 60 * 60 * 1000); // add match with the date_time of now + x hours
      const fixtureToSet: RedisFixture[] = [
        {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          date_time: futureDate,
          stadium: "San Siro"
        }
      ];

      await redisClient.set(RedisTerms.keyName, JSON.stringify(fixtureToSet), DEFAULT_TTL);

      await matchReader.getMatchesAndPublish();

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to get matches and publish: {}")
      );
    });
  });
});
