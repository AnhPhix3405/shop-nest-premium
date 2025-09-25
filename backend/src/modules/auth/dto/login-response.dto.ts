export class LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    avatar_url: string;
    role: {
      id: number;
      name: string;
    };
  };
  expires_in: number; // Token expiration time in seconds
}

export interface JwtPayload {
  sub: number; // User ID
  username: string;
  email: string;
  role: string;
  roleId: number;
  iat?: number;
  exp?: number;
}