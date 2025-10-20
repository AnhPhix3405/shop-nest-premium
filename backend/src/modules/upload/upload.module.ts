import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule
  ],
  controllers: [UploadController],
  providers: [],
  exports: []
})
export class UploadModule {}
