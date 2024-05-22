import supertest from "supertest";
import { MatchFetcher } from "../jobs/match-fetcher";
import { MockSerpAPIServer, startMockSerpAPIServer } from "./mock-servers/serp-api";

export interface Suite {
    beforeEach: () => Promise<void>;
    afterEach: () => Promise<void>;
    afterAll: () => Promise<void>;

    mockSerpAPIServer: MockSerpAPIServer | undefined;
}

export const createSuite = async(
    opts: {
        startMockSerpAPIServer?: boolean
    } = {}
): Promise<Suite> => {

    const serpAPIServer = opts.startMockSerpAPIServer ? await startMockSerpAPIServer() : undefined;

    return {
        beforeEach: async () => {},
        afterEach: async () => {
            serpAPIServer?.clearRequests();
        },
        afterAll: async () => {
            if (serpAPIServer) {
                await new Promise<void>((resolve, reject) => {
                    serpAPIServer.server.close((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            }
        },
        mockSerpAPIServer: serpAPIServer
    };
}
