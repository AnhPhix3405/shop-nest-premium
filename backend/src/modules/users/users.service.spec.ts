/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';
import { Role } from '../roles/roles.entity';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockRole: Role = {
    id: 1,
    name: 'customer',
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    avatar_url: 'https://example.com/avatar.jpg',
    role_id: 1,
    role: mockRole,
  };

  const mockRepository = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    findByRoleId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository) as jest.Mocked<UsersRepository>;
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.findByUsername).toHaveBeenCalledWith(createUserDto.username);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedpassword',
      });
    });

    it('should throw ConflictException if email exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Email already exists')
      );

      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.findByUsername).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if username exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
      };

      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Username already exists')
      );

      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.findByUsername).toHaveBeenCalledWith(createUserDto.username);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser];
      repository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user if found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found')
      );

      expect(repository.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
      };

      repository.findOne.mockResolvedValue(mockUser);
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(null);
      repository.update.mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual({ ...mockUser, ...updateUserDto });
      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(
        new NotFoundException('User with ID 999 not found')
      );

      expect(repository.findOne).toHaveBeenCalledWith(999);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should hash password if password is updated', async () => {
      const updateUserDto: UpdateUserDto = {
        password: 'newpassword123',
      };

      repository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('newhashedpassword' as never);
      repository.update.mockResolvedValue({ ...mockUser, password: 'newhashedpassword' });

      const result = await service.update(1, updateUserDto);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(repository.update).toHaveBeenCalledWith(1, {
        password: 'newhashedpassword',
      });
    });

    it('should throw ConflictException if email already exists for another user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      const existingUser = { ...mockUser, id: 2, role: { ...mockRole, id: 2, name: 'admin' } };
      repository.findOne.mockResolvedValue(mockUser);
      repository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        new ConflictException('Email already exists')
      );

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(repository.findByEmail).toHaveBeenCalledWith(updateUserDto.email);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists for another user', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'existinguser',
      };

      const existingUser = { ...mockUser, id: 2, role: { ...mockRole, id: 2, name: 'admin' } };
      repository.findOne.mockResolvedValue(mockUser);
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(existingUser);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        new ConflictException('Username already exists')
      );

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(repository.findByUsername).toHaveBeenCalledWith(updateUserDto.username);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('User with ID 999 not found')
      );

      expect(repository.findOne).toHaveBeenCalledWith(999);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validatePassword('plainpassword', 'hashedpassword');

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('plainpassword', 'hashedpassword');
    });

    it('should return false for invalid password', async () => {
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validatePassword('wrongpassword', 'hashedpassword');

      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if user not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
      expect(repository.findByEmail).toHaveBeenCalledWith('notfound@example.com');
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      repository.findByUsername.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(repository.findByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should return null if user not found', async () => {
      repository.findByUsername.mockResolvedValue(null);

      const result = await service.findByUsername('notfound');

      expect(result).toBeNull();
      expect(repository.findByUsername).toHaveBeenCalledWith('notfound');
    });
  });

  describe('count', () => {
    it('should return user count', async () => {
      repository.count.mockResolvedValue(5);

      const result = await service.count();

      expect(result).toBe(5);
      expect(repository.count).toHaveBeenCalled();
    });
  });

  describe('findByRole', () => {
    it('should return users by role', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 2, username: 'testuser2', email: 'test2@example.com' }];
      repository.findByRoleId.mockResolvedValue(mockUsers);

      const result = await service.findByRole(1);

      expect(result).toEqual(mockUsers);
      expect(repository.findByRoleId).toHaveBeenCalledWith(1);
    });

    it('should return empty array if no users found for role', async () => {
      repository.findByRoleId.mockResolvedValue([]);

      const result = await service.findByRole(999);

      expect(result).toEqual([]);
      expect(repository.findByRoleId).toHaveBeenCalledWith(999);
    });
  });
});