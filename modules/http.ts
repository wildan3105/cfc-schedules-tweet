import axios, { AxiosRequestHeaders } from "axios";

import { Oauth1Helper } from "./oauth";
import { Content } from "../interfaces/tweet";
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
      console.error(e);
    }
  }

  async get(search_query: string) {
    const { SERPAPI_BASE_URL, SERPAPI_KEY } = process.env;
    try {
      const response = await axios.get(SERPAPI_BASE_URL + "/search", {
        params: {
          api_key: SERPAPI_KEY,
          q: search_query,
          location: Query.location
        }
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }
}
