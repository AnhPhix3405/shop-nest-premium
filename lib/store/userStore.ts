import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User interface
interface User {
  access_token: string;
  avatar_url: string;
  email: string;
  is_verified: boolean;
  role: string;
  username: string;
}

// Store interface
interface UserStore {
  user: User | null;
  login: (userData: User) => void;
}

// Create store with persistence
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      login: (userData: User) => set({ user: userData }),
    }),
    {
      name: 'user-storage', // localStorage key
    }
  )
);