import { Prisma } from '@prisma/client';
import { AuthUser, UserRole, UserPreferences } from '@/types';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'manager' | 'doctor' | 'technician' | 'helper' | 'office';
  isActive?: boolean;
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
}

export interface UpdateUserData {
  name?: string;
  role?: 'admin' | 'manager' | 'doctor' | 'technician' | 'helper' | 'office';
  isActive?: boolean;
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
}

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

const normalizePreferences = (preferences: Prisma.JsonValue | null): UserPreferences | undefined => {
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

export class AdminService {
  static async createUser(data: CreateUserData): Promise<AuthUser> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        password: hashedPassword,
        role: data.role,
        isActive: data.isActive ?? true,
        timezone: data.timezone || 'UTC',
        language: data.language || 'en',
        twoFactorEnabled: data.twoFactorEnabled ?? false,
      }
    });

    const preferences = normalizePreferences(user.preferences);

    const authUser: AuthUser = {
      ...user,
      permissions: [], // Permissions will be added by AuthService
      avatar: user.avatar || undefined,
      phone: user.phone || undefined,
      department: user.department || undefined,
      licenseNumber: user.licenseNumber || undefined,
      specializations: Array.isArray(user.specializations) ? user.specializations.map(s => String(s)) : undefined,
      preferences,
      sessionToken: undefined,
      emailVerified: user.emailVerified ? user.emailVerified.toISOString() : undefined,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return authUser;
  }

  static async updateUser(userId: string, data: UpdateUserData): Promise<AuthUser> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });

    const updatedPreferences = normalizePreferences(updatedUser.preferences);

    const authUser: AuthUser = {
      ...updatedUser,
      permissions: [], // Permissions will be added by AuthService
      avatar: updatedUser.avatar || undefined,
      phone: updatedUser.phone || undefined,
      department: updatedUser.department || undefined,
      licenseNumber: updatedUser.licenseNumber || undefined,
      specializations: Array.isArray(updatedUser.specializations) ? updatedUser.specializations.map(s => String(s)) : undefined,
      preferences: updatedPreferences,
      sessionToken: undefined,
      emailVerified: updatedUser.emailVerified ? updatedUser.emailVerified.toISOString() : undefined,
      lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : undefined,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };

    return authUser;
  }

  static async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId }
    });
  }

  static async listUsers(query?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<AuthUser[]> {
    const where: Prisma.UserWhereInput = {
      ...(query?.role && { role: query.role as UserRole }),
      ...(query?.isActive !== undefined && { isActive: query.isActive }),
      ...(query?.search && {
        OR: [
          { email: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const users = await prisma.user.findMany({ where });
    return users.map(user => {
      const prefs = normalizePreferences(user.preferences);

      return {
        ...user,
        permissions: [], // Permissions will be added by AuthService
        avatar: user.avatar || undefined,
        phone: user.phone || undefined,
        department: user.department || undefined,
        licenseNumber: user.licenseNumber || undefined,
        specializations: Array.isArray(user.specializations) ? user.specializations.map(s => String(s)) : undefined,
        preferences: prefs,
        sessionToken: undefined,
        emailVerified: user.emailVerified ? user.emailVerified.toISOString() : undefined,
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    });
  }
}
