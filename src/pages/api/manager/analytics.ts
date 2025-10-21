import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';

// Workforce forecast, finance metrics, overdue, breakdown for ML use
export interface ManagerAnalytics {
  timeWindow: 'monthly' | 'quarterly' | 'yearly';
  profitToSpending: number; // ratio (float)
  profit: number; // in system currency
  spending: number;
  costBreakdown: {
    feed: number;
    utilities: number;
    maintenance: number;
    deathsAndIllness: number; // all loss cost
    medical: {
      labor: number; // cost of labor for medical (AI, heatsync, checkups)
      equipment: number;
    };
    incidentals: number;
  };
  overdueTasks: number;
  overdueReminders: number;
  completionRate: number; // percent
  workforceForecast: {
    period: string;
    requiredLaborHours: number;
    projectedShortfall: number;
  }[];
  // ML stub -- will be filled with model outputs
  projection: {
    timeHorizon: string;
    forecastedProfit: number;
    forecastedSpending: number;
    recommendedLabor: number;
  }[];
}

const mock: ManagerAnalytics = {
  timeWindow: 'monthly',
  profitToSpending: 1.23,
  profit: 11340,
  spending: 9189,
  costBreakdown: {
    feed: 4100, utilities: 1400, maintenance: 950, deathsAndIllness: 1110, medical: { labor: 560, equipment: 220 }, incidentals: 849
  },
  overdueTasks: 5,
  overdueReminders: 2,
  completionRate: 94.3,
  workforceForecast: [
    {period:'week1',requiredLaborHours:120,projectedShortfall:8},
    {period:'week2',requiredLaborHours:100,projectedShortfall:0},
  ],
  projection: [
    {timeHorizon:'nextMonth', forecastedProfit:12500, forecastedSpending:9500, recommendedLabor:132},
    {timeHorizon:'quarter', forecastedProfit:38400, forecastedSpending:28600, recommendedLabor:396}
  ]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }
  try {
    const sessionToken = req.cookies.sessionToken || req.headers.authorization?.replace('Bearer ', '');
    const user = sessionToken ? await AuthService.validateSession(sessionToken) : null;
    if (!user || user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Manager access only' });
    }
    // Real app: replace mock with SQL aggregates (+ ML endpoint when model ready)
    return res.status(200).json({ success: true, data: mock, timestamp: new Date().toISOString() })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Manager analytics err:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
}
