import { Module } from '@nestjs/common';
import { ProtectedController } from '../users/protected.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProtectedController],
})
export class ProtectedModule {}