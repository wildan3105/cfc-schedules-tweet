import { Suite, createSuite } from "../tests/utils";
import * as supertest from "supertest";
import { MatchFetcher } from "./match-fetcher";

describe("Match fetcher integration test", () => {
    let suite: Suite;

    beforeAll(async () => {
        // ensure redis is connected
        // ensure 'fixtures' key is set with short-lived duration
        suite = await createSuite({ startMockSerpAPIServer: true });
    });

    afterAll(async () => {
        suite.afterAll();
    });

    beforeEach(async () => {
        await suite.beforeEach();
    });

    afterEach(async () => {
        await suite.afterEach();
    });

    // 1) first scenario
    // redis connected, key is expired thus need to be set
    describe('Happy scenario: redis connected, key is expired', () => {
        it('should handle expired key and call SerpAPI', async () => {
            // Simulate making the request to SerpAPI
            const api_key = 'your-api-key';
            const query = 'bayer+leverkusen+fc+fixtures';
            const location = 'Indonesia';

            // Simulate the request (replace this with your actual request logic)
            await supertest('http://localhost:8888')
                .get('/search')
                .query({ api_key, q: query, location });

            // Perform assertions
            suite.mockSerpAPIServer?.assertRequests((requests) => {
                return requests.every((req) => {
                    return req.q === query && req.location === location;
                });
            });
        });
    });
});
