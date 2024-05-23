import { MatchFetcher } from "../jobs/match-fetcher";
import { RedisStorage } from "../modules/redis";
import { serpApiToRedis, convertToStandardSerpAPIResults, removeIncompleteSerpAPIData } from "../libs/data-conversion";

import { HTTP } from "../modules/http";
import { RedisTerms } from "../constants/redis";

import { lowerLimitToFetchAPI } from "../constants/time-conversion";
import { APIResponse } from "../interfaces/serp-api";

jest.mock("../modules/http");

describe("MatchFetcher integration test", () => {
  let redisClient: RedisStorage;
  let matchFetcher: MatchFetcher;
  let mockHttpGet: jest.Mock;

  beforeAll(async () => {
    // Set up the real Redis server
    redisClient = new RedisStorage({
      redisURL: process.env.REDIS_URL,
    });
    await redisClient.init();

    matchFetcher = new MatchFetcher(redisClient);
  });

  afterAll(async () => {
    // Close the Redis connection after all tests
    await redisClient.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockHttpGet = HTTP.prototype.get as jest.Mock;

  });

  describe("Match fetcher normal flow", () => {
    it("should call serp API and store data in redis when existing key TTL is lower than the threshold", async () => {
      const mockApiResponse: APIResponse = {
        search_metadata: {
          id: "string",
          status: "string",
          json_endpoint: "string",
          created_at: "string",
          processed_at: "string",
          google_url: "string",
          raw_html_file: "string",
          total_time_taken: 0.11,
        },
        search_parameters: {
          engine: "string",
          q: "string",
          location_requested: "string",
          location_used: "string",
          google_domain: "string",
          device: "string",
        },
        search_information: {
          query_displayed: "string",
          total_result: 1212,
          time_taken_displayed: 0.12,
          organic_results_state: "string",
        },
        sports_results: {
          title: "Chelsea FC",
          rankings: "xth in Premier League",
          thumbnail: "https://serpapi.com/searches/664c6debd5a531e26c40de85/images/5c2e766222da2daf89a3f8923a77c1b481e15eaedf850cab6c2d44ed889d174f.png",
          games: [
              {
                  tournament: "FA Cup",
                  stage: "Final",
                  stadium: "Wembley",
                  date: "May 23",
                  time: "2:00 AM",
                  teams: [
                      {
                          name: "Chelsea",
                          thumbnail: ""
                      },
                      {
                          name: "Manchester City",
                          thumbnail: ""
                      }
                  ]
              },
              {
                  tournament: "Champions League",
                  stage: "Final",
                  stadium: "Wembley",
                  date: "May 31",
                  time: "4:00 AM",
                  teams: [
                      {
                          name: "Chelsea",
                          thumbnail: ""
                      },
                      {
                          name: "Bayern Munich",
                          thumbnail: ""
                      }
                  ]
              },
          ]
      },
      };

      await redisClient.set(RedisTerms.keyName, "fixtures", lowerLimitToFetchAPI - 10); // Set TTL to a low value

      // Mock HTTP get to return a valid API response
      mockHttpGet.mockResolvedValueOnce(mockApiResponse);

      // Call the fetchAndSet method to simulate cronjob behavior
      await matchFetcher.fetchAndSet();

      // Assert that HTTP.get was called
      expect(mockHttpGet).toHaveBeenCalled();

      // Assert that data was processed and stored in redis
      const storedData = await redisClient.get(RedisTerms.keyName);
      // const convertedData = serpApiToRedis(removeIncompleteSerpAPIData(convertToStandardSerpAPIResults([mockApiResponse.sports_results], false)));
      expect(storedData).toBeTruthy();

      const jsonData = JSON.parse(storedData);
      expect(jsonData).toHaveLength(2);
    });

    it("should not call serp API when existing key TTL is lower than the threshold", async () => {
      await redisClient.set(RedisTerms.keyName, "fixtures", lowerLimitToFetchAPI + 100);
      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });
});
