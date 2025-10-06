import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from './types';

// Initial state
const initialState: AuthState = {
  user: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;