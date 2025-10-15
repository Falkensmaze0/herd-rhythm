import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthUser, Permission, UserRole, LoginCredentials, RegisterData, AuditLog, SystemLog } from '@/types';
import { SessionToken, MockUser, MockSession, MockAuditLog, MockSystemLog } from '@/types/mock';

// JWT Helper functions
const createToken = (payload: Omit<SessionToken, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET || 'development-mock-secret-key';
  return jwt.sign(payload, secret, { 
    algorithm: 'HS256', 
    expiresIn: '30d',
    encoding: 'utf8'
  });
};

const verifyToken = (token: string): SessionToken | null => {
  const secret = process.env.JWT_SECRET || 'development-mock-secret-key';
  try {
    return jwt.verify(token, secret) as SessionToken;
  } catch (error) {
    console.error('JWT Verification failed:', error);
    return null;
  }
};
import { KeyObject } from 'crypto';

// Mock database
const mockUsers: MockUser[] = [
  {
    id: 'admin-001',
    name: 'System Administrator',
    email: 'admin@farm.com',
    password: '$2a$12$k8Y6J.12rWBvuFk9YVvXCOa6RQZoGpxM9DPSH6IrAh6tYtXxPXKhu', // demo123
    role: 'admin',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'manager-001',
    name: 'Farm Manager',
    email: 'manager@farm.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyNiCk1A5XQOQG', // demo123
    role: 'manager',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doctor-001',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@farm.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyNiCk1A5XQOQG', // demo123
    role: 'doctor',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'technician-001',
    name: 'AI Technician',
    email: 'technician@farm.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyNiCk1A5XQOQG', // demo123
    role: 'technician',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'helper-001',
    name: 'Farm Helper',
    email: 'helper@farm.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyNiCk1A5XQOQG', // demo123
    role: 'helper',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'office-001',
    name: 'Office Administrator',
    email: 'office@farm.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyNiCk1A5XQOQG', // demo123
    // password: 'demo123',
    role: 'office',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockSessions: MockSession[] = [];
const mockAuditLogs: MockAuditLog[] = [];
const mockSystemLogs: MockSystemLog[] = [];

export class MockAuthService {
  // Password utilities
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // First try direct comparison for mock data
    if (password === 'demo123') return true;
    
    // Then try bcrypt comparison
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  // Session management
  static async createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    const sessionToken = createToken({ userId });
    
    const session = {
      id: `session-${Date.now()}`,
      sessionToken,
      userId,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ipAddress,
      userAgent,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockSessions.push(session);
    return sessionToken;
  }

  static async validateSession(sessionToken: string): Promise<AuthUser | null> {
    try {
      const session = mockSessions.find(s => s.sessionToken === sessionToken);
      
      if (!session || session.expires < new Date()) {
        if (session) {
          const index = mockSessions.indexOf(session);
          mockSessions.splice(index, 1);
        }
        return null;
      }

      const user = mockUsers.find(u => u.id === session.userId);
      if (!user) return null;

      const authUser: AuthUser = {
        ...user,
        permissions: this.getPermissions(user.role),
        sessionToken: session.sessionToken,
      };

      return authUser;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  static async revokeSession(sessionToken: string): Promise<void> {
    const index = mockSessions.findIndex(s => s.sessionToken === sessionToken);
    if (index > -1) {
      mockSessions.splice(index, 1);
    }
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    for (let i = mockSessions.length - 1; i >= 0; i--) {
      if (mockSessions[i].userId === userId) {
        mockSessions.splice(i, 1);
      }
    }
  }

  // Authentication methods
  static async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<{ user: AuthUser; sessionToken: string }> {
    const user = mockUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user || !user.isActive) {
      await this.logAuditEvent({
        action: 'login',
        resource: 'auth',
        success: false,
        errorMessage: 'Invalid credentials or inactive user',
        ipAddress,
        userAgent,
      });
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.verifyPassword(credentials.password, user.password);
    if (!isPasswordValid) {
      await this.logAuditEvent({
        userId: user.id,
        action: 'login',
        resource: 'auth',
        success: false,
        errorMessage: 'Invalid password',
        ipAddress,
        userAgent,
      });
      throw new Error('Invalid credentials');
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled && !credentials.twoFactorCode) {
      throw new Error('Two-factor authentication required');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Create session
    const sessionToken = await this.createSession(user.id, ipAddress, userAgent);

    // Log successful login
    await this.logAuditEvent({
      userId: user.id,
      action: 'login',
      resource: 'auth',
      success: true,
      ipAddress,
      userAgent,
    });

    const authUser: AuthUser = {
      ...user,
      permissions: this.getPermissions(user.role),
      sessionToken,
    };

    return { user: authUser, sessionToken };
  }

  static async register(data: RegisterData): Promise<AuthUser> {
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = {
      id: `user-${Date.now()}`,
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      isActive: true,
      timezone: 'UTC',
      language: 'en',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockUsers.push(user);

    // Log user registration
    await this.logAuditEvent({
      userId: user.id,
      action: 'create',
      resource: 'users',
      newValues: { ...data, password: '[REDACTED]' },
      success: true,
    });

    const authUser: AuthUser = {
      ...user,
      permissions: this.getPermissions(user.role),
    };

    return authUser;
  }

  // Permission system
  static getPermissions(role: UserRole): Permission[] {
    const rolePermissions: Record<UserRole, Permission[]> = {
      admin: [
        { resource: '*', actions: ['create', 'read', 'update', 'delete', 'admin'] }
      ],
      manager: [
        { resource: 'cows', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'reminders', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'sync-methods', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'reports', actions: ['create', 'read'] },
        { resource: 'users', actions: ['read', 'update'], conditions: { role: 'technician' } },
        { resource: 'scheduling', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'budget', actions: ['read', 'update'] }
      ],
      doctor: [
        { resource: 'cows', actions: ['read', 'update'] },
        { resource: 'reminders', actions: ['create', 'read', 'update'] },
        { resource: 'medical-records', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'treatments', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'prescriptions', actions: ['create', 'read', 'update'] },
        { resource: 'breeding', actions: ['read', 'update'] },
        { resource: 'health-analytics', actions: ['read'] }
      ],
      technician: [
        { resource: 'cows', actions: ['create', 'read', 'update'] },
        { resource: 'reminders', actions: ['read', 'update'] },
        { resource: 'sync-methods', actions: ['read', 'update'] },
        { resource: 'ai-procedures', actions: ['create', 'read', 'update'] },
        { resource: 'breeding-records', actions: ['create', 'read', 'update'] },
        { resource: 'equipment', actions: ['read', 'update'] }
      ],
      helper: [
        { resource: 'cows', actions: ['read'] },
        { resource: 'reminders', actions: ['read', 'update'], conditions: { own: true } },
        { resource: 'feeding-logs', actions: ['create', 'read', 'update'] },
        { resource: 'cleaning-logs', actions: ['create', 'read', 'update'] },
        { resource: 'basic-care', actions: ['create', 'read', 'update'] }
      ],
      office: [
        { resource: 'cows', actions: ['read'] },
        { resource: 'reminders', actions: ['read'] },
        { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'communications', actions: ['create', 'read', 'update'] },
        { resource: 'documents', actions: ['create', 'read', 'update'] },
        { resource: 'reports', actions: ['read'] }
      ]
    };

    return rolePermissions[role] || [];
  }

  static hasPermission(user: AuthUser, resource: string, action: string): boolean {
    if (!user || !user.permissions) return false;

    return user.permissions.some(permission => {
      // Admin wildcard access
      if (permission.resource === '*') return true;
      
      // Exact resource match
      if (permission.resource === resource && permission.actions.includes(action as any)) {
        return true;
      }

      return false;
    });
  }

  // Audit logging (mock implementation)
  static async logAuditEvent(data: Partial<AuditLog>): Promise<void> {
    try {
      const logEntry = {
        id: `audit-${Date.now()}`,
        action: data.action || 'unknown',
        resource: data.resource || 'unknown',
        success: data.success ?? true,
        userId: data.userId,
        sessionId: data.sessionId,
        resourceId: data.resourceId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        errorMessage: data.errorMessage,
        duration: data.duration,
        createdAt: new Date().toISOString()
      };
      
      mockAuditLogs.push(logEntry);
      console.log('Audit Log:', logEntry);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // System logging (mock implementation)
  static async logSystemEvent(data: Partial<SystemLog>): Promise<void> {
    try {
      const logEntry = {
        id: `system-${Date.now()}`,
        level: data.level || 'info',
        category: data.category || 'general',
        message: data.message || 'Unknown system event',
        details: data.details,
        source: data.source,
        stackTrace: data.stackTrace,
        userId: data.userId,
        sessionId: data.sessionId,
        memoryUsage: data.memoryUsage,
        cpuUsage: data.cpuUsage,
        responseTime: data.responseTime,
        queryCount: data.queryCount,
        diskUsage: data.diskUsage,
        networkLatency: data.networkLatency,
        createdAt: new Date().toISOString()
      };
      
      mockSystemLogs.push(logEntry);
      console.log('System Log:', logEntry);
    } catch (error) {
      console.error('Failed to log system event:', error);
    }
  }

  // Password reset (mock implementation)
  static async requestPasswordReset(email: string): Promise<void> {
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const secret = process.env.JWT_SECRET || 'development-mock-secret-key-2023';
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const resetToken = jwt.sign({ userId: user.id } as jwt.JwtPayload, secret, { expiresIn: '1h' });
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = verifyToken(token) as { userId: string };
      if (!decoded) {
        return null;
      }
      
      const user = mockUsers.find(u => 
        u.id === decoded.userId &&
        u.passwordResetToken === token &&
        u.passwordResetExpires && new Date(u.passwordResetExpires) > new Date()
      );

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await this.hashPassword(newPassword);

      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      // Revoke all sessions for security
      await this.revokeAllUserSessions(user.id);

      await this.logAuditEvent({
        userId: user.id,
        action: 'update',
        resource: 'auth',
        newValues: { password: '[REDACTED]' },
        success: true,
      });
    } catch (error) {
      throw new Error('Failed to reset password');
    }
  }
  
  // Mock data accessors for admin APIs
  static getMockAuditLogs(): MockAuditLog[] {
    return mockAuditLogs.slice(-50); // Return last 50 logs
  }
  
  static getMockUsers(): MockUser[] {
    return mockUsers.filter(u => u.isActive);
  }
}