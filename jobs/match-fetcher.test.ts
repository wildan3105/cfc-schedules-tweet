import { MatchFetcher } from "../jobs/match-fetcher";
import { RedisStorage } from "../modules/redis";
import { serpApiToRedis, convertToStandardSerpAPIResults, removeIncompleteSerpAPIData } from "../libs/data-conversion";

import { HTTP } from "../modules/http";
import { RedisTerms } from "../constants/redis";

import { lowerLimitToFetchAPI } from "../constants/time-conversion";
import { APIResponse } from "../interfaces/serp-api";
import { RedisFixture } from "../interfaces/redis";

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
  }
}

describe("MatchFetcher integration test", () => {
  let redisClient: RedisStorage;
  let matchFetcher: MatchFetcher;
  let mockHttpGet: jest.Mock;
  let mockSendEmail: jest.Mock;

  beforeAll(async () => {
    redisClient = new RedisStorage({
      redisURL: process.env.REDIS_URL,
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
  })

  describe("Match fetcher normal flow", () => {
    it("should call serp API and then return games without spotlight and then store data in redis when existing key TTL is lower than the threshold", async () => {
      const mockApiResponse: APIResponse = {
          ...baseSerpAPIResponse,
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

      mockHttpGet.mockResolvedValueOnce(mockApiResponse);

      await matchFetcher.fetchAndSet();

      expect(mockHttpGet).toHaveBeenCalled();

      const storedData = await redisClient.get(RedisTerms.keyName);
      expect(storedData).toBeTruthy();

      const jsonData: RedisFixture[] = JSON.parse(storedData);
      expect(jsonData).toHaveLength(2);
      expect(jsonData[0].participants).toEqual("@ChelseaFC vs Manchester City");
      expect(jsonData[1].participants).toEqual("@ChelseaFC vs Bayern Munich");
    });

    it("should call serp API and then return games with spotlight and then store data in redis when existing key TTL is lower than the threshold", async () => {
      const mockApiResponseWithGameSpotlight: APIResponse = {
          ...baseSerpAPIResponse,
          sports_results: {
            title: "Chelsea FC",
            rankings: "xth in Premier League",
            thumbnail: "https://serpapi.com/searches/664c6debd5a531e26c40de85/images/5c2e766222da2daf89a3f8923a77c1b481e15eaedf850cab6c2d44ed889d174f.png",
            game_spotlight: {
              tournament: "Carabao Cup",
              stage: "Final",
              stadium: "Wembley",
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
                    stadium: "Wembley",
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
                },
            ],
        },
      };

      mockHttpGet.mockResolvedValueOnce(mockApiResponseWithGameSpotlight);

      await matchFetcher.fetchAndSet();

      expect(mockHttpGet).toHaveBeenCalled();

      const storedData = await redisClient.get(RedisTerms.keyName);
      expect(storedData).toBeTruthy();

      const jsonData: RedisFixture[] = JSON.parse(storedData);
      expect(jsonData).toHaveLength(3);
      expect(jsonData[0].participants).toEqual("@ChelseaFC vs Manchester United");
      expect(jsonData[1].participants).toEqual("@ChelseaFC vs Blackburn");
      expect(jsonData[2].participants).toEqual("@ChelseaFC vs Bayer Leverkusen");
    });

    it("should call serp API and then return games with custom date format and then store data in redis when existing key TTL is lower than the threshold", async () => {
      const mockApiResponseWithCustomDateFormat: APIResponse = {
          ...baseSerpAPIResponse,
          sports_results: {
            title: "Chelsea FC",
            rankings: "xth in Premier League",
            thumbnail: "https://serpapi.com/searches/664c6debd5a531e26c40de85/images/5c2e766222da2daf89a3f8923a77c1b481e15eaedf850cab6c2d44ed889d174f.png",
            games: [
                {
                    tournament: "Premier League Cup",
                    stadium: "Wembley",
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
            ],
        },
      };

      mockHttpGet.mockResolvedValueOnce(mockApiResponseWithCustomDateFormat);

      await matchFetcher.fetchAndSet();

      expect(mockHttpGet).toHaveBeenCalled();

      const storedData = await redisClient.get(RedisTerms.keyName);
      expect(storedData).toBeTruthy();

      const jsonData: RedisFixture[] = JSON.parse(storedData);
      expect(jsonData).toHaveLength(2);
      expect(jsonData[0].participants).toEqual("Liverpool vs @ChelseaFC");
      expect(jsonData[1].participants).toEqual("@ChelseaFC vs Bayern Munich");
    });

    it("should not call serp API when existing key TTL is greater than the threshold", async () => {
      await redisClient.set(RedisTerms.keyName, "fixtures", lowerLimitToFetchAPI + 100);
      await matchFetcher.fetchAndSet();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });

    it('should call sendReportingEmail when one of the functions inside fetchAndSet() is returning error', async () => {
      const error = new Error("API failure");
      mockHttpGet.mockRejectedValueOnce(error);

      mockSendEmail.mockResolvedValueOnce(undefined);

      await matchFetcher.fetchAndSet();

      expect(mockHttpGet).toHaveBeenCalled();

      expect(mockSendEmail).toHaveBeenCalledWith(expect.stringContaining("API failure"), 'Match fetcher cron');
    })
  });
});
