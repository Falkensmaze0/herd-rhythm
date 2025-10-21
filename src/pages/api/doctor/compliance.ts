import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';
import { prisma } from '@/lib/prisma';

// ML-friendly type for compliance analytics
type ProtocolComplianceSummary = {
  window: string;
  protocols: Record<string, { total: number, completed: number, missed: number, complianceRate: number, timeseries: { x: string, y: number }[] }>;
  overall: { total: number, completed: number, missed: number, complianceRate: number };
}

function parseWindow(window: string): {from: Date, to: Date} {
  const ms: Record<string, number> = { '7d': 1000*60*60*24*7, '30d': 1000*60*60*24*30, '90d': 1000*60*60*24*90, '1y': 1000*60*60*24*365 };
  const now = new Date();
  const len = ms[window] ?? ms['30d'];
  return { from: new Date(now.getTime()-len), to: now};
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({success: false, message: 'Method not allowed'});
  }
  try {
    const sessionToken = req.cookies.sessionToken || req.headers.authorization?.replace('Bearer ', '');
    const user = sessionToken ? await AuthService.validateSession(sessionToken) : null;
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({success: false, message: 'Doctor access only'});
    }
    const window = (req.query.window as string) || '30d';
    const {from, to} = parseWindow(window);

    // Pull reminders for medical protocols
    const reminders = await prisma.reminder.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        type: { in: ['injection', 'ai', 'medication', 'vaccination', 'pregnancy_check', 'breeding'] },
      },
      orderBy: { createdAt: 'asc' }
    });

    const protocols: ProtocolComplianceSummary['protocols'] = {};
    let total = 0, completed = 0, missed = 0;
    for (const r of reminders) {
      const proto = r.type;
      if (!protocols[proto]) protocols[proto] = { total: 0, completed: 0, missed: 0, complianceRate: 0, timeseries: [] };
      protocols[proto].total += 1;
      total += 1;
      if (r.completed) {
        protocols[proto].completed += 1;
        completed += 1;
      } else {
        protocols[proto].missed += 1;
        missed +=1;
      }
      protocols[proto].timeseries.push({ x: r.createdAt.toISOString(), y: r.completed ? 1 : 0 });
    }
    for (const p in protocols) {
      protocols[p].complianceRate = protocols[p].total ? Math.round(100.0 * protocols[p].completed / protocols[p].total * 10) / 10 : 0;
    }
    const overall = {
      total,
      completed,
      missed,
      complianceRate: total ? Math.round(100.0*completed/total*10)/10 : 0
    };
    return res.status(200).json({
      success: true,
      data: {window, protocols, overall},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Compliance error:', err);
    return res.status(500).json({success:false, message:'Failed to fetch compliance'});
  }
}
