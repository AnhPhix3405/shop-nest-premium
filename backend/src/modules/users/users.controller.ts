/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
// import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard) // Tất cả routes cần authentication
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('admin') // Chỉ admin mới được tạo user
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get('get-all')
  @UseGuards(RolesGuard)
  @Roles('admin') // Chỉ admin mới được xem danh sách tất cả users
  async findAll(@CurrentUser() currentUser: User): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get('count')
  @UseGuards(RolesGuard)
  @Roles('admin') // Chỉ admin mới được xem số lượng users
  async count(@CurrentUser() currentUser: User): Promise<{ count: number }> {
    const count = await this.usersService.count();
    return { count };
  }

  @Get('search')
  @UseGuards(RolesGuard)
  @Roles('admin') // Chỉ admin mới được search users
  async search(
    @CurrentUser() currentUser: User,
    @Query('email') email?: string,
    @Query('username') username?: string
  ): Promise<User | null> {
    if (email) {
      return await this.usersService.findByEmail(email);
    }
    if (username) {
      return await this.usersService.findByUsername(username);
    }
    return null;
  }

  @Get('role/:roleId')
  @UseGuards(RolesGuard)
  @Roles('admin') // Chỉ admin mới được xem users theo role
  async findByRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @CurrentUser() currentUser: User
  ): Promise<User[]> {
    return await this.usersService.findByRole(roleId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User
  ): Promise<User> {
    // User có thể xem thông tin của chính mình hoặc admin có thể xem tất cả
    if (currentUser.role?.name !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return await this.usersService.findOne(id);
  }

  @Patch('profile')
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User
  ): Promise<User> {
    // User chỉ có thể cập nhật profile của chính mình
    return await this.usersService.update(currentUser.id, updateUserDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin') // Chỉ admin mới được cập nhật user khác
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User
  ): Promise<User> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('admin') // Chỉ admin mới được xóa user
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User
  ): Promise<void> {
    await this.usersService.remove(id);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin') // Chỉ admin mới được verify user
  async verifyUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User
  ): Promise<User> {
    return await this.usersService.verifyUser(id);
  }

  @Patch(':id/unverify')
  @UseGuards(RolesGuard)
  @Roles('admin') // Chỉ admin mới được unverify user
  async unverifyUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User
  ): Promise<User> {
    return await this.usersService.unverifyUser(id);
  }
}