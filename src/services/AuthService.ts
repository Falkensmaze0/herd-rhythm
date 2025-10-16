/**
 * Stub AuthService.
 *
 * WARNING: This file is a client/universal stub. All sensitive, Node.js, Prisma, and JWT logic
 * is in `AuthService.server.ts`. Never import this file from server-only contexts.
 *
 * If you see this error, you have attempted to use AuthService in a context where it is not permitted.
 */
export class AuthService {
  static throwUsage(): never {
    throw new Error('AuthService cannot be used on the client or in universal/shared code. Import AuthService from AuthService.server.ts in server-only code such as API routes or server functions.');
  }

  static async hashPassword() { this.throwUsage(); }
  static async verifyPassword() { this.throwUsage(); }
  static async createSession() { this.throwUsage(); }
  static async validateSession(sessionToken: string): Promise<any> { this.throwUsage(); }
  static async revokeSession() { this.throwUsage(); }
  static async revokeAllUserSessions() { this.throwUsage(); }
  static async login() { this.throwUsage(); }
  static async register() { this.throwUsage(); }
  static getPermissions() { this.throwUsage(); }
  static hasPermission(user: any, resource: string, action: string): boolean { this.throwUsage(); }
  static async logAuditEvent(data: any): Promise<void> { this.throwUsage(); }
  static async logSystemEvent(data: any): Promise<void> { this.throwUsage(); }
  static async requestPasswordReset(email: string): Promise<void> { this.throwUsage(); }
  static async resetPassword(token: string, newPassword: string): Promise<void> { this.throwUsage(); }
}

