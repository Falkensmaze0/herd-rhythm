import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '@/types';

export interface SessionToken extends JwtPayload {
  userId: string;
  type?: 'session' | 'reset';
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  timezone: string;
  language: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface MockSession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAuditLog {
  id: string;
  action: string;
  resource: string;
  success: boolean;
  userId?: string;
  sessionId?: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
  duration?: number;
  createdAt: string;
}

export interface MockSystemLog {
  id: string;
  level: string;
  category: string;
  message: string;
  details?: Record<string, unknown>;
  source?: string;
  stackTrace?: string;
  userId?: string;
  sessionId?: string;
  memoryUsage?: number;
  cpuUsage?: number;
  responseTime?: number;
  queryCount?: number;
  diskUsage?: number;
  networkLatency?: number;
  createdAt: string;
}