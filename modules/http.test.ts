import axios from "axios";
import { Oauth1Helper } from "./oauth";
import { HTTP } from "./http";
import { loggerService } from "./log";
import { Query } from "../enums/query";
import { EmailRequest } from "../interfaces/elastic-email-api";
import { ElasticEmailDefaultContent } from "../constants/elastic-email";

jest.mock("axios");
jest.mock("./oauth");
jest.mock("./log");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedOauth1Helper = Oauth1Helper as jest.Mocked<typeof Oauth1Helper>;

describe("HTTP", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("post", () => {
    it("should send a POST request to Twitter API", async () => {
      process.env.TWITTER_BASE_URL = "https://api.twitter.com";

      const content = { text: "Hello world!" };
      const authHeader = { Authorization: "Oauth ..." };
      mockedOauth1Helper.getAuthHeaderForRequest.mockReturnValue(authHeader);
      mockedAxios.post.mockResolvedValue({ status: 200 });

      const http = new HTTP();
      await http.post(content);

      expect(mockedOauth1Helper.getAuthHeaderForRequest).toHaveBeenCalledWith({
        url: "https://api.twitter.com/2/tweets",
        method: "POST",
        body: content
      });

      expect(mockedAxios.post).toHaveBeenCalledWith("https://api.twitter.com/2/tweets", content, {
        headers: authHeader
      });
    });

    it("should log an error when Twitter API request fails", async () => {
      process.env.TWITTER_BASE_URL = "https://api.twitter.com";

      const content = { text: "Hello, world!" };
      const authHeader = { Authorization: "OAuth ..." };
      mockedOauth1Helper.getAuthHeaderForRequest.mockReturnValue(authHeader);
      mockedAxios.post.mockRejectedValue(new Error("Request failed"));

      const http = new HTTP();
      await http.post(content);

      expect(loggerService.error).toHaveBeenCalledWith(
        `There's an error when calling twitter API. Details: {}`
      );
    });
  });

  describe("get", () => {
    it("should send a GET request to Serp API", async () => {
      process.env.SERPAPI_BASE_URL = "https://serpapi.com";
      process.env.SERPAPI_KEY = "test-key";

      const responseData = { data: "some data" };
      mockedAxios.get.mockResolvedValue({ data: responseData });

      const http = new HTTP();
      const result = await http.get({});

      expect(mockedAxios.get).toHaveBeenCalledWith("https://serpapi.com/search", {
        params: {
          api_key: "test-key",
          q: Query.club,
          location: Query.location
        }
      });
      expect(result).toEqual(responseData);
    });

    it("should log an error when Serp API request fails", async () => {
      process.env.SERPAPI_BASE_URL = "https://serpapi.com";
      process.env.SERPAPI_KEY = "test-key";

      mockedAxios.get.mockRejectedValue(new Error("Request failed"));

      const http = new HTTP();
      await http.get({});

      expect(loggerService.error).toHaveBeenCalledWith(
        `There's an error when calling Serp API. Details: {}`
      );
    });
  });

  describe("sendEmail", () => {
    it("should send a POST request to Elastic Email API", async () => {
      process.env.ELASTIC_EMAIL_BASE_URL = "https://api.elasticemail.com";
      process.env.ELASTIC_EMAIL_API_KEY = "test-key";

      const content = "<p>Hello, world!</p>";
      const requestBody: EmailRequest = {
        Recipients: {
          To: [ElasticEmailDefaultContent.recipientAddress]
        },
        Content: {
          From: ElasticEmailDefaultContent.senderAddress,
          Subject: ElasticEmailDefaultContent.subject,
          Body: [
            {
              ContentType: "HTML",
              Content: content,
              Charset: "UTF-8"
            }
          ]
        }
      };

      const authHeader = { "X-ElasticEmail-ApiKey": "test-key" };

      mockedAxios.post.mockResolvedValue({ status: 200 });

      const http = new HTTP();
      await http.sendEmail(content, ElasticEmailDefaultContent.subject);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://api.elasticemail.com/emails/transactional",
        requestBody,
        { headers: authHeader }
      );
    });

    it("should log an error when Elastic Email API request fails", async () => {
      process.env.ELASTIC_EMAIL_BASE_URL = "https://api.elasticemail.com";
      process.env.ELASTIC_EMAIL_API_KEY = "test-key";

      const content = "<p>Hello, world!</p>";
      mockedAxios.post.mockRejectedValue(new Error("Request failed"));

      const http = new HTTP();
      await http.sendEmail(content);

      expect(loggerService.error).toHaveBeenCalledWith(
        `There's an error when calling Elastic Email API. Details: {}`
      );
    });
  });
});
