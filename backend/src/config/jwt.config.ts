import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('JWT_SECRET', 'your-default-secret-key'),
  signOptions: {
    expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
  },
});

export const getRefreshJwtConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('REFRESH_TOKEN_SECRET', 'your-default-refresh-secret-key'),
  signOptions: {
    expiresIn: configService.get<string>('REFRESH_TOKEN_EXPIRES_IN', '7d'),
  },
});

export const jwtConstants = {
  accessTokenExpiry: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
};