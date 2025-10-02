import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import authReducer from './authSlice';
import { RootState } from './types';

// Persist config
const persistConfig = {
  key: 'user-storage',
  storage,
  whitelist: ['user'], // Only persist user data, not isAuthenticated
};

// Persisted reducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// Configure store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Persistor
export const persistor = persistStore(store);

// Types
export type AppDispatch = typeof store.dispatch;
export type { RootState } from './types';