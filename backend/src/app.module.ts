import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProtectedModule } from './modules/protected/protected.module';
import { CartsModule } from './modules/carts/carts.module';
import { CorsMiddleware } from './middleware/cors.middleware';
import { RedisModule } from './modules/redis/redis.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    // Config module để đọc .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // TypeORM configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Tắt auto-sync để tránh conflict với DB hiện có
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    
    // Feature modules
    RedisModule,
    RolesModule,
    UsersModule,
    AuthModule,
    ProtectedModule,
    CartsModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}
