import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule, // Import RedisModule để sử dụng RedisService
  ],
  providers: [MailService],
  exports: [MailService], // Export để sử dụng trong AuthModule
})
export class MailModule {}
