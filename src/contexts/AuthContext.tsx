import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, LoginCredentials, RegisterData, UserRole } from '@/types';
import { AuthService } from '@/services/AuthService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  canAccess: (resource: string) => boolean;
  refreshSession: () => Promise<void>;
  updateUserPreferences: (preferences: any) => Promise<void>;
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

  // Initialize authentication state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  // Session refresh interval (every 15 minutes)
  useEffect(() => {
    if (user) {
      const interval = setInterval(refreshSession, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const sessionToken = localStorage.getItem('sessionToken') || getCookie('sessionToken');
      
      if (sessionToken) {
        const validatedUser = await AuthService.validateSession(sessionToken);
        if (validatedUser) {
          setUser(validatedUser);
          // Store session token in localStorage for persistence
          localStorage.setItem('sessionToken', sessionToken);
        } else {
          // Invalid session, clear storage
          localStorage.removeItem('sessionToken');
          removeCookie('sessionToken');
        }
      }
    } catch (error) {
      console.error('Authentication initialization failed:', error);
      localStorage.removeItem('sessionToken');
      removeCookie('sessionToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const ipAddress = await getClientIP();
      const userAgent = navigator.userAgent;
      
      const { user: authUser, sessionToken } = await AuthService.login(
        credentials,
        ipAddress,
        userAgent
      );

      setUser(authUser);

      // Store session token
      localStorage.setItem('sessionToken', sessionToken);
      if (credentials.rememberMe) {
        setCookie('sessionToken', sessionToken, 30); // 30 days
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${authUser.name}!`,
        variant: 'default',
      });

      // Log successful login for audit
      await AuthService.logAuditEvent({
        userId: authUser.id,
        action: 'login',
        resource: 'auth',
        success: true,
        ipAddress,
        userAgent,
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle specific error types
      if (error.message === 'Two-factor authentication required') {
        throw error; // Re-throw to handle 2FA flow
      }
      
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const sessionToken = localStorage.getItem('sessionToken');
      
      if (sessionToken && user) {
        // Log logout event
        await AuthService.logAuditEvent({
          userId: user.id,
          action: 'logout',
          resource: 'auth',
          success: true,
        });
        
        // Revoke session on server
        await AuthService.revokeSession(sessionToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.removeItem('sessionToken');
      removeCookie('sessionToken');
      setIsLoading(false);
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        variant: 'default',
      });
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const newUser = await AuthService.register(data);
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. You can now log in.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await AuthService.requestPasswordReset(email);
      
      toast({
        title: 'Password Reset Sent',
        description: 'If an account exists with that email, you will receive reset instructions.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Password reset failed:', error);
      toast({
        title: 'Reset Failed',
        description: 'Failed to send password reset. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await AuthService.resetPassword(token, newPassword);
      
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset. Please log in with your new password.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Password reset confirmation failed:', error);
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    return user ? AuthService.hasPermission(user, resource, action) : false;
  };

  const canAccess = (resource: string): boolean => {
    return hasPermission(resource, 'read');
  };

  const refreshSession = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        const validatedUser = await AuthService.validateSession(sessionToken);
        if (validatedUser) {
          setUser(validatedUser);
        } else {
          // Session expired, logout
          await logout();
        }
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      await logout();
    }
  };

  const updateUserPreferences = async (preferences: any) => {
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
        const updatedUser = await response.json();
        setUser({ ...user, preferences: updatedUser.preferences });
        
        toast({
          title: 'Preferences Updated',
          description: 'Your preferences have been saved.',
          variant: 'default',
        });
      }
    } catch (error) {
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