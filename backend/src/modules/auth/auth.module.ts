import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { RefreshToken } from './refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-default-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}