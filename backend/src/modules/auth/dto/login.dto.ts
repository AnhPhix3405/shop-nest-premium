import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Can be email or username

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}