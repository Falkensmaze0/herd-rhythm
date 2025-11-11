'use client';

/**
 * AuthContext provides authentication state and methods for entire app
 * No direct AuthService/server logic is ever invoked here.
 * Role-based redirects are managed centrally in this provider after login/session change.
 */
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AuthUser, LoginCredentials, RegisterData, UserRole, UserPreferences, Permission } from '@/types';
import { AuthService } from '@/services/AuthService';
import { useToast } from '@/hooks/use-toast';
import Router from 'next/router';


interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  hasPermission: (resource: string, action: Permission['actions'][number]) => boolean;
  canAccess: (resource: string) => boolean;
  refreshSession: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // Modular user role → landing page route mapping
  const ROLE_HOME_ROUTE: Record<UserRole, string> = {
    admin: '/admin',
    manager: '/manager',
    doctor: '/doctor',
    technician: '/technician',
    helper: '/helper',
    office: '/office',
  };

  // Handle role-based navigation consistently
  const navigateToUserHome = async (userRole: UserRole): Promise<void> => {
    if (typeof window === 'undefined') return; // avoid server-side navigation
    const path = ROLE_HOME_ROUTE[userRole];
    if (path) {
      try {
        await Router.replace(path);
      } catch (error) {
        // Fallback to window.location on navigation error
        window.location.href = path;
      }
    }
  };

  // Initialize authentication state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      // Validate session with API, never call AuthService on client
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          // Synchronize token, if provided/needed
          if (data.sessionToken) {
            localStorage.setItem('sessionToken', data.sessionToken);
          }
          return;
        }
      }
      // If not valid, cleanup session
      localStorage.removeItem('sessionToken');
      removeCookie('sessionToken');
      setUser(null);
    } catch (error) {
      console.error('Authentication initialization failed:', error);
      localStorage.removeItem('sessionToken');
      removeCookie('sessionToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      // Make login API request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.requiresTwoFactor) {
          throw new Error('Two-factor authentication required');
        }
        throw new Error(data.message || 'Login failed');
      }

      const { user: authUser, sessionToken } = data;
      
      // Store session token for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', sessionToken);
        if (credentials.rememberMe) {
          setCookie('sessionToken', sessionToken, 30); // 30 days
        }
      }
      
      // Set user state
      setUser(authUser);
      
      // Show single success toast
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${authUser.name}!`,
        variant: 'default',
      });
      
      // Ensure state updates are complete before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to role-specific route
      const path = ROLE_HOME_ROUTE[authUser.role];
      if (path) {
        window.location.href = path;
      }
    } catch (error: unknown) {
      console.error('Login failed:', error);
      setIsLoading(false);
      const message = getErrorMessage(error);
      
      // Handle specific error types
      if (message === 'Two-factor authentication required') {
        throw new Error(message); // Re-throw to handle 2FA flow
      }
      
      toast({
        title: 'Login Failed',
        description: message || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
      throw new Error(message);
    }
  };

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('sessionToken');
      removeCookie('sessionToken');
      setIsLoading(false);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        variant: 'default',
      });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [toast]);

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      // POST registration info to API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to create account. Please try again.');
      }
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. You can now log in.',
        variant: 'default',
      });
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const message = getErrorMessage(error);
      toast({
        title: 'Registration Failed',
        description: message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      // POST email to password reset API endpoint
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to send password reset. Please try again.');
      }
      toast({
        title: 'Password Reset Sent',
        description: 'If an account exists with that email, you will receive reset instructions.',
        variant: 'default',
      });
    } catch (error: unknown) {
      console.error('Password reset failed:', error);
      const message = getErrorMessage(error);
      toast({
        title: 'Reset Failed',
        description: message || 'Failed to send password reset. Please try again.',
        variant: 'destructive',
      });
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      // POST token and newPassword to API endpoint
      const response = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to reset password. Please try again.');
      }
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset. Please log in with your new password.',
        variant: 'default',
      });
    } catch (error: unknown) {
      console.error('Password reset confirmation failed:', error);
      const message = getErrorMessage(error);
      toast({
        title: 'Reset Failed',
        description: message || 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (resource: string, action: Permission['actions'][number]): boolean => {
    return user ? AuthService.hasPermission(user, resource, action) : false;
  };

  const canAccess = (resource: string): boolean => {
    return hasPermission(resource, 'read');
  };

  const refreshSession = useCallback(async () => {
    try {
      // Validate session with API; logout if invalid
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          return;
        }
      }
      // Session expired or invalid, logout
      await logout();
    } catch (error) {
      console.error('Session refresh failed:', error);
      await logout();
    }
  }, [logout]);

  // Session refresh interval (every 15 minutes)
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        void refreshSession();
      }, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, refreshSession]);

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    try {
      // Update user preferences via API
      const response = await fetch(`/api/users/${user.id}/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
        },
        body: JSON.stringify({ preferences }),
      });
      if (response.ok) {
        type UpdatePreferencesResponse = { preferences?: UserPreferences };
        const updatedUser: UpdatePreferencesResponse = await response.json();
        setUser({ ...user, preferences: updatedUser.preferences });
        
        toast({
          title: 'Preferences Updated',
          description: 'Your preferences have been saved.',
          variant: 'default',
        });
      }
    } catch (error: unknown) {
      console.error('Failed to update preferences:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    resetPassword,
    confirmPasswordReset,
    hasPermission,
    canAccess,
    refreshSession,
    updateUserPreferences,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility functions
const getClientIP = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return undefined;
  }
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred.';
};

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; secure; samesite=strict`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`;
};
