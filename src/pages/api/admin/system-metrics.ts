import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService.server';
import os from 'os';

// Modular type for all system/service metrics
type SystemMetric = {
  cpuLoad: number[];  // per-core
  ram: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  uptimeSeconds: number;
  nodeVersion: string;
  arch: string;
  platform: string;
  hostname: string;
  apiRequestsLast10min: number; // placeholder for later collector integration
  network: {
    interfaces: Record<string, {address: string, family: string, internal: boolean}[]>
  };
  process: {
    pid: number;
    memoryUsageMB: number;
    startTime: string;
  };
  downtimes: {start: string, end: string, reason?: string}[]; // window list
  feedbackCount: number;
};

const mockDowntimes = [
  {start: new Date(Date.now() - 1000*60*60*7).toISOString(), end: new Date(Date.now() - 1000*60*60*6.7).toISOString(), reason:"Cloud backup out-of-sync"},
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const sessionToken = req.cookies.sessionToken || req.headers.authorization?.replace('Bearer ', '');
    const user = sessionToken ? await AuthService.validateSession(sessionToken) : null;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access only' });
    }

    // CPU
    const loads = os.cpus().map((c: any) => c.times.user + c.times.nice + c.times.sys + c.times.irq);
    // RAM
    const total = os.totalmem(), free = os.freemem(), used = total - free;
    // Net
    const nics = os.networkInterfaces();
    // Process
    const processInfo = {
      pid: process.pid,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1e6),
      startTime: new Date(Date.now() - process.uptime()*1000).toISOString()
    };

    // Feedback count: Placeholder, in real app query Feedback table.
    const feedbackCount = 16;

    const metrics: SystemMetric = {
      cpuLoad: loads,
      ram: { total, free, used, usagePercent: Math.round((used*100/total)*10)/10 },
      uptimeSeconds: os.uptime(),
      nodeVersion: process.version,
      arch: os.arch(),
      platform: os.platform(),
      hostname: os.hostname(),
      apiRequestsLast10min: 250, // placeholder
      network: { interfaces: nics as any },
      process: processInfo,
      downtimes: mockDowntimes,
      feedbackCount
    };

    return res.status(200).json({ success: true, data: metrics, timestamp: new Date().toISOString() });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('System metrics err:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch system metrics' });
  }
}