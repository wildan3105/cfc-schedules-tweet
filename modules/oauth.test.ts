import oauth1a = require("oauth-1.0a");
import { Oauth1Helper } from "./oauth";
import { createHmac } from "crypto";
import { Content } from "../interfaces/tweet";

jest.mock("crypto", () => ({
    createHmac: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue("mock-digest"),
    }),
}));

jest.mock("oauth-1.0a", () => {
    const originalModule = jest.requireActual("oauth-1.0a");
  
    return {
      ...originalModule,
      prototype: {
        ...originalModule.prototype,
        getNonce: jest.fn().mockReturnValue("fixedNonce"),
        getTimeStamp: jest.fn().mockReturnValue("fixedTimestamp"),
      },
    };
  });

describe("Oauth1Helper", () => {
    const originalEnv = process.env;
    const request = {
        url: "https://api.twitter.com/2/tweets",
        method: "POST",
        body: {
            text: "Hello world!"
        } as Content,
    };

    beforeAll(() => {
        process.env = {
            ...originalEnv,
            API_KEY: "mockApiKey",
            API_SECRET_KEY: "mockApiSecretKey",
            ACCESS_TOKEN: "mockAccessToken",
            ACCESS_TOKEN_SECRET: "mockAccessTokenSecret",
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("should generate correct OAuth header for a request", () => {
        const header = Oauth1Helper.getAuthHeaderForRequest(request);

        const oauth = new oauth1a({
            consumer: {
                key: "mockApiKey",
                secret: "mockApiSecretKey"
            },
            signature_method: "HMAC-SHA1",
            hash_function(base_string: any, key: any) {
                return createHmac("sha1", key).update(base_string).digest("base64");
            },
        });

        const expectedAuthorization = oauth.authorize(request, {
            key: "mockAccessToken",
            secret: "mockAccessTokenSecret",
        });

        const expectedHeader = oauth.toHeader(expectedAuthorization);

        expect(header).toEqual(expectedHeader);
        expect(createHmac).toHaveBeenCalledWith("sha1", "mockApiSecretKey&mockAccessTokenSecret");
    })
})