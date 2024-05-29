import { Subscriber } from "./subscriber";
import { loggerService } from "../modules/log";
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";
import { RedisTerms } from "../constants/redis";
import { IPublishedMessage } from "../interfaces/redis";

jest.mock("../modules/http");
jest.mock("../modules/log");

describe("Subscriber integration test", () => {
  let redisClient: RedisStorage;
  let redisPublishClient: RedisStorage;
  let subscriber: Subscriber;
  let mockHttpPost: jest.Mock;

  beforeAll(async () => {
    redisClient = new RedisStorage({
      redisURL: process.env.REDIS_URL
    });
    redisPublishClient = new RedisStorage({
      redisURL: process.env.REDIS_URL
    });

    await redisClient.init();
    await redisPublishClient.init();

    subscriber = new Subscriber(redisClient);
  });

  afterAll(async () => {
    await redisClient.close();
    await redisPublishClient.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockHttpPost = HTTP.prototype.post as jest.Mock;
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe("Subscriber normal flow", () => {
    it("should subscribe to a channel and print the parsed message to the terminal", async () => {
      await subscriber.subscribeToChannel(RedisTerms.channelName);
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.stringContaining(`Subscribing to ${RedisTerms.channelName} ...`)
      );

      const hoursToMatch = 48;
      const futureDate: Date = new Date(Date.now() + hoursToMatch * 60 * 60 * 1000);
      const messageToPublish: IPublishedMessage = {
        message: {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          date_time: futureDate,
          stadium: "San Siro"
        },
        hours_to_match: hoursToMatch
      };

      await redisPublishClient.publish(RedisTerms.channelName, JSON.stringify(messageToPublish));

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(loggerService.info).toHaveBeenCalledWith(
        `New message received: ${JSON.stringify(messageToPublish)}`
      );
    });

    it("should subscribe to a channel and print the parsed message to the terminal and then print the message that's about to be tweeted if hours to match is 24", async () => {
      await subscriber.subscribeToChannel(RedisTerms.channelName);
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.stringContaining(`Subscribing to ${RedisTerms.channelName} ...`)
      );

      const hoursToMatch = 24;
      const futureDate: Date = new Date(Date.now() + hoursToMatch * 60 * 60 * 1000);
      const messageToPublish: IPublishedMessage = {
        message: {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          date_time: futureDate,
          stadium: "San Siro"
        },
        hours_to_match: hoursToMatch
      };

      await redisPublishClient.publish(RedisTerms.channelName, JSON.stringify(messageToPublish));

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(loggerService.info).toHaveBeenCalledWith(
        `New message received: ${JSON.stringify(messageToPublish)}`
      );

      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(loggerService.info).toHaveBeenCalledWith(
        `Attempting to tweet a match that's about to begin in ${hoursToMatch} hours`
      );
      expect(mockHttpPost).toHaveBeenCalled();
    });

    it("should subscribe to a channel and print the parsed message to the terminal and then print the message that's about to be tweeted if hours to match is 1", async () => {
      await subscriber.subscribeToChannel(RedisTerms.channelName);
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.stringContaining(`Subscribing to ${RedisTerms.channelName} ...`)
      );

      const hoursToMatch = 1;
      const futureDate: Date = new Date(Date.now() + hoursToMatch * 60 * 60 * 1000);
      const messageToPublish: IPublishedMessage = {
        message: {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          date_time: futureDate,
          stadium: "San Siro"
        },
        hours_to_match: hoursToMatch
      };

      await redisPublishClient.publish(RedisTerms.channelName, JSON.stringify(messageToPublish));

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(loggerService.info).toHaveBeenCalledWith(
        `New message received: ${JSON.stringify(messageToPublish)}`
      );

      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(loggerService.info).toHaveBeenCalledWith(
        `Attempting to tweet a match that's about to begin in ${hoursToMatch} hours`
      );
      expect(mockHttpPost).toHaveBeenCalled();
    });

    it("should subscribe to a channel and log the error if any process encounters an error", async () => {
      const error = new Error("Subscribe error");

      jest.spyOn(redisClient, "subscribe").mockImplementation(() => {
        throw error;
      });

      await subscriber.subscribeToChannel(RedisTerms.channelName);

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining("An error occurred when subscribing to upcoming-fixtures: {}")
      );
    });

    it("should subscribe to a channel and log the error if handling message is returning error", async () => {
      await subscriber.subscribeToChannel(RedisTerms.channelName);
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.stringContaining(`Subscribing to ${RedisTerms.channelName} ...`)
      );

      const hoursToMatch = 1;
      const futureDate: Date = new Date(Date.now() + hoursToMatch * 60 * 60 * 1000);
      const messageToPublish: IPublishedMessage = {
        message: {
          participants: "Inter vs @ChelseaFC",
          tournament: "Champions League",
          date_time: futureDate,
          stadium: "San Siro"
        },
        hours_to_match: hoursToMatch
      };

      await redisPublishClient.publish(RedisTerms.channelName, JSON.stringify(messageToPublish));

      const error = new Error("Handle message error");

      jest.spyOn(JSON, "parse").mockImplementation(() => {
        throw error;
      });

      await subscriber.subscribeToChannel(RedisTerms.channelName);

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining("An error occurred when subscribing to upcoming-fixtures: {}")
      );
    });
  });
});
