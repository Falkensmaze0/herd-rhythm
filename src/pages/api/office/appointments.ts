import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';
import { prisma } from '@/lib/prisma';

// Type for appointments analytics
type AppointmentsAnalytics = {
  window: string;
  total: number;
  completed: number;
  cancelled: number;
  overdue: number;
  timeseries: { x: string, y: number }[]; // per-day/activity
  byAssignee: Record<string, { total: number; completed: number; overdue: number }>;
}

function parseWindow(window: string): {from: Date, to: Date} {
  const ms: Record<string, number> = {
    '7d': 1000 * 60 * 60 * 24 * 7,
    '30d': 1000 * 60 * 60 * 24 * 30,
    '90d': 1000 * 60 * 60 * 24 * 90,
    '1y': 1000 * 60 * 60 * 24 * 365
  };
  const now = new Date();
  return { from: new Date(now.getTime() - (ms[window] ?? ms['30d'])), to: now };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const sessionToken = req.cookies.sessionToken || req.headers.authorization?.replace('Bearer ', '');
    const user = sessionToken ? await AuthService.validateSession(sessionToken) : null;
    if (!user || user.role !== 'office') {
      return res.status(403).json({ success: false, message: 'Office access only' });
    }
    const window = (req.query.window as string) || '30d';
    const {from, to} = parseWindow(window);
    // Query appointments by window
    // TODO: Commented out due to missing Appointment model. Refactor this endpoint.
// const appointments = await undefined /* No Appointment model in schema. */.findMany({
//   where: { scheduledFor: { gte: from, lte: to } },
//   orderBy: { scheduledFor: 'asc' }
// });
    let total = 0, completed = 0, cancelled = 0, overdue = 0;
    const timeseries: { x: string, y: number }[] = [];
    const byAssignee: Record<string, { total: number, completed: number, overdue: number }> = {};
    // TODO: The following block aggregated appointment stats by status and assignee.
// Restore this region after creating an Appointment model with status, scheduledFor, assigneeId, etc.
/*
for(const app of appointments){
  total += 1;
  if (app.status === 'completed') completed += 1;
  if (app.status === 'cancelled') cancelled += 1;
  if (app.status === 'overdue') overdue += 1;
  timeseries.push({ x: app.scheduledFor.toISOString(), y: 1 });
  const assignee = app.assigneeId || 'unassigned';
  if (!byAssignee[assignee]) byAssignee[assignee] = { total: 0, completed: 0, overdue: 0 };
  byAssignee[assignee].total += 1;
  if (app.status === 'completed') byAssignee[assignee].completed += 1;
  if (app.status === 'overdue') byAssignee[assignee].overdue += 1;
}
*/
    return res.status(200).json({
      success: true,
      data: { window, total, completed, cancelled, overdue, timeseries, byAssignee },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Appointment analytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch appointments analytics' });
  }
}