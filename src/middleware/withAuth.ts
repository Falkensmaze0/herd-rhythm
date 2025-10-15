import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';
import { UserRole, AuthUser } from '@/types';

// Extend NextApiRequest to include user
declare module 'next' {
  interface NextApiRequest {
    user?: AuthUser;
  }
}

interface AuthOptions {
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: { resource: string; action: string };
  allowSelfAccess?: boolean; // Allow users to access their own data
}

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  options: AuthOptions = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get session token from cookie or authorization header
      const sessionToken = req.cookies.sessionToken || 
                          req.headers.authorization?.replace('Bearer ', '');

      if (!sessionToken) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_TOKEN'
        });
      }

      // Validate session
      const user = await AuthService.validateSession(sessionToken);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired session',
          code: 'INVALID_SESSION'
        });
      }

      // Check role requirements
      if (options.requiredRole) {
        const requiredRoles = Array.isArray(options.requiredRole) 
          ? options.requiredRole 
          : [options.requiredRole];
        
        // Admin can access everything unless specifically restricted
        const hasValidRole = user.role === 'admin' || requiredRoles.includes(user.role as UserRole);
        
        if (!hasValidRole) {
          await AuthService.logAuditEvent({
            userId: user.id,
            action: 'access_denied',
            resource: req.url || 'unknown',
            success: false,
            errorMessage: `Insufficient role: ${user.role}, required: ${requiredRoles.join(', ')}`,
            ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
          });
          
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_ROLE',
            required: requiredRoles,
            current: user.role
          });
        }
      }

      // Check permission requirements
      if (options.requiredPermission) {
        const { resource, action } = options.requiredPermission;
        
        if (!AuthService.hasPermission(user, resource, action)) {
          await AuthService.logAuditEvent({
            userId: user.id,
            action: 'access_denied',
            resource: req.url || 'unknown',
            success: false,
            errorMessage: `Missing permission: ${action} on ${resource}`,
            ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
          });
          
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSION',
            required: { resource, action }
          });
        }
      }

      // Check self-access (user accessing their own data)
      if (options.allowSelfAccess) {
        const resourceUserId = req.query.userId || req.body?.userId;
        if (resourceUserId && resourceUserId !== user.id && user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'Can only access your own data',
            code: 'SELF_ACCESS_ONLY'
          });
        }
      }

      // Attach user to request
      req.user = user;

      // Log successful access for audit
      await AuthService.logAuditEvent({
        userId: user.id,
        action: 'api_access',
        resource: req.url || 'unknown',
        success: true,
        ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      // Call the actual handler
      return handler(req, res);
    } catch (error: any) {
      console.error('Auth middleware error:', error);
      
      // Log the error
      await AuthService.logSystemEvent({
        level: 'error',
        category: 'authentication',
        message: 'Authentication middleware error',
        details: { error: error.message, stack: error.stack },
        source: 'withAuth middleware'
      });
      
      return res.status(500).json({
        success: false,
        error: 'Authentication error',
        code: 'AUTH_ERROR'
      });
    }
  };
}

// Convenience functions for specific roles
export const withAdminAuth = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) => 
  withAuth(handler, { requiredRole: 'admin' });

export const withManagerAuth = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) => 
  withAuth(handler, { requiredRole: ['admin', 'manager'] });

export const withDoctorAuth = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) => 
  withAuth(handler, { requiredRole: ['admin', 'doctor'] });

export const withTechnicianAuth = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) => 
  withAuth(handler, { requiredRole: ['admin', 'manager', 'technician'] });

// Permission-based auth
export const withPermission = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  resource: string,
  action: string
) => withAuth(handler, { requiredPermission: { resource, action } });

export default withAuth;