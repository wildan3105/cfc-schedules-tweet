import { Suite, createSuite } from "../tests/utils";
// import { MatchFetcher } from "./match-fetcher";

describe("Match fetcher integration test", () => {
    let suite: Suite;

    beforeAll(async () => {
        // ensure redis is connected
        // ensure 'fixtures' key is set with short-lived duration
        suite = await createSuite({ startMockSerpAPIServer: true });
    });

    afterAll(async () => {
        await suite.afterAll();
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
            // Perform your test actions here
            // Call the function that triggers the SerpAPI request

            // Perform assertions
            const query = 'Chelsea FC';

            suite.mockSerpAPIServer?.assertRequests((requests) => {
                return requests.every((req) => {
                    return req.q === query; // Ensure the query parameter is checked correctly
                });
            });
        });
    });
});
