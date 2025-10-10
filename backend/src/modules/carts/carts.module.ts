import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { CartsRepository } from './carts.repository';
import { Cart } from './carts.entity';
import { CartItem } from './cart_items.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    AuthModule,
    UsersModule,
  ],
  controllers: [CartsController],
  providers: [CartsService, CartsRepository],
  exports: [CartsService, CartsRepository],
})
export class CartsModule {}
