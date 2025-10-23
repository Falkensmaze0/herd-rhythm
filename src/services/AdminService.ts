import { Prisma } from '@prisma/client';
import { AuthUser, Permission, UserRole, UserPreferences } from '@/types';
import { AuthService } from './AuthService.server';
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

    const preferences = user.preferences ? {
      theme: (user.preferences as any).theme || 'system',
      notifications: {
        email: (user.preferences as any).notifications?.email ?? true,
        push: (user.preferences as any).notifications?.push ?? true,
        sms: (user.preferences as any).notifications?.sms ?? false,
      },
      dashboard: {
        layout: (user.preferences as any).dashboard?.layout || 'default',
        widgets: Array.isArray((user.preferences as any).dashboard?.widgets) ? (user.preferences as any).dashboard.widgets.map((w: any) => String(w)) : [],
      },
      defaultViews: {
        cowList: (user.preferences as any).defaultViews?.cowList || 'grid',
        calendar: (user.preferences as any).defaultViews?.calendar || 'month',
      },
    } as UserPreferences : undefined;

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

    const updatedPreferences = updatedUser.preferences ? {
      theme: (updatedUser.preferences as any).theme || 'system',
      notifications: {
        email: (updatedUser.preferences as any).notifications?.email ?? true,
        push: (updatedUser.preferences as any).notifications?.push ?? true,
        sms: (updatedUser.preferences as any).notifications?.sms ?? false,
      },
      dashboard: {
        layout: (updatedUser.preferences as any).dashboard?.layout || 'default',
        widgets: Array.isArray((updatedUser.preferences as any).dashboard?.widgets) ? (updatedUser.preferences as any).dashboard.widgets.map((w: any) => String(w)) : [],
      },
      defaultViews: {
        cowList: (updatedUser.preferences as any).defaultViews?.cowList || 'grid',
        calendar: (updatedUser.preferences as any).defaultViews?.calendar || 'month',
      },
    } as UserPreferences : undefined;

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
      const prefs = user.preferences ? {
        theme: (user.preferences as any).theme || 'system',
        notifications: {
          email: (user.preferences as any).notifications?.email ?? true,
          push: (user.preferences as any).notifications?.push ?? true,
          sms: (user.preferences as any).notifications?.sms ?? false,
        },
        dashboard: {
          layout: (user.preferences as any).dashboard?.layout || 'default',
          widgets: Array.isArray((user.preferences as any).dashboard?.widgets) ? (user.preferences as any).dashboard.widgets.map((w: any) => String(w)) : [],
        },
        defaultViews: {
          cowList: (user.preferences as any).defaultViews?.cowList || 'grid',
          calendar: (user.preferences as any).defaultViews?.calendar || 'month',
        },
      } as UserPreferences : undefined;

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