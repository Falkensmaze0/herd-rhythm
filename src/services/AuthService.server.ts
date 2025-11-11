import { Prisma } from '@prisma/client';
import type { PrismaClient, User as PrismaUser, ActionType as PrismaActionType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthUser, Permission, UserRole, LoginCredentials, RegisterData, AuditLog, SystemLog, UserPreferences } from '@/types';
import { signToken, verifyToken } from '@/lib/jwt';
import { MockAuthService } from './MockAuthService';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

let prisma: PrismaClient | null = null;

const initializePrisma = async (): Promise<void> => {
  try {
    const { prisma: prismaClient } = await import('@/lib/prisma');
    prisma = prismaClient;
  } catch (error) {
    console.warn('Prisma not available, using mock service:', getErrorMessage(error));
  }
};

const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Prisma client is not initialized');
  }
  return prisma;
};

void initializePrisma();

type JsonRecord = Record<string, unknown>;

const isJsonRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toTheme = (value: unknown): UserPreferences['theme'] => {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return 'system';
};

const toCowListView = (value: unknown): UserPreferences['defaultViews']['cowList'] =>
  value === 'table' ? 'table' : 'grid';

const toCalendarView = (value: unknown): UserPreferences['defaultViews']['calendar'] => {
  if (value === 'week' || value === 'day') {
    return value;
  }
  return 'month';
};

const toBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const toStringOr = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const toWidgetList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((widget) => String(widget)) : [];

const normalizePreferences = (
  preferences: Prisma.JsonValue | null,
): UserPreferences | undefined => {
  if (!isJsonRecord(preferences)) {
    return undefined;
  }

  const notificationsSource = isJsonRecord(preferences.notifications) ? preferences.notifications : {};
  const dashboardSource = isJsonRecord(preferences.dashboard) ? preferences.dashboard : {};
  const defaultViewsSource = isJsonRecord(preferences.defaultViews) ? preferences.defaultViews : {};

  return {
    theme: toTheme(preferences.theme),
    notifications: {
      email: toBoolean(notificationsSource.email, true),
      push: toBoolean(notificationsSource.push, true),
      sms: toBoolean(notificationsSource.sms, false),
    },
    dashboard: {
      layout: toStringOr(dashboardSource.layout, 'default'),
      widgets: toWidgetList(dashboardSource.widgets),
    },
    defaultViews: {
      cowList: toCowListView(defaultViewsSource.cowList),
      calendar: toCalendarView(defaultViewsSource.calendar),
    },
  };
};

const toStringArray = (value: Prisma.JsonValue | null | undefined): string[] | undefined => {
  if (!value || !Array.isArray(value)) {
    return undefined;
  }

  return value.map((item) => String(item));
};

const formatAuthUser = (
  user: PrismaUser,
  permissions: Permission[],
  sessionToken?: string,
): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  password: user.password,
  role: user.role as UserRole,
  isActive: user.isActive,
  avatar: user.avatar ?? undefined,
  phone: user.phone ?? undefined,
  department: user.department ?? undefined,
  licenseNumber: user.licenseNumber ?? undefined,
  specializations: toStringArray(user.specializations),
  preferences: normalizePreferences(user.preferences),
  timezone: user.timezone,
  language: user.language,
  emailVerified: user.emailVerified ? user.emailVerified.toISOString() : undefined,
  lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
  twoFactorEnabled: user.twoFactorEnabled,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
  permissions,
  sessionToken,
});

export class AuthService {
  private static get useMockService(): boolean {
    return !prisma || process.env.USE_MOCK_AUTH === 'true';
  }

  // Delegate to mock service if database is not available
  private static async withFallback<T>(dbOperation: () => Promise<T>, mockOperation: () => Promise<T>): Promise<T> {
    if (this.useMockService) {
      return mockOperation();
    }
    
    try {
      return await dbOperation();
    } catch (error) {
      console.warn('Database operation failed, falling back to mock service:', getErrorMessage(error));
      return mockOperation();
    }
  }

  // Password utilities
  static async hashPassword(password: string): Promise<string> {
    return this.useMockService ? MockAuthService.hashPassword(password) : bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return this.useMockService ? MockAuthService.verifyPassword(password, hashedPassword) : bcrypt.compare(password, hashedPassword);
  }

