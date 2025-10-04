'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import F404 from '@/components/errors/F404';
import { ReactNode } from 'react';

interface UserValidateProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export default function UserValidate({ 
  children, 
  allowedRoles = ['customer'], 
  requireAuth = true 
}: UserValidateProps) {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  // Kiểm tra xem user có đăng nhập không (nếu yêu cầu)
  if (requireAuth && !isAuthenticated) {
    return <F404 />;
  }

  // Kiểm tra xem user có tồn tại không (nếu yêu cầu đăng nhập)
  if (requireAuth && !user) {
    return <F404 />;
  }

  // Kiểm tra role của user có trong danh sách được phép không
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <F404 />;
  }

  // Nếu tất cả điều kiện đều thỏa mãn, render children
  return <>{children}</>;
}

// Higher-order component để wrap các page components
export function withUserValidation<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: {
    allowedRoles?: string[];
    requireAuth?: boolean;
  } = {}
) {
  const { allowedRoles = ['customer'], requireAuth = true } = options;
  
  return function ValidatedComponent(props: T) {
    return (
      <UserValidate allowedRoles={allowedRoles} requireAuth={requireAuth}>
        <WrappedComponent {...props} />
      </UserValidate>
    );
  };
}

// Hook để kiểm tra quyền trong component
export function useUserValidation(allowedRoles: string[] = ['customer']) {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  const isValid = () => {
    if (!isAuthenticated || !user) return false;
    return allowedRoles.includes(user.role);
  };
  
  const hasRole = (role: string) => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };
  
  return {
    isValid: isValid(),
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole
  };
}
