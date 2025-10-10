'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import F404 from '@/components/errors/F404';
import { ReactNode } from 'react';

interface AuthMiddlewareProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
  fallbackComponent?: React.ComponentType;
}

/**
 * Authentication and Authorization Middleware Component
 * Protects routes based on user authentication and role permissions
 */
export default function AuthMiddleware({ 
  children, 
  allowedRoles = ['customer'], 
  requireAuth = true,
  fallbackComponent: FallbackComponent = F404
}: AuthMiddlewareProps) {
  const { user } = useAppSelector(state => state.auth);

  // Check if user authentication is required and user exists
  if (requireAuth && !user) {
    return <FallbackComponent />;
  }

  // Check if user role is in allowed roles list
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <FallbackComponent />;
  }

  // If all conditions are satisfied, render children
  return <>{children}</>;
}

/**
 * Higher-order component for wrapping page components with authentication middleware
 */
export function withAuthMiddleware<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  middlewareOptions: {
    allowedRoles?: string[];
    requireAuth?: boolean;
    fallbackComponent?: React.ComponentType;
  } = {}
) {
  const { 
    allowedRoles = ['customer'], 
    requireAuth = true,
    fallbackComponent = F404
  } = middlewareOptions;
  
  return function AuthProtectedComponent(props: T) {
    return (
      <AuthMiddleware 
        allowedRoles={allowedRoles} 
        requireAuth={requireAuth}
        fallbackComponent={fallbackComponent}
      >
        <WrappedComponent {...props} />
      </AuthMiddleware>
    );
  };
}

/**
 * Hook for checking user permissions and authentication status
 */
export function useAuthMiddleware(allowedRoles: string[] = ['customer']) {
  const { user } = useAppSelector(state => state.auth);
  
  const isAuthorized = () => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };
  
  const hasRole = (role: string) => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };
  
  const isAuthenticated = !!user;
  
  return {
    isAuthorized: isAuthorized(),
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    currentRole: user?.role || null
  };
}

/**
 * Route protection utilities
 */
export const RouteProtection = {
  /**
   * Customer only routes
   */
  CustomerOnly: ({ children }: { children: ReactNode }) => (
    <AuthMiddleware allowedRoles={['customer']} requireAuth={true}>
      {children}
    </AuthMiddleware>
  ),

  /**
   * Seller only routes
   */
  SellerOnly: ({ children }: { children: ReactNode }) => (
    <AuthMiddleware allowedRoles={['seller']} requireAuth={true}>
      {children}
    </AuthMiddleware>
  ),

  /**
   * Admin only routes
   */
  AdminOnly: ({ children }: { children: ReactNode }) => (
    <AuthMiddleware allowedRoles={['admin']} requireAuth={true}>
      {children}
    </AuthMiddleware>
  ),

  /**
   * Multiple roles allowed
   */
  MultiRole: ({ children, roles }: { children: ReactNode; roles: string[] }) => (
    <AuthMiddleware allowedRoles={roles} requireAuth={true}>
      {children}
    </AuthMiddleware>
  ),

  /**
   * Public routes (no authentication required)
   */
  Public: ({ children }: { children: ReactNode }) => (
    <AuthMiddleware requireAuth={false}>
      {children}
    </AuthMiddleware>
  )
};
