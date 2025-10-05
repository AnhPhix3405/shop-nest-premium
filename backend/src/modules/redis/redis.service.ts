/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor(private configService: ConfigService) {
    // Kiểm tra xem có sử dụng Redis Cloud không
    const useRedisCloud = this.configService.get<string>('REDIS_CLOUD_HOST');
    
    let redisConfig: any;
    
    if (useRedisCloud) {
      // Cấu hình Redis Cloud theo format mới
      console.log('🌐 Using Redis Cloud configuration');
      redisConfig = {
        username: this.configService.get<string>('redis.username'),
        password: this.configService.get<string>('redis.password'),
        host: this.configService.get<string>('redis.socket.host'),
        port: this.configService.get<number>('redis.socket.port'),
        db: this.configService.get<number>('redis.db'),
        connectTimeout: this.configService.get<number>('redis.connectTimeout', 30000),
        lazyConnect: this.configService.get<boolean>('redis.lazyConnect', true),
        maxRetriesPerRequest: this.configService.get<number>('redis.maxRetriesPerRequest', 3),
        retryDelayOnFailover: this.configService.get<number>('redis.retryDelayOnFailover', 100),
        enableReadyCheck: this.configService.get<boolean>('redis.enableReadyCheck', true),
        keepAlive: this.configService.get<number>('redis.socket.keepAlive', 30000),
      };

      // Thêm TLS nếu được cấu hình
      const tlsConfig = this.configService.get('redis.tls');
      if (tlsConfig) {
        redisConfig.tls = tlsConfig;
      }
    } else {
      // Cấu hình Redis Local (fallback cho development)
      console.log('🏠 Using Local Redis configuration');
      redisConfig = {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
        db: this.configService.get<number>('REDIS_DB', 0),
        connectTimeout: 10000,
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        keepAlive: 30000,
      };
    }

    this.redisClient = new Redis(redisConfig as any);

    this.redisClient.on('connect', () => {
      console.log('✅ Redis Cloud connected successfully');
    });

    this.redisClient.on('ready', () => {
      console.log('🚀 Redis Cloud ready to receive commands');
    });

    this.redisClient.on('error', (err) => {
      console.error('❌ Redis Cloud Client Error:', err);
    });

    this.redisClient.on('close', () => {
      console.log('🔌 Redis Cloud connection closed');
    });

    this.redisClient.on('reconnecting', () => {
      console.log('🔄 Redis Cloud reconnecting...');
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

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

  // Lấy TTL của key (thời gian sống còn lại)
  async getTTL(key: string): Promise<number> {
    return this.redisClient.ttl(key);
  }

  // Đặt TTL cho key đã tồn tại
  async expire(key: string, ttlInSeconds: number): Promise<boolean> {
    const result = await this.redisClient.expire(key, ttlInSeconds);
    return result === 1;
  }

  // Tăng giá trị counter
  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  // ==================== OTP METHODS ====================

  /**
   * Lưu OTP với TTL
   * @param email - Email người dùng
   * @param otp - Mã OTP
   * @param ttlInSeconds - Thời gian sống (mặc định 60s = 1 phút)
   */
  async setOTP(email: string, otp: string, ttlInSeconds: number = 60): Promise<void> {
    const key = `otp:${email}`;
    const otpData = {
      code: otp,
      createdAt: new Date().toISOString()
    };
    await this.set(key, JSON.stringify(otpData), ttlInSeconds);
  }

  /**
   * Lấy OTP theo email
   * @param email - Email người dùng
   * @returns Object chứa OTP và thời gian tạo, hoặc null nếu không tồn tại
   */
  async getOTP(email: string): Promise<{ code: string; createdAt: string } | null> {
    const key = `otp:${email}`;
    const data = await this.get(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Xóa OTP sau khi đã sử dụng
   * @param email - Email người dùng
   */
  async deleteOTP(email: string): Promise<void> {
    const key = `otp:${email}`;
    await this.del(key);
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