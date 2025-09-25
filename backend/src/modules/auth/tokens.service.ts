import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity'
import { JwtPayload } from './dto/login-response.dto';
import { User } from '../users/users.entity';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Generate access token with user information
   */
  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role?.name || 'customer',
      roleId: user.role?.id || 0,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Save refresh token to database
    await this.saveRefreshToken(user.id, refreshToken);

    return refreshToken;
  }

  /**
   * Save refresh token to database
   */
  private async saveRefreshToken(userId: number, token: string): Promise<void> {
    // Deactivate old refresh tokens for this user
    await this.refreshTokenRepository.update(
      { user_id: userId, is_active: true },
      { is_active: false }
    );

    // Calculate expiration date
    const expiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_SECONDS') || 7 * 24 * 60 * 60; // 7 days in seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Create new refresh token entry
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token,
      user_id: userId,
      expires_at: expiresAt,
      is_active: true,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload as JwtPayload;
    } catch {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<{ sub: number; type: string }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const typedPayload = payload as { sub: number; type: string };

      // Check if refresh token exists and is active in database
      const refreshTokenEntity = await this.refreshTokenRepository.findOne({
        where: {
          token,
          is_active: true,
        },
      });

      if (!refreshTokenEntity) {
        throw new Error('Refresh token not found or inactive');
      }

      // Check if token is expired
      if (refreshTokenEntity.expires_at < new Date()) {
        throw new Error('Refresh token expired');
      }

      return typedPayload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid refresh token: ${message}`);
    }
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token, is_active: true },
      { is_active: false }
    );
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllRefreshTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { user_id: userId, is_active: true },
      { is_active: false }
    );
  }

  /**
   * Get token expiration time in seconds
   */
  getAccessTokenExpiresIn(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    
    // Convert time string to seconds
    if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    } else if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    } else {
      return parseInt(expiresIn); // Assume seconds
    }
  }

  /**
   * Clean up expired refresh tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expires_at: new Date(),
      is_active: false,
    });
  }
}
