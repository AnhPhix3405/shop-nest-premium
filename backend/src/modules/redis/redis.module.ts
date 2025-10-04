// src/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from '../../config/redis.config';
import { RedisService } from './redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [redisConfig],
      isGlobal: true, // Make config available globally
    }),
  ],
  providers: [RedisService],
  exports: [RedisService], // Export the service to be used in other modules
})
export class RedisModule {}