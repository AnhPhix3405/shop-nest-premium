import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  /**
   * Register new user - Chỉ tạo được customer (role_id: 4) hoặc seller (role_id: 3)
   */
  async register(registerUserDto: RegisterUserDto): Promise<User> {
    return await this.usersService.register(registerUserDto);
  }

  /**
   * Authenticate user and generate tokens
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { identifier, password } = loginDto;

    // Find user by email or username
    let user: User | null = null;
    
    // Try to find by email first
    if (identifier.includes('@')) {
      user = await this.usersService.findByEmail(identifier);
    } else {
      // Try to find by username
      user = await this.usersService.findByUsername(identifier);
    }

    // If not found by first method, try the other method
    if (!user) {
      if (identifier.includes('@')) {
        user = await this.usersService.findByUsername(identifier);
      } else {
        user = await this.usersService.findByEmail(identifier);
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user email is verified
    if (!user.is_verified) {
      throw new UnauthorizedException('Bạn chưa xác minh email. Vui lòng kiểm tra email và xác minh tài khoản trước khi đăng nhập.');
    }

    // Check if user already has active refresh tokens (someone else is logged in)
    const hasActiveTokens = await this.tokensService.hasActiveRefreshTokens(user.id);
    if (hasActiveTokens) {
      throw new UnauthorizedException('Tài khoản này đang được sử dụng trên thiết bị khác. Vui lòng đăng xuất khỏi thiết bị khác hoặc liên hệ quản trị viên.');
    }

    // Generate tokens
    const accessToken = this.tokensService.generateAccessToken(user);
    const refreshToken = await this.tokensService.generateRefreshToken(user);

    // Prepare response
    const response: LoginResponseDto = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url || '',
        is_verified: user.is_verified,
        role: {
          id: user.role?.id || 0,
          name: user.role?.name || 'customer',
        },
      },
      expires_in: this.tokensService.getAccessTokenExpiresIn(),
    };

    return response;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      // Verify refresh token
      const payload = await this.tokensService.verifyRefreshToken(refreshToken);
      
      // Get user by ID from payload
      const user = await this.usersService.findOne(payload.sub);
      
      // Generate new access token
      const newAccessToken = this.tokensService.generateAccessToken(user);
      
      return {
        access_token: newAccessToken,
        expires_in: this.tokensService.getAccessTokenExpiresIn(),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user by revoking all refresh tokens of that user
   */
  async logout(userId: number): Promise<{ message: string }> {
    try {
      await this.tokensService.revokeAllRefreshTokens(userId);
      return { message: 'Đăng xuất thành công' };
    } catch {
      throw new UnauthorizedException('Đăng xuất thất bại');
    }
  }

  /**
   * Logout from all devices by revoking all refresh tokens
   */
  async logoutAll(userId: number): Promise<{ message: string }> {
    try {
      await this.tokensService.revokeAllRefreshTokens(userId);
      return { message: 'Logged out from all devices successfully' };
    } catch {
      throw new BadRequestException('Failed to logout from all devices');
    }
  }

  /**
   * Validate user from access token
   */
  async validateUser(accessToken: string): Promise<User> {
    try {
      const payload = this.tokensService.verifyAccessToken(accessToken);
      const user = await this.usersService.findOne(payload.sub);
      return user;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
