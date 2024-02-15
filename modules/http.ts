import axios, { AxiosRequestHeaders } from "axios";

import { Oauth1Helper } from "./oauth";
import { Content } from "../interfaces/tweet";
import { EmailRequest } from "../interfaces/elastic-email-api";
import { ElasticEmailDefaultContent } from "../constants/elastic-email";
import { Query } from "../enums/query";

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
      console.error(`There's an error when calling twitter API. Details: ${e}`);
    }
  }

  async get() {
    const { SERPAPI_BASE_URL, SERPAPI_KEY } = process.env;
    try {
      const response = await axios.get(SERPAPI_BASE_URL + "/search", {
        params: {
          api_key: SERPAPI_KEY,
          q: Query.club
        }
      });
      return response.data;
    } catch (e) {
      console.error(`There's an error when calling Serp API. Details: ${e}`);
    }
  }

  async sendEmail(content: string) {
    const { ELASTIC_EMAIL_BASE_URL, ELASTIC_EMAIL_API_KEY } = process.env;
    const requestBody: EmailRequest = {
      Recipients: {
        To: [ElasticEmailDefaultContent.recipientAddress]
      },
      Content: {
        From: ElasticEmailDefaultContent.senderAddress,
        Subject: ElasticEmailDefaultContent.subject,
        Body: [{
          ContentType: "HTML",
          Content: content,
          Charset: "UTF-8"
        }]
      }
    }
    const request = {
      url: ELASTIC_EMAIL_BASE_URL + "/emails/transactional",
      method: "POST",
      body: requestBody
    };
    const authHeader = {
      'X-ElasticEmail-ApiKey': ELASTIC_EMAIL_API_KEY
    } as AxiosRequestHeaders;

    try {
      await axios.post(request.url, request.body, { headers: authHeader });
    } catch (e) {
      console.error(`There's an error when calling Elastic Email API. Details: ${e}`);
    }
  }
}
