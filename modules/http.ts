import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";

import { Oauth1Helper } from "./oauth";
import { Content } from "../interfaces/tweet";
import { EmailRequest } from "../interfaces/elastic-email-api";
import { APIResponse } from "../interfaces/serp-api";
import { ElasticEmailDefaultContent } from "../constants/elastic-email";
import { Query } from "../enums/query";
import { loggerService } from "./log";

interface ClubQuery {
  club?: string;
  location?: string;
}

export class HTTP {
  async post(content: Content) {
    const { TWITTER_BASE_URL } = process.env;
    const request = {
      url: TWITTER_BASE_URL + "/2/tweets",
      method: "POST",
      body: content
    };

    const authHeader = Oauth1Helper.getAuthHeaderForRequest(
      request
    ) as unknown as AxiosRequestHeaders;
    try {
      await axios.post(request.url, request.body, { headers: authHeader });
    } catch (e) {
      loggerService.error(
        `There's an error when calling twitter API. Details: ${JSON.stringify(e)}`
      );
    }
  }

  async get(q: ClubQuery): Promise<APIResponse | undefined> {
    const { SERPAPI_BASE_URL, SERPAPI_KEY } = process.env;
    try {
      const response: AxiosResponse = await axios.get(SERPAPI_BASE_URL + "/search", {
        params: {
          api_key: SERPAPI_KEY,
          q: q.club || Query.club,
          location: q.location || Query.location
        }
      });
      return response.data;
    } catch (e) {
      loggerService.error(`There's an error when calling Serp API. Details: ${JSON.stringify(e)}`);
    }
  }

  async sendEmail(content: string, subject?: string): Promise<void> {
    const { ELASTIC_EMAIL_BASE_URL, ELASTIC_EMAIL_API_KEY } = process.env;
    const requestBody: EmailRequest = {
      Recipients: {
        To: [ElasticEmailDefaultContent.recipientAddress]
      },
      Content: {
        From: ElasticEmailDefaultContent.senderAddress,
        Subject: subject || ElasticEmailDefaultContent.subject,
        Body: [
          {
            ContentType: "HTML",
            Content: content,
            Charset: "UTF-8"
          }
        ]
      }
    };
    const request = {
      url: ELASTIC_EMAIL_BASE_URL + "/emails/transactional",
      method: "POST",
      body: requestBody
    };
    const authHeader = {
      "X-ElasticEmail-ApiKey": ELASTIC_EMAIL_API_KEY
    } as unknown as AxiosRequestHeaders;

    try {
      await axios.post(request.url, request.body, { headers: authHeader });
    } catch (e) {
      loggerService.error(
        `There's an error when calling Elastic Email API. Details: ${JSON.stringify(e)}`
      );
    }
  }
}
