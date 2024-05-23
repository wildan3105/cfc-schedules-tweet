/* eslint-disable @typescript-eslint/no-empty-function */
import Redis from "ioredis";
import { EventEmitter } from "events";

import { loggerService } from "./log";
interface IRedisConfig {
  redisURL: string;
}

export class RedisStorage extends EventEmitter {
  private readonly redisConfig: IRedisConfig;

  private redisClient: Redis;

  private isInitialized = false;

  constructor(redisConfig: IRedisConfig) {
    super();
    this.redisConfig = redisConfig;
  }

  public async init(): Promise<void> {
    const maxRetries = 5;
    const retryDelay = 5000;
    let retries = 0;
  
    while (!this.isInitialized && retries < maxRetries) {
      try {
        this.redisClient = new Redis(this.redisConfig.redisURL);
  
        await this.setupListeners();
        await this.waitToConnect();
        this.isInitialized = true;
      } catch (error) {
        loggerService.error(`Failed to connect to Redis. Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retries++;
      }
    }
  
    if (!this.isInitialized) {
      loggerService.error(`Failed to connect to Redis after ${maxRetries} retries. Giving up.`);
      throw new Error("Failed to connect to Redis.");
    }
  }
  

  private async waitToConnect() {
    return new Promise<void>(resolve => {
      this.redisClient.on("connect", () => {
        this.isInitialized = true;

        return resolve();
      });
    });
  }

  private async setupListeners() {
    // for future use
    this.redisClient.on("ready", () => {});
    this.redisClient.on("error", e => {
      loggerService.error(`an error occured: ${e}`);
    });
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

  public async get(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  public async set(key: string, value: string | number, ttl_value: number): Promise<string> {
    return this.redisClient.set(key, value, "EX", ttl_value); // in seconds
  }

  public async publish(channel: string, message: string): Promise<number> {
    return this.redisClient.publish(channel, message);
  }

  public async subscribe(channel: string): Promise<void> {
    this.redisClient.subscribe(channel);
    this.redisClient.on("message", (channel, message) => {
      this.emit("message", channel, message);
    });
  }

  public async getTTL(key: string): Promise<number> {
    return this.redisClient.ttl(key);
  }

  public async expireKey(key: string): Promise<number> {
    return this.redisClient.expire(key, 0);
  }
}
