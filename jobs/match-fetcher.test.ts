import { MatchFetcher } from "../jobs/match-fetcher";
import { RedisStorage } from "../modules/redis";
import { serpApiToRedis, convertToStandardSerpAPIResults, removeIncompleteSerpAPIData } from "../libs/data-conversion";
import { loggerService } from "../modules/log";

import { HTTP } from "../modules/http";

// Mock the HTTP module to simulate responses from SerpAPI
jest.mock("../modules/http");

describe("MatchFetcher integration test", () => {
  let redisStorage: RedisStorage;

  beforeAll(async () => {
    // Set up the real Redis server
    const redisConfig = { redisURL: process.env.REDIS_URL };
    redisStorage = new RedisStorage(redisConfig);
    await redisStorage.init();
  });

  afterAll(async () => {
    // Close the Redis connection after all tests
    await redisStorage.close();
  });

  it("fetchAndSet should store data in Redis", async () => {
    // Create an instance of MatchFetcher
    const matchFetcher = new MatchFetcher(redisStorage);

    (HTTP.prototype.get as jest.Mock).mockResolvedValue({
        sports_results: {
            games: [
                // Define the mocked response data here
            ]
        }
    });

    // Run the fetchAndSet method
    await matchFetcher.fetchAndSet();

    // Add assertions to verify the behavior
    // For example, you can check if data is stored in Redis as expected
    // You can also check if HTTP requests were made to SerpAPI (mocked)
  });
});
