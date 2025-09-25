import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './users.entity';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  /**
   * Route chỉ cần authentication
   */
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return {
      message: 'This is your profile',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role?.name || 'customer',
      },
    };
  }

  /**
   * Route chỉ cho Admin
   */
  @Get('admin-only')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAdminData(@CurrentUser() user: User) {
    return {
      message: 'This is admin-only data',
      user: user.username,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Route cho Admin hoặc Seller
   */
  @Get('admin-seller')
  @UseGuards(RolesGuard)
  @Roles('admin', 'seller')
  getAdminSellerData(@CurrentUser() user: User) {
    return {
      message: 'This is admin or seller data',
      user: user.username,
      role: user.role?.name,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Route cho tất cả authenticated users
   */
  @Get('dashboard')
  getDashboard(@CurrentUser() user: User) {
    return {
      message: 'Welcome to your dashboard',
      user: {
        id: user.id,
        username: user.username,
        role: user.role?.name || 'customer',
      },
      stats: {
        loginTime: new Date().toISOString(),
        totalUsers: 100, // Mock data
      },
    };
  }
}