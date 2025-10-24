'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/types';
import { login as loginAction, logout as logoutAction } from '@/lib/store/authSlice';
import { API_BASE_URL, buildEndpoint } from '@/config/api';
import { toast } from '@/components/ui/use-toast';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  is_verified: boolean;
  role: string;
  access_token: string;
}

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role_id: number; // 3: seller, 4: customer
  avatar_url?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export default function useAuth(): AuthState & AuthActions {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${buildEndpoint.auth.login()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (response.ok && data.user) {
        // Dispatch to Redux store
        dispatch(loginAction({
          id: data.user.id,
          access_token: data.access_token,
          avatar_url: data.user.avatar_url || '',
          email: data.user.email,
          is_verified: data.user.is_verified,
          role: data.user.role.name,
          username: data.user.username,
        }));

        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng ${data.user.username}!`,
        });

        return {
          success: true,
          user: {
            id: data.user.id,
            access_token: data.access_token,
            avatar_url: data.user.avatar_url || '',
            email: data.user.email,
            is_verified: data.user.is_verified,
            role: data.user.role.name,
            username: data.user.username,
          }
        };
      } else {
        const errorMessage = data.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        setError(errorMessage);
        
        toast({
          title: "Đăng nhập thất bại",
          description: errorMessage,
          variant: "destructive",
        });

        return { success: false, message: errorMessage };
      }
      
    } catch (error: any) {
      const errorMessage = 'Không thể kết nối đến server. Vui lòng thử lại sau.';
      setError(errorMessage);
      
      toast({
        title: "Lỗi kết nối",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare data for API (remove empty avatar_url)
      const submitData = {
        username: data.username,
        email: data.email,
        password: data.password,
        role_id: data.role_id,
        ...(data.avatar_url && { avatar_url: data.avatar_url })
      };

      const response = await fetch(`${API_BASE_URL}${buildEndpoint.auth.register()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }

      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email để xác minh tài khoản.",
      });

      // Redirect to verification page
      setTimeout(() => {
        if (data.role_id === 4) { 
          router.push(`/customer/verification?email=${encodeURIComponent(data.email)}`);
        } else if (data.role_id === 3) {
          router.push(`/seller/verification?email=${encodeURIComponent(data.email)}`);
        }
      }, 2000);

      return { success: true };
      
    } catch (error: any) {
      const errorMessage = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      
      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Logout function
  const logout = useCallback(async () => {
    if (!user) return;

    // Confirm logout
    const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (!confirmLogout) return;

    setLoading(true);

    try {
      // Call logout API
      const response = await fetch(`${API_BASE_URL}${buildEndpoint.auth.logout()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      // Clear Redux state
      dispatch(logoutAction());
      
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
      });

      // Redirect to home page
      router.push('/');

    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Even if API fails, still logout locally
      dispatch(logoutAction());
      
      toast({
        title: "Lỗi đăng xuất",
        description: error.message || "Có lỗi xảy ra khi đăng xuất, nhưng bạn đã được đăng xuất khỏi thiết bị này",
        variant: "destructive"
      });

      // Still redirect to home
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [user, dispatch, router]);

  // Refresh user data (if needed for token refresh or profile updates)
  const refreshUser = useCallback(async () => {
    if (!user?.access_token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          dispatch(loginAction({
            ...user,
            ...data.user,
            role: data.user.role?.name || user.role,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [user, dispatch]);

  // Auto-refresh user on mount (optional)
  useEffect(() => {
    if (user?.access_token) {
      refreshUser();
    }
  }, []);

  // Redirect functions based on user role
  const getDefaultRedirectPath = useCallback((userRole: string) => {
    switch (userRole) {
      case 'customer':
        return '/customer/purchase';
      case 'seller':
        return '/seller/products';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  }, []);

  // Navigate to user's default page
  const navigateToUserPage = useCallback(() => {
    if (!user) return;
    const path = getDefaultRedirectPath(user.role);
    router.push(path);
  }, [user, router, getDefaultRedirectPath]);

  return {
    // State
    user,
    isAuthenticated: !!user,
    loading,
    error,

    // Actions
    login,
    register,
    logout,
    clearError,
    refreshUser,

    // Utility (you can add these as additional exports)
    // navigateToUserPage,
    // getDefaultRedirectPath,
  };
}
