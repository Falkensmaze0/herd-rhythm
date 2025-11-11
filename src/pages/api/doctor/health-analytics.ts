import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';
import { prisma } from '@/lib/prisma';

// Strict ML-friendly type for doctor analytics
type HealthAnalyticsSummary = {
  window: string;
  eventCounts: Record<string, number>; // illness, death, recovery, pregnancy, etc
  timeseries: Record<string, { x: string, y: number }[]>; // type-timestamp-value arrays
  outcomeBreakdown: Record<string, number>; // by intervention/outcome/cause
  cohortStats: Record<string, any>; // ready for subcohorts or grouping
  atRiskAnimals: {cowId: string, eventType: string, lastSeen: string, status: string}[];
}

// Helper to parse window param
function parseWindow(window: string): {from: Date, to: Date} {
  const ms: Record<string, number> = {
    '7d': 1000 * 60 * 60 * 24 * 7,
    '30d': 1000 * 60 * 60 * 24 * 30,
    '90d': 1000 * 60 * 60 * 24 * 90,
    '1y': 1000 * 60 * 60 * 24 * 365
  };
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
    // DB query: all health events in window
    const events = await prisma.animalEvent.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: 'asc' }
    });
    // Summary count per type
    const eventCounts: Record<string, number> = {};
    for (const ev of events) {
      eventCounts[ev.eventType] = (eventCounts[ev.eventType]||0)+1;
    }
    // Timeseries per type
    const timeseries: Record<string, {x:string, y:number}[]> = {};
    for (const ev of events) {
      if (!timeseries[ev.eventType]) timeseries[ev.eventType] = [];
      timeseries[ev.eventType].push({ x: ev.createdAt.toISOString(), y: 1 });
    }
    // Breakdown by outcome/intervention
    const outcomeBreakdown: Record<string, number> = {};
    for (const ev of events) {
      const out = ev.outcome || 'unknown';
      outcomeBreakdown[out] = (outcomeBreakdown[out]||0)+1;
    }
    // At-risk: all with illness not marked 'recovery' in window
    const atRiskAnimals = events
      .filter(ev => ev.eventType==='illness' && (!ev.outcome || ev.outcome!=='recovery'))
      .map(ev => ({cowId: ev.cowId, eventType: ev.eventType, lastSeen: ev.createdAt.toISOString(), status: ev.outcome||'unresolved'}));
    // Cohorts - by breed/age/status etc: for extensibility
    const cohortStats: Record<string, any> = {};
    // (Add grouping code as needed for research)
    return res.status(200).json({
      success: true,
      data: {window, eventCounts, timeseries, outcomeBreakdown, atRiskAnimals, cohortStats},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Health analytics error:', err);
    return res.status(500).json({success:false, message:'Failed to fetch analytics'});
  }
}
