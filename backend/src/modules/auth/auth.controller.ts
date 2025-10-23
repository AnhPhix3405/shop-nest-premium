import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { User } from '../users/users.entity';
import { Public } from './decorators/public.decorator';
import { MailService } from '../mail/mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Register endpoint - Chỉ tạo được customer (role_id: 4) hoặc seller (role_id: 3)
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return await this.authService.register(registerUserDto);
  }

  /**
   * Login endpoint
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  /**
   * Refresh token endpoint
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ access_token: string; expires_in: number }> {
    return await this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  /**
   * Logout endpoint
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body('user_id') userId: number,
  ): Promise<{ message: string }> {
    return await this.authService.logout(userId);
  }

  /**
   * Logout from all devices endpoint
   * POST /auth/logout-all
   */
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Body('user_id') userId: number,
  ): Promise<{ message: string }> {
    return await this.authService.logoutAll(userId);
  }

  /**
   * Force logout endpoint - Đăng xuất khỏi tất cả thiết bị trước khi login
   * POST /auth/force-logout
   */
  @Public()
  @Post('force-logout')
  @HttpCode(HttpStatus.OK)
  async forceLogout(
    @Body('user_id') userId: number,
  ): Promise<{ message: string }> {
    return await this.authService.logoutAll(userId);
  }

  /**
   * Send OTP endpoint - Gửi mã OTP 6 số đến email
   * POST /auth/send-otp
   */
  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<{
    success: boolean;
    message: string;
    waitTime?: number;
  }> {
    return await this.mailService.sendOTP(sendOtpDto.email);
  }

  /**
   * Verify OTP endpoint - Xác minh mã OTP
   * POST /auth/verify-otp
   */
  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{
    success: boolean;
    message: string;
  }> {
    return await this.mailService.verifyOTP(verifyOtpDto.email, verifyOtpDto.code);
  }
}
