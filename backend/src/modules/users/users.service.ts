/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Kiểm tra email đã tồn tại
    const existingUserByEmail = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Kiểm tra username đã tồn tại
    const existingUserByUsername = await this.usersRepository.findByUsername(createUserDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Tạo user với password đã hash
    const userWithHashedPassword = {
      ...createUserDto,
      password: hashedPassword,
    };

    return await this.usersRepository.create(userWithHashedPassword);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.findAll();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findByUsername(username);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Kiểm tra user có tồn tại
    await this.findOne(id);

    // Nếu update email, kiểm tra email mới có trùng không
    if (updateUserDto.email) {
      const existingUser = await this.usersRepository.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    // Nếu update username, kiểm tra username mới có trùng không
    if (updateUserDto.username) {
      const existingUser = await this.usersRepository.findByUsername(updateUserDto.username);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username already exists');
      }
    }

    // Nếu update password, hash password mới
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    const updatedUser = await this.usersRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    // Kiểm tra user có tồn tại
    await this.findOne(id);
    await this.usersRepository.remove(id);
  }

  async count(): Promise<number> {
    return await this.usersRepository.count();
  }

  async findByRole(roleId: number): Promise<User[]> {
    return await this.usersRepository.findByRoleId(roleId);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}