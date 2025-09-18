/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './refresh-token.entity';
import * as bcrypt from 'bcryptjs';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  role_id: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginPayload: LoginPayload): Promise<AuthTokens> {
    const user = await this.validateUser(loginPayload.email, loginPayload.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role_id: user.role_id,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
    });

    // Save refresh token to database
    await this.saveRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token exists and is active in database
      const tokenRecord = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, user_id: user.id, is_active: true },
      });

      if (!tokenRecord || tokenRecord.expires_at < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        role_id: user.role_id,
      };

      const access_token = this.jwtService.sign(newPayload);
      const new_refresh_token = this.jwtService.sign(newPayload, { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
      });

      // Deactivate old refresh token
      await this.refreshTokenRepository.update(tokenRecord.id, { is_active: false });

      // Save new refresh token
      await this.saveRefreshToken(user.id, new_refresh_token);

      return {
        access_token,
        refresh_token: new_refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token: refreshToken },
      { is_active: false }
    );
  }

  private async saveRefreshToken(userId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    const expiresInDays = parseInt(process.env.JWT_REFRESH_EXPIRES_IN?.replace('d', '') || '7');
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user_id: userId,
      expires_at: expiresAt,
      is_active: true,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }
}