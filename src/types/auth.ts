import { User } from '@prisma/client';

export type UserRole = 'admin' | 'manager' | 'doctor' | 'technician' | 'helper' | 'office';

export interface Permission {
  resource: string;
  actions: Array<'create' | 'read' | 'update' | 'delete' | 'admin'>;
  conditions?: Record<string, unknown>;
}

export interface AuthUser extends Omit<User, 'avatar'> {
  permissions: Permission[];
  avatar?: string;
  sessionToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  specializations?: string[];
}
