/* eslint-disable @typescript-eslint/no-empty-function */
import Redis from "ioredis";

interface IRedisConfig {
  redisURL: string;
}

export class RedisStorage {
  private readonly redisConfig: IRedisConfig;

  private redisClient: Redis;

  private isInitialized = false;

  constructor(redisConfig: IRedisConfig) {
    this.redisConfig = redisConfig;
  }

  public async init(): Promise<void> {
    this.redisClient = new Redis(this.redisConfig.redisURL);

    await this.listeners();
    await this.waitToConnect();
  }

  private async waitToConnect() {
    return new Promise<void>(resolve => {
      this.redisClient.on("connect", () => {
        this.isInitialized = true;

        return resolve();
      });
    });
  }

  private async listeners() {
    // for future use
    this.redisClient.on("ready", () => {});
    this.redisClient.on("error", () => {});
    this.redisClient.on("close", async () => {});
    this.redisClient.on("reconnecting", () => {});
    /* Gets fired after 'close' when no more reconnect is there */
    this.redisClient.on("end", async () => {});
    this.redisClient.on("wait", () => {});
  }

  public async close(): Promise<void> {
    this.redisClient.quit();
  }

  public initialized(): boolean {
    return this.isInitialized;
  }

  public async get(key: string) {
    return this.redisClient.get(key);
  }

  public async set(key: string, value: string | number, ttl_value: number) {
    return this.redisClient.set(key, value, "EX", ttl_value); // in seconds
  }

  public async publish(channel: string, message: string) {
    return this.redisClient.publish(channel, message);
  }

  public async subscribe(channel: string) {
    return this.redisClient.subscribe(channel);
  }
}
