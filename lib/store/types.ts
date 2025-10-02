// Types for User
export interface User {
  access_token: string;
  avatar_url: string;
  email: string;
  is_verified: boolean;
  role: string;
  username: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Root state type
export interface RootState {
  auth: AuthState;
}