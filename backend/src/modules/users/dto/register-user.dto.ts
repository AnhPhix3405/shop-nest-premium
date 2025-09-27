import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsIn([3, 4], { message: 'Role must be either 3 (seller) or 4 (customer)' })
  role_id?: number = 4; // Default to customer
}