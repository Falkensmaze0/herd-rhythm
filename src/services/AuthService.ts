import type {
  AuditLog,
  AuthUser,
  LoginCredentials,
  Permission,
  RegisterData,
  SystemLog,
  UserRole,
} from '@/types';

type LoginResult = { user: AuthUser; sessionToken: string };

/**
 * Stub AuthService.
 *
 * WARNING: This file is a client/universal stub. All sensitive, Node.js, Prisma, and JWT logic
 * is in `AuthService.server.ts`. Never import this file from server-only contexts.
 *
 * If you see this error, you have attempted to use AuthService in a context where it is not permitted.
 */
export class AuthService {
  private static throwUsage(): never {
    throw new Error(
      'AuthService cannot be used on the client or in universal/shared code. Import AuthService from AuthService.server.ts in server-only code such as API routes or server functions.',
    );
  }

  static async hashPassword(_password: string): Promise<string> { this.throwUsage(); }
  static async verifyPassword(_password: string, _hashedPassword: string): Promise<boolean> { this.throwUsage(); }
  static async createSession(_userId: string, _ipAddress?: string, _userAgent?: string): Promise<string> { this.throwUsage(); }
  static async validateSession(_sessionToken: string): Promise<AuthUser | null> { this.throwUsage(); }
  static async revokeSession(_sessionToken: string): Promise<void> { this.throwUsage(); }
  static async revokeAllUserSessions(_userId: string): Promise<void> { this.throwUsage(); }
  static async login(_credentials: LoginCredentials, _ipAddress?: string, _userAgent?: string): Promise<LoginResult> { this.throwUsage(); }
  static async register(_data: RegisterData): Promise<AuthUser> { this.throwUsage(); }
  static getPermissions(_role: UserRole): Permission[] { this.throwUsage(); }
  static hasPermission(_user: AuthUser, _resource: string, _action: Permission['actions'][number]): boolean { this.throwUsage(); }
  static async logAuditEvent(_data: Partial<AuditLog>): Promise<void> { this.throwUsage(); }
  static async logSystemEvent(_data: Partial<SystemLog>): Promise<void> { this.throwUsage(); }
  static async requestPasswordReset(_email: string): Promise<void> { this.throwUsage(); }
  static async resetPassword(_token: string, _newPassword: string): Promise<void> { this.throwUsage(); }
}
