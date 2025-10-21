import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductsModule
  ],
  controllers: [UploadController],
  providers: [],
  exports: []
})
export class UploadModule {}
