/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor(private configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      db: this.configService.get<number>('redis.db'),
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK' | null> {
    if (ttl) {
      return this.redisClient.set(key, value, 'EX', ttl);
    }
    return this.redisClient.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  // Test Redis connection
  async ping(): Promise<string> {
    return this.redisClient.ping();
  }

  // Test Redis with set/get operation
  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      // Test ping
      const pong = await this.ping();
      
      // Test set/get
      const testKey = 'test:connection';
      const testValue = `Redis test - ${new Date().toISOString()}`;
      
      await this.set(testKey, testValue, 10); // TTL 10 seconds
      const retrievedValue = await this.get(testKey);
      
      if (retrievedValue === testValue) {
        await this.del(testKey); // Clean up
        return {
          status: 'success',
          message: `Redis is working! Ping: ${pong}, Set/Get test passed`
        };
      } else {
        return {
          status: 'error',
          message: 'Redis set/get test failed'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Redis connection failed: ${error.message}`
      };
    }
  }
}