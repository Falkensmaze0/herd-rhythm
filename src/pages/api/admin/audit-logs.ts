import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';
import { AuditLog } from '@/types';
import { prisma } from '@/lib/prisma';

interface AuditLogsResponse {
  success: boolean;
  data?: AuditLog[];
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuditLogsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Validate admin session
    const sessionToken = req.cookies.sessionToken || 
                        req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await AuthService.validateSession(sessionToken);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 per page
    const userId = req.query.userId as string;
    const action = req.query.action as string;
    const resource = req.query.resource as string;
    const success = req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    // Build filter conditions
    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };
    if (success !== undefined) where.success = success;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get total count for pagination
    const total = await prisma.auditLog.count({ where });

    // Get audit logs with pagination
    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform data for response
    const transformedLogs: AuditLog[] = auditLogs.map(log => ({
      id: log.id,
      userId: log.userId,
      sessionId: log.sessionId,
      action: log.action as any,
      resource: log.resource,
      resourceId: log.resourceId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      success: log.success,
      errorMessage: log.errorMessage,
      duration: log.duration,
      createdAt: log.createdAt.toISOString()
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    // Log the audit log access
    await AuthService.logAuditEvent({
      userId: user.id,
      action: 'view',
      resource: 'audit-logs',
      success: true,
      newValues: {
        filters: { userId, action, resource, success, startDate, endDate },
        pagination: { page, limit }
      }
    });

    return res.status(200).json({
      success: true,
      data: transformedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error: any) {
    console.error('Audit logs API error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs'
    });
  }
}