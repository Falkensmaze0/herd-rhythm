import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';
import { prisma } from '@/lib/prisma';

/**
 * This endpoint returns a list of active users (by recent session/audit log).
 * For scalability, fetch by last activity within the last 24h.
 * (Adjustable: replace with real session/activity logic if/when needed)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const sessionToken = req.cookies.sessionToken || req.headers.authorization?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const user = await AuthService.validateSession(sessionToken);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Find recent users by recent audit log within 24h, fallback to lastLogin if such field exists
    const since = new Date();
    since.setDate(since.getDate() - 1);

    // From audit logs (modular for future active session service)
    const recentLogs = await prisma.auditLog.findMany({
      where: { createdAt: { gte: since } },
      select: { userId: true },
      distinct: ['userId']
    });
    const userIds = recentLogs.map(log => log.userId).filter((id): id is string => id !== null);

    const activeUsers = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, role: true }
        })
      : [];

    // Optionally: expose count and last activity
    return res.status(200).json({
      success: true,
      data: activeUsers,
      count: activeUsers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Active users API error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve active users' });
  }
}
