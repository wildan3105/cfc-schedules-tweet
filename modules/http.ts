import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";

import { Oauth1Helper } from "./oauth";
import { Content } from "../interfaces/tweet";
import { Query } from "../enums/query";

export class HTTP {
  async post(content: Content): Promise<void> {
    const request = {
      url: process.env.TWITTER_BASE_URL + "/2/tweets",
      method: "POST",
      body: content
    };

    const authHeader = Oauth1Helper.getAuthHeaderForRequest(
      request
    ) as unknown as AxiosRequestHeaders;
    try {
      await axios.post(request.url, request.body, { headers: authHeader });
    } catch (e) {
      console.error(e);
    }
  }

  async get(): Promise<void> {
    try {
      const response = await axios.get(process.env.SERPAPI_BASE_URL + "/search", {
        params: {
          api_key: process.env.SERPAPI_KEY,
          q: Query.club,
          location: Query.location
        }
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }
}
