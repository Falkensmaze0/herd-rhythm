import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';

/**
 * Returns recent system/user/security alerts.
 * Schema is industry-aligned for SaaS/enterprise platforms.
 * Modular for future DB or service integration.
 */
export type AlertSeverity = 'info' | 'warn' | 'critical';
export type AlertType = 'security' | 'system' | 'user' | 'analytics' | 'integrity';

export interface AdminAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  affectedUsers?: string[]; // userIDs
  resource?: string; // e.g., "prisma", "auth", etc
  actionable?: boolean;
}

const exampleAlerts: AdminAlert[] = [
  {
    id: 'a-001',
    type: 'security',
    severity: 'critical',
    message: 'Failed admin login attempts from 4 unique IPs in last hour.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    actionable: true
  },
  {
    id: 'a-002',
    type: 'system',
    severity: 'warn',
    message: 'Database CPU usage exceeded 85%.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    resource: 'postgres',
    actionable: false
  },
  {
    id: 'a-003',
    type: 'user',
    severity: 'info',
    message: '123 unique users completed 2FA setup this week.',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    affectedUsers: [],
    actionable: false
  },
  {
    id: 'a-004',
    type: 'analytics',
    severity: 'info',
    message: 'Login success rate dropped by 8% compared to previous week.',
    timestamp: new Date().toISOString(),
    actionable: true
  }
];

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

    // In production, fetch from DB or alert service; here is static for now.
    return res.status(200).json({
      success: true,
      data: exampleAlerts,
      count: exampleAlerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Alerts API error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve alerts' });
  }
}
