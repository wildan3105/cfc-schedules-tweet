import { MatchFetcher } from "../jobs/match-fetcher";
import { RedisStorage } from "../modules/redis";

import { HTTP } from "../modules/http";
import { RedisTerms } from "../constants/redis";

import { lowerLimitToFetchAPI, remindInNHours } from "../constants/time-conversion";
import { APIResponse } from "../interfaces/serp-api";
import { RedisWithReminder } from "../interfaces/redis";
import { calculateDateDiffsInHours } from "../libs/calculation";

jest.mock("../modules/http");

const baseSerpAPIResponse = {
  search_metadata: {
    id: "string",
    status: "string",
    json_endpoint: "string",
    created_at: "string",
    processed_at: "string",
    google_url: "string",
    raw_html_file: "string",
    total_time_taken: 0.11
  },
  search_parameters: {
    engine: "string",
    q: "string",
    location_requested: "string",
    location_used: "string",
    google_domain: "string",
    device: "string"
  },
  search_information: {
    query_displayed: "string",
    total_result: 1212,
    time_taken_displayed: 0.12,
    organic_results_state: "string"
  }
};

describe("MatchFetcher integration test", () => {
  let redisClient: RedisStorage;
  let matchFetcher: MatchFetcher;
  let mockHttpGet: jest.Mock;
  let mockSendEmail: jest.Mock;

  beforeAll(async () => {
    redisClient = new RedisStorage({
      redisURL: process.env.REDIS_URL
    });
    await redisClient.init();

    matchFetcher = new MatchFetcher(redisClient);
  });

  afterAll(async () => {
    await redisClient.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockHttpGet = HTTP.prototype.get as jest.Mock;
    mockSendEmail = HTTP.prototype.sendEmail as jest.Mock;
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await redisClient.delete(RedisTerms.keyName);
  });

  describe("Match fetcher normal flow", () => {
    it("should call serp API and then return games without spotlight and then store data in redis when existing key TTL is lower than the threshold", async () => {
      const mockApiResponse: APIResponse = {
        ...baseSerpAPIResponse,
        sports_results: {
          title: "Chelsea FC",
          rankings: "xth in Premier League",
          thumbnail:
            "https://serpapi.com/searches/664c6debd5a531e26c40de85/images/5c2e766222da2daf89a3f8923a77c1b481e15eaedf850cab6c2d44ed889d174f.png",
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
            }
          ]
        }
      };

      mockHttpGet.mockResolvedValueOnce(mockApiResponse);

      await matchFetcher.fetchAndSet();

      const expectedMatchesLength = mockApiResponse.sports_results.games.length;

      expect(mockHttpGet).toHaveBeenCalled();

      const storedData = await redisClient.get(RedisTerms.keyName);
      expect(storedData).toBeTruthy();

      const jsonData: RedisWithReminder[] = JSON.parse(storedData);
      expect(jsonData).toHaveLength(expectedMatchesLength * remindInNHours.length);
      expect(calculateDateDiffsInHours(jsonData[0].reminder_time, jsonData[0].date_time)).toEqual(
        1
      );
      expect(calculateDateDiffsInHours(jsonData[1].reminder_time, jsonData[1].date_time)).toEqual(
        24
      );
      expect(calculateDateDiffsInHours(jsonData[2].reminder_time, jsonData[2].date_time)).toEqual(
        1
      );
      expect(calculateDateDiffsInHours(jsonData[3].reminder_time, jsonData[3].date_time)).toEqual(
        24
      );
      expect(jsonData[0].participants).toEqual("@ChelseaFC vs Manchester City");
      expect(jsonData[0].tournament).toEqual("FA Cup");
      expect(jsonData[0].date_time).toBeTruthy();
      expect(jsonData[0].reminder_time).toBeTruthy();
      expect(jsonData[0].stadium).toEqual("Wembley");
      expect(jsonData[1].participants).toEqual("@ChelseaFC vs Manchester City");
      expect(jsonData[1].tournament).toEqual("FA Cup");
      expect(jsonData[1].date_time).toBeTruthy();
      expect(jsonData[1].reminder_time).toBeTruthy();
      expect(jsonData[1].stadium).toEqual("Wembley");
      expect(jsonData[2].participants).toEqual("@ChelseaFC vs Bayern Munich");
      expect(jsonData[2].tournament).toEqual("Champions League");
      expect(jsonData[2].date_time).toBeTruthy();
      expect(jsonData[2].reminder_time).toBeTruthy();
      expect(jsonData[2].stadium).toEqual("Wembley");
      expect(jsonData[3].participants).toEqual("@ChelseaFC vs Bayern Munich");
      expect(jsonData[3].tournament).toEqual("Champions League");
      expect(jsonData[3].date_time).toBeTruthy();
      expect(jsonData[3].reminder_time).toBeTruthy();
      expect(jsonData[3].stadium).toEqual("Wembley");
    });

    it("should call serp API and then return games with spotlight and then store data in redis when existing key TTL is lower than the threshold", async () => {
      const mockApiResponseWithGameSpotlight: APIResponse = {
        ...baseSerpAPIResponse,
        sports_results: {
          title: "Chelsea FC",
          rankings: "xth in Premier League",
          thumbnail:
            "https://serpapi.com/searches/664c6debd5a531e26c40de85/images/5c2e766222da2daf89a3f8923a77c1b481e15eaedf850cab6c2d44ed889d174f.png",
          game_spotlight: {
            tournament: "Carabao Cup",
            stage: "Final",
            stadium: "Stamford Bridge",
            date: "tomorrow, 7:00 AM",
            teams: [
              {
                name: "Chelsea",
                thumbnail: ""
              },
              {
                name: "Manchester United",
                thumbnail: ""
              }
            ]
          },
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
                  name: "Blackburn",
                  thumbnail: ""
                }
              ]
            },
            {
              tournament: "Champions League",
              stage: "Final",
              stadium: "Camp Nou",
              date: "May 31",
              time: "4:00 AM",
              teams: [
                {
                  name: "Chelsea",
                  thumbnail: ""
                },
                {
                  name: "Bayer Leverkusen",
                  thumbnail: ""
                }
              ]
            }
          ]
        }
      };

      mockHttpGet.mockResolvedValueOnce(mockApiResponseWithGameSpotlight);

      await matchFetcher.fetchAndSet();

      const expectedMatchesLength =
        mockApiResponseWithGameSpotlight.sports_results.games.length + 1; // 1 is from game spotlight match

      expect(mockHttpGet).toHaveBeenCalled();

      const storedData = await redisClient.get(RedisTerms.keyName);
      expect(storedData).toBeTruthy();

      const jsonData: RedisWithReminder[] = JSON.parse(storedData);
      expect(jsonData).toHaveLength(expectedMatchesLength * remindInNHours.length);
      expect(calculateDateDiffsInHours(jsonData[0].reminder_time, jsonData[0].date_time)).toEqual(
        1
      );
      expect(calculateDateDiffsInHours(jsonData[1].reminder_time, jsonData[1].date_time)).toEqual(
        24
      );
      expect(calculateDateDiffsInHours(jsonData[2].reminder_time, jsonData[2].date_time)).toEqual(
        1
      );
      expect(calculateDateDiffsInHours(jsonData[3].reminder_time, jsonData[3].date_time)).toEqual(
        24
      );
      expect(calculateDateDiffsInHours(jsonData[4].reminder_time, jsonData[4].date_time)).toEqual(
        1
      );
      expect(calculateDateDiffsInHours(jsonData[5].reminder_time, jsonData[5].date_time)).toEqual(
        24
      );
      expect(jsonData[0].participants).toEqual("@ChelseaFC vs Manchester United");
      expect(jsonData[0].tournament).toEqual("Carabao Cup");
      expect(jsonData[0].date_time).toBeTruthy();
      expect(jsonData[0].reminder_time).toBeTruthy();
      expect(jsonData[0].stadium).toEqual("Stamford Bridge");
      expect(jsonData[1].participants).toEqual("@ChelseaFC vs Manchester United");
      expect(jsonData[1].tournament).toEqual("Carabao Cup");
      expect(jsonData[1].date_time).toBeTruthy();
      expect(jsonData[1].reminder_time).toBeTruthy();
      expect(jsonData[1].stadium).toEqual("Stamford Bridge");
      expect(jsonData[2].participants).toEqual("@ChelseaFC vs Blackburn");
      expect(jsonData[2].tournament).toEqual("FA Cup");
      expect(jsonData[2].date_time).toBeTruthy();
      expect(jsonData[2].reminder_time).toBeTruthy();
      expect(jsonData[2].stadium).toEqual("Wembley");
      expect(jsonData[3].participants).toEqual("@ChelseaFC vs Blackburn");
      expect(jsonData[3].tournament).toEqual("FA Cup");
      expect(jsonData[3].date_time).toBeTruthy();
      expect(jsonData[3].reminder_time).toBeTruthy();
      expect(jsonData[3].stadium).toEqual("Wembley");
      expect(jsonData[4].participants).toEqual("@ChelseaFC vs Bayer Leverkusen");
      expect(jsonData[4].tournament).toEqual("Champions League");
      expect(jsonData[4].date_time).toBeTruthy();
      expect(jsonData[4].reminder_time).toBeTruthy();
      expect(jsonData[4].stadium).toEqual("Camp Nou");
      expect(jsonData[5].participants).toEqual("@ChelseaFC vs Bayer Leverkusen");
      expect(jsonData[5].tournament).toEqual("Champions League");
      expect(jsonData[5].date_time).toBeTruthy();
      expect(jsonData[5].reminder_time).toBeTruthy();
      expect(jsonData[5].stadium).toEqual("Camp Nou");
    });

    it("should call serp API and then return games with custom date format and then store data in redis when existing key TTL is lower than the threshold", async () => {
      const mockApiResponseWithCustomDateFormat: APIResponse = {
        ...baseSerpAPIResponse,
        sports_results: {
          title: "Chelsea FC",
          rankings: "xth in Premier League",
          thumbnail:
            "https://serpapi.com/searches/664c6debd5a531e26c40de85/images/5c2e766222da2daf89a3f8923a77c1b481e15eaedf850cab6c2d44ed889d174f.png",
          games: [
            {
              tournament: "Premier League",
              stadium: "Anfield",
              date: "tomorrow",
              time: "2:00 AM",
              teams: [
                {
                  name: "Liverpool",
                  thumbnail: ""
                },
                {
                  name: "Chelsea",
                  thumbnail: ""
                }
              ]
            },
            {
              tournament: "Champions League",
              stage: "Final",
              stadium: "San Siro",
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
            }
          ]
        }
      };

      mockHttpGet.mockResolvedValueOnce(mockApiResponseWithCustomDateFormat);

      await matchFetcher.fetchAndSet();

      const expectedMatchesLength = mockApiResponseWithCustomDateFormat.sports_results.games.length;

      expect(mockHttpGet).toHaveBeenCalled();

      const storedData = await redisClient.get(RedisTerms.keyName);
      expect(storedData).toBeTruthy();

      const jsonData: RedisWithReminder[] = JSON.parse(storedData);
      expect(jsonData).toHaveLength(expectedMatchesLength * remindInNHours.length);
      expect(calculateDateDiffsInHours(jsonData[0].reminder_time, jsonData[0].date_time)).toEqual(
        1
      );
      expect(calculateDateDiffsInHours(jsonData[1].reminder_time, jsonData[1].date_time)).toEqual(
        24
      );
      expect(calculateDateDiffsInHours(jsonData[2].reminder_time, jsonData[2].date_time)).toEqual(
        1
      );
      expect(calculateDateDiffsInHours(jsonData[3].reminder_time, jsonData[3].date_time)).toEqual(
        24
      );
      expect(jsonData[0].participants).toEqual("Liverpool vs @ChelseaFC");
      expect(jsonData[0].tournament).toEqual("Premier League");
      expect(jsonData[0].date_time).toBeTruthy();
      expect(jsonData[0].reminder_time).toBeTruthy();
      expect(jsonData[0].stadium).toEqual("Anfield");
      expect(jsonData[1].participants).toEqual("Liverpool vs @ChelseaFC");
      expect(jsonData[1].tournament).toEqual("Premier League");
      expect(jsonData[1].date_time).toBeTruthy();
      expect(jsonData[1].reminder_time).toBeTruthy();
      expect(jsonData[1].stadium).toEqual("Anfield");
      expect(jsonData[2].participants).toEqual("@ChelseaFC vs Bayern Munich");
      expect(jsonData[2].tournament).toEqual("Champions League");
      expect(jsonData[2].date_time).toBeTruthy();
      expect(jsonData[2].reminder_time).toBeTruthy();
      expect(jsonData[2].stadium).toEqual("San Siro");
      expect(jsonData[3].participants).toEqual("@ChelseaFC vs Bayern Munich");
      expect(jsonData[3].tournament).toEqual("Champions League");
      expect(jsonData[3].date_time).toBeTruthy();
      expect(jsonData[3].reminder_time).toBeTruthy();
      expect(jsonData[3].stadium).toEqual("San Siro");
    });

    it("should not call serp API when existing key TTL is greater than the threshold", async () => {
      await redisClient.set(RedisTerms.keyName, "fixtures", lowerLimitToFetchAPI + 100);
      await matchFetcher.fetchAndSet();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });

    it("should call sendReportingEmail when one of the functions inside fetchAndSet() is returning error", async () => {
      const error = new Error("API failure");
      mockHttpGet.mockRejectedValueOnce(error);

      mockSendEmail.mockResolvedValueOnce(undefined);

      await matchFetcher.fetchAndSet();

      expect(mockHttpGet).toHaveBeenCalled();

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.stringContaining("API failure"),
        "Match fetcher cron"
      );
    });
  });
});
