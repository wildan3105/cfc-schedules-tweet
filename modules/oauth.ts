import oauth1a = require("oauth-1.0a");
import { createHmac, BinaryLike, KeyObjectType } from "crypto";

import { Content } from "../interfaces/tweet";

export class Oauth1Helper {
  static getAuthHeaderForRequest(request: { url: string; method: string; body: Content }) {
    const { API_KEY, API_SECRET_KEY, ACCESS_TOKEN, ACCESS_TOKEN_SECRET } = process.env;
    const oauth = new oauth1a({
      consumer: {
        key: API_KEY,
        secret: API_SECRET_KEY
      },
      signature_method: "HMAC-SHA1",
      hash_function(base_string: BinaryLike, key: BinaryLike | KeyObjectType) {
        return createHmac("sha1", key).update(base_string).digest("base64");
      }
    });

    const authorization = oauth.authorize(request, {
      key: ACCESS_TOKEN,
      secret: ACCESS_TOKEN_SECRET
    });

    return oauth.toHeader(authorization);
  }
}
