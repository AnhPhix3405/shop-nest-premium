'use client';

import React, { ReactNode } from 'react';
import { useAppSelector } from '@/lib/hooks/redux';
import F404 from '@/components/errors/F404';

interface SellerAuthMiddlewareProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
  fallbackComponent?: React.ComponentType;
}

/**
 * Seller Authentication and Authorization Middleware Component
 * Protects seller routes based on user authentication and role permissions
 */
export default function SellerAuthMiddleware({ 
  children, 
  allowedRoles = ['seller'], 
  requireAuth = true,
  fallbackComponent: FallbackComponent = F404
}: SellerAuthMiddlewareProps): React.ReactElement {
  const { user } = useAppSelector(state => state.auth);

  // Check if user authentication is required and user exists
  if (requireAuth && !user) {
    return React.createElement(FallbackComponent);
  }

  // Check if user role is in allowed roles list
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return React.createElement(FallbackComponent);
  }

  // If all conditions are satisfied, render children
  return React.createElement(React.Fragment, null, children);
}

/**
 * Higher-order component for wrapping seller page components with authentication middleware
 */
export function withSellerAuthMiddleware<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  middlewareOptions: {
    allowedRoles?: string[];
    requireAuth?: boolean;
    fallbackComponent?: React.ComponentType;
  } = {}
) {
  const { 
    allowedRoles = ['seller'], 
    requireAuth = true,
    fallbackComponent = F404
  } = middlewareOptions;
  
  return function SellerAuthProtectedComponent(props: T): React.ReactElement {
    return React.createElement(
      SellerAuthMiddleware,
      { 
        allowedRoles, 
        requireAuth,
        fallbackComponent,
        children: React.createElement(WrappedComponent, props)
      }
    );
  };
}

/**
 * Hook for checking seller permissions and authentication status
 */
export function useSellerAuthMiddleware(allowedRoles: string[] = ['seller']) {
  const { user } = useAppSelector(state => state.auth);
  
  const isAuthorized = (): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };
  
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };
  
  const isAuthenticated = !!user;
  const isSeller = user?.role === 'seller';
  
  return {
    isAuthorized: isAuthorized(),
    user,
    isAuthenticated,
    isSeller,
    hasRole,
    hasAnyRole,
    currentRole: user?.role || null
  };
}

/**
 * Seller route protection utilities
 */
export const SellerRouteProtection = {
  /**
   * Seller only routes
   */
  SellerOnly: ({ children }: { children: ReactNode }): React.ReactElement => 
    React.createElement(
      SellerAuthMiddleware,
      { allowedRoles: ['seller'], requireAuth: true, children }
    ),

  /**
   * Admin and Seller routes
   */
  AdminOrSeller: ({ children }: { children: ReactNode }): React.ReactElement => 
    React.createElement(
      SellerAuthMiddleware,
      { allowedRoles: ['admin', 'seller'], requireAuth: true, children }
    ),

  /**
   * Seller with specific permissions
   */
  SellerWithPermissions: ({ 
    children, 
    permissions = [] 
  }: { 
    children: ReactNode; 
    permissions?: string[] 
  }): React.ReactElement => 
    React.createElement(
      SellerAuthMiddleware,
      { allowedRoles: ['seller'], requireAuth: true, children }
    ),

  /**
   * Multiple roles allowed for seller operations
   */
  SellerMultiRole: ({ children, roles }: { children: ReactNode; roles: string[] }): React.ReactElement => 
    React.createElement(
      SellerAuthMiddleware,
      { allowedRoles: roles, requireAuth: true, children }
    )
};

/**
 * Seller-specific utilities
 */
export const SellerUtils = {
  /**
   * Check if user can access seller dashboard
   */
  canAccessDashboard: (user: any): boolean => {
    return user?.role === 'seller' && user?.isActive !== false;
  },

  /**
   * Check if user can manage products
   */
  canManageProducts: (user: any): boolean => {
    return user?.role === 'seller';
  },

  /**
   * Check if user can view orders
   */
  canViewOrders: (user: any): boolean => {
    return user?.role === 'seller';
  },

  /**
   * Check if user can manage inventory
   */
  canManageInventory: (user: any): boolean => {
    return user?.role === 'seller';
  }
};
