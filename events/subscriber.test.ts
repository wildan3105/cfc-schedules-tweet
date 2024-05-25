import { Subscriber } from "./subscriber";
import { loggerService } from "../modules/log";
import { HTTP } from "../modules/http";
import { RedisStorage } from "../modules/redis";
import { RedisTerms } from "../constants/redis";
import { RedisFixture } from "../interfaces/redis";

jest.mock("../modules/http");
jest.mock("../modules/log");

describe("Subscriber integration test", () => {
    let redisClient: RedisStorage;
    let subscriber: Subscriber;
    let mockHttpPost: jest.Mock;

    beforeAll(async () => {
        redisClient = new RedisStorage({
            redisURL: process.env.REDIS_URL
        })
        await redisClient.init();

        subscriber = new Subscriber(redisClient);
    })

    afterAll(async () => {
        await redisClient.close();
    })

    beforeEach(async () => {
        jest.clearAllMocks();
        mockHttpPost = HTTP.prototype.post as jest.Mock;
    })

    afterEach(async () => {
        jest.clearAllMocks();
        await redisClient.delete(RedisTerms.keyName);
    })

    describe("Subscriber normal flow", () => {
        it("should subscribe to a channel and log the error if any process encounters an error", async () => {
            const error = new Error("Subscribe error");

            jest.spyOn(redisClient, 'subscribe').mockImplementation(() => {
                throw error;
            });

            await subscriber.subscribeToChannel(RedisTerms.channelName);

            expect(loggerService.error).toHaveBeenCalledWith(expect.stringContaining("An error occurred when subscribing to upcoming-fixtures: Error: Subscribe error"));
        });
    })
});