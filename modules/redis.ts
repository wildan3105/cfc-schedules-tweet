/* eslint-disable @typescript-eslint/no-empty-function */
import Redis from 'ioredis';

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
        console.log('wait to connect?')
        return new Promise<void>(resolve => {
          this.redisClient.on("connect", () => {
            this.isInitialized = true;

            console.log('connected!');
    
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
        this.redisClient.disconnect();
      }
    
      public initialized(): boolean {
        return this.isInitialized;
      }
      
      public async get() {
        return this.redisClient.get('ping')
      }
}