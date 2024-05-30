import { MatchReader } from "./match-reader";
import { RedisStorage } from "../modules/redis";
import { loggerService } from "../modules/log";

import { RedisTerms } from "../constants/redis";
import { RedisWithReminder } from "../interfaces/redis";
import { adjustHours } from "../libs/data-conversion";

jest.mock("../modules/log");

const DEFAULT_TTL = 3600;
const reminderDueHours = {
  day: 24,
  hour: 1
};

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
    await redisClient.delete(RedisTerms.keyName);
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

    it("should publish the match and then remove it from the redis if the different between now and reminder_time is less than 1 hour and hours_to_match is 24", async () => {
      const now = new Date();
      const reminderTimeIn24Hours = now;
      const reminderTimeAnHour = adjustHours(
        "add",
        reminderDueHours.day - reminderDueHours.hour,
        reminderTimeIn24Hours
      );
      const matchTime = adjustHours("add", reminderDueHours.day, now);
      const fixtureToSet: RedisWithReminder[] = [
        {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          match_time: matchTime,
          reminder_time: reminderTimeIn24Hours,
          hours_to_match: reminderDueHours.day,
          stadium: "San Siro"
        },
        {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          match_time: matchTime,
          reminder_time: reminderTimeAnHour,
          hours_to_match: reminderDueHours.hour,
          stadium: "San Siro"
        }
      ];

      await redisClient.set(RedisTerms.keyName, JSON.stringify(fixtureToSet), DEFAULT_TTL);

      await matchReader.getMatchesAndPublish();

      const keyAfterRemoved: RedisWithReminder[] = JSON.parse(
        await redisClient.get(RedisTerms.keyName)
      );

      expect(keyAfterRemoved).toHaveLength(1);
      expect(keyAfterRemoved[0].hours_to_match).toEqual(reminderDueHours.hour);
    });

    it("should publish the match and then remove it from the redis if the different between now and reminder_time is less than 1 hour and hours_to_match is 1", async () => {
      const now = new Date();
      const reminderTimeAnHour = now;
      const matchTime = adjustHours("add", reminderDueHours.hour, now);
      const fixtureToSet: RedisWithReminder[] = [
        {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          match_time: matchTime,
          reminder_time: reminderTimeAnHour,
          hours_to_match: reminderDueHours.hour,
          stadium: "San Siro"
        }
      ];

      await redisClient.set(RedisTerms.keyName, JSON.stringify(fixtureToSet), DEFAULT_TTL);

      await matchReader.getMatchesAndPublish();

      const keyAfterRemoved: RedisWithReminder[] = JSON.parse(
        await redisClient.get(RedisTerms.keyName)
      );

      expect(keyAfterRemoved).toHaveLength(0);
    });

    it("should log the error if any processes fail during fetch and publish match", async () => {
      const errorMessage = "Fetch matches error";
      jest.spyOn(matchReader as any, "fetchMatches").mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      await matchReader.getMatchesAndPublish();

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining(`Failed to get matches and publish: Error: ${errorMessage}`)
      );

      jest.spyOn(matchReader as any, "publishMatch").mockImplementationOnce(() => {
        throw new Error("Publish match error");
      });

      const now = new Date();
      const reminderTimeAnHour = now;
      const matchTime = adjustHours("add", reminderDueHours.hour, now);
      const fixtureToSet: RedisWithReminder[] = [
        {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          match_time: matchTime,
          reminder_time: reminderTimeAnHour,
          hours_to_match: reminderDueHours.hour,
          stadium: "San Siro"
        }
      ];

      await redisClient.set(RedisTerms.keyName, JSON.stringify(fixtureToSet), DEFAULT_TTL);

      await matchReader.getMatchesAndPublish();

      expect(loggerService.error).toHaveBeenCalled();
    });
  });
});