  // Session management
  static async createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    return this.withFallback(
      async () => {
        const sessionToken = signToken({ userId }, { expiresIn: '30d' });
        const client = getPrismaClient();
        
        await client.session.create({
          data: {
            sessionToken,
            userId,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            ipAddress,
            userAgent,
          },
        });

        return sessionToken;
      },
      () => MockAuthService.createSession(userId, ipAddress, userAgent)
    );
  }

  static async validateSession(sessionToken: string): Promise<AuthUser | null> {
    return this.withFallback(
      async () => {
        try {
          const client = getPrismaClient();
          // Verify the JWT token
          const decodedToken = verifyToken<{ userId: string }>(sessionToken);
          if (!decodedToken) {
            return null;
          }

          // Then check if session exists and is valid
          const session = await client.session.findUnique({
            where: { sessionToken },
            include: { user: true },
          });

          if (!session || session.expires < new Date()) {
            if (session) {
              await client.session.delete({ where: { id: session.id } });
            }
            return null;
          }

          // Verify that the userId in token matches the session's userId
          if (decodedToken.userId !== session.userId) {
            console.error('Token userId mismatch');
            return null;
          }

          const authUser = formatAuthUser(
            session.user,
            this.getPermissions(session.user.role),
            session.sessionToken,
          );

          return authUser;
        } catch (error) {
          console.error('Session validation error:', error);
          return null;
        }
      },
      () => MockAuthService.validateSession(sessionToken)
    );
  }

  static async revokeSession(sessionToken: string): Promise<void> {
    return this.withFallback(
      async () => {
        const client = getPrismaClient();
        await client.session.deleteMany({ where: { sessionToken } });
      },
      () => MockAuthService.revokeSession(sessionToken)
    );
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    return this.withFallback(
      async () => {
        const client = getPrismaClient();
        await client.session.deleteMany({ where: { userId } });
      },
      () => MockAuthService.revokeAllUserSessions(userId)
    );
  }

  // Authentication methods
  static async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<{ user: AuthUser; sessionToken: string }> {
    console.log('🔍 ===== LOGIN DEBUG =====');
    console.log('🔍 USE_MOCK_AUTH:', process.env.USE_MOCK_AUTH);
    console.log('🔍 Use Mock Service:', this.useMockService);
    console.log('🔍 Prisma Available:', !!prisma);
    console.log('🔍 Credentials:', { email: credentials.email, hasPassword: !!credentials.password });
    console.log('🔍 ===== LOGIN DEBUG =====');
    console.log('🔍 USE_MOCK_AUTH:', process.env.USE_MOCK_AUTH);
    console.log('🔍 Use Mock Service:', this.useMockService);
    console.log('🔍 Prisma Available:', !!prisma);
    console.log('🔍 Credentials:', { email: credentials.email, hasPassword: !!credentials.password });
    
    return this.withFallback(
      async () => {
        console.log('🔍 Using Database for login');
        const client = getPrismaClient();
        const user = await client.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });

        console.log('🔍 User found:', !!user, user?.email, user?.role);

        if (!user || !user.isActive) {
          console.log('🔍 Login failed: Invalid credentials or inactive user');
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
        console.log('🔍 Password valid:', isPasswordValid, 'Hash length:', user.password.length);

        if (!isPasswordValid) {
          console.log('🔍 Login failed: Invalid password');
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
          console.log('🔍 2FA required but no code provided');
          throw new Error('Two-factor authentication required');
        }

        // Update last login
        await client.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });
        console.log('🔍 Last login updated');

        // Create session
        const sessionToken = await this.createSession(user.id, ipAddress, userAgent);
        console.log('🔍 Session created');

        // Log successful login
        await this.logAuditEvent({
          userId: user.id,
          action: 'login',
          resource: 'auth',
          success: true,
          ipAddress,
          userAgent,
        });

        const authUser = formatAuthUser(
          user,
          this.getPermissions(user.role),
          sessionToken,
        );

        console.log('🔍 Login successful, user role:', user.role);
        return { user: authUser, sessionToken };
      },
      async () => {
        console.log('🔍 Using Mock Service for login');
        const result = await MockAuthService.login(credentials, ipAddress, userAgent);
        console.log('🔍 Mock login result:', { email: result.user.email, role: result.user.role });
        return result;
      }
    );
  }

  static async register(data: RegisterData): Promise<AuthUser> {
    return this.withFallback(
      async () => {
        const client = getPrismaClient();
        const existingUser = await client.user.findUnique({
          where: { email: data.email.toLowerCase() }
        });

        if (existingUser) {
          throw new Error('User already exists with this email');
        }

        const hashedPassword = await this.hashPassword(data.password);

        const user = await client.user.create({
          data: {
            ...data,
            email: data.email.toLowerCase(),
            password: hashedPassword,
            specializations: data.role === 'doctor' ? [] : undefined,
          }
        });

        // Log user registration
        await this.logAuditEvent({
          userId: user.id,
          action: 'create',
          resource: 'users',
          newValues: { ...data, password: '[REDACTED]' },
          success: true,
        });

        const authUser = formatAuthUser(
          user,
          this.getPermissions(user.role),
        );

        return authUser;
      },
      () => MockAuthService.register(data)
    );
  }

  // Permission system
  static getPermissions(role: UserRole): Permission[] {
    if (this.useMockService) {
      return MockAuthService.getPermissions(role);
    }
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

  static hasPermission(
    user: AuthUser, 
    resource: string, 
    action: 'create' | 'read' | 'update' | 'delete' | 'admin'
  ): boolean {
    if (this.useMockService) {
      return MockAuthService.hasPermission(user, resource, action);
    }
    
    if (!user || !user.permissions) return false;

    return user.permissions.some(permission => {
      // Admin wildcard access
      if (permission.resource === '*') return true;
      
      // Exact resource match
      if (permission.resource === resource && permission.actions.includes(action)) {
        return true;
      }

      return false;
    });
  }

  // Audit logging
  static async logAuditEvent(data: Partial<AuditLog>): Promise<void> {
    return this.withFallback(
      async () => {
        const client = getPrismaClient();
        await client.auditLog.create({
          data: {
            action: (data.action ?? 'system_change') as PrismaActionType,
            resource: data.resource || 'unknown',
            success: data.success ?? true,
            userId: data.userId,
            sessionId: data.sessionId,
            resourceId: data.resourceId,
            oldValues: data.oldValues
              ? (data.oldValues as Prisma.InputJsonValue)
              : Prisma.JsonNull,
            newValues: data.newValues
              ? (data.newValues as Prisma.InputJsonValue)
              : Prisma.JsonNull,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            errorMessage: data.errorMessage,
            duration: data.duration,
          }
        });
      },
      () => MockAuthService.logAuditEvent(data)
    );
  }

  // System logging
  static async logSystemEvent(data: Partial<SystemLog>): Promise<void> {
    return this.withFallback(
      async () => {
        const client = getPrismaClient();
        await client.systemLog.create({
          data: {
            level: data.level || 'info',
            category: data.category || 'general',
            message: data.message || 'Unknown system event',
            details: data.details
              ? (data.details as Prisma.InputJsonValue)
              : Prisma.JsonNull,
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
          }
        });
      },
      () => MockAuthService.logSystemEvent(data)
    );
  }

  // Password reset
  static async requestPasswordReset(email: string): Promise<void> {
    return this.withFallback(
      async () => {
        const client = getPrismaClient();
        const user = await client.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (!user) {
          // Don't reveal if user exists
          return;
        }

        const resetToken = signToken({ userId: user.id }, { expiresIn: '1h' });
        
        await client.user.update({
          where: { id: user.id },
          data: {
            passwordResetToken: resetToken,
            passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          }
        });

        // TODO: Send email with reset link
        console.log(`Password reset token for ${email}: ${resetToken}`);
      },
      () => MockAuthService.requestPasswordReset(email)
    );
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    return this.withFallback(
      async () => {
        try {
          const client = getPrismaClient();
          const decoded = verifyToken<{ userId: string }>(token);
          if (!decoded) throw new Error('Invalid token');
          
          const user = await client.user.findFirst({
            where: {
              id: decoded.userId,
              passwordResetToken: token,
              passwordResetExpires: { gt: new Date() }
            }
          });

          if (!user) {
            throw new Error('Invalid or expired reset token');
          }

          const hashedPassword = await this.hashPassword(newPassword);

          await client.user.update({
            where: { id: user.id },
            data: {
              password: hashedPassword,
              passwordResetToken: null,
              passwordResetExpires: null,
            }
          });

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
      },
      () => MockAuthService.resetPassword(token, newPassword)
    );
  }
}
