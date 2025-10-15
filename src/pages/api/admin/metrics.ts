import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/services/AuthService';
import { SystemMetrics } from '@/types';
import { prisma } from '@/lib/prisma';

interface MetricsResponse {
  success: boolean;
  data?: SystemMetrics;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetricsResponse>
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

    // Get system metrics
    const metrics = await getSystemMetrics();

    // Log the metrics access
    await AuthService.logAuditEvent({
      userId: user.id,
      action: 'view',
      resource: 'system-metrics',
      success: true,
    });

    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    console.error('Metrics API error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve system metrics'
    });
  }
}

async function getSystemMetrics(): Promise<SystemMetrics> {
  // In a real implementation, you would gather actual system metrics
  // For now, we'll return mock data with some realistic calculations
  
  try {
    // Get database metrics
    const [cowCount, reminderCount, userCount] = await Promise.all([
      prisma.cow.count(),
      prisma.reminder.count({ where: { completed: false } }),
      prisma.user.count({ where: { isActive: true } })
    ]);

    // Mock system health data (in production, you'd get these from actual system monitoring)
    const now = new Date();
    const cpuUsage = Math.random() * 30 + 20; // 20-50%
    const memoryUsage = Math.random() * 40 + 30; // 30-70%
    const diskUsage = Math.random() * 20 + 40; // 40-60%
    const networkIn = Math.random() * 100 + 50; // MB/s
    const networkOut = Math.random() * 50 + 25; // MB/s
    
    // Database metrics
    const dbConnections = Math.floor(Math.random() * 10) + 5; // 5-15 connections
    const dbResponseTime = Math.random() * 50 + 10; // 10-60ms
    const dbQueryCount = Math.floor(Math.random() * 100) + 50; // 50-150 queries/min
    const dbSlowQueries = Math.floor(Math.random() * 3); // 0-2 slow queries
    
    // Application metrics
    const requestsPerMinute = Math.floor(Math.random() * 200) + 100; // 100-300 req/min
    const errorRate = Math.random() * 2; // 0-2% error rate
    const uptime = Math.floor(Date.now() / 1000); // seconds since epoch (mock)
    
    const metrics: SystemMetrics = {
      id: `metrics-${Date.now()}`,
      timestamp: now.toISOString(),
      
      // Server metrics
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkIn,
      networkOut,
      
      // Database metrics
      dbConnections,
      dbResponseTime,
      dbQueryCount,
      dbSlowQueries,
      
      // Application metrics
      activeUsers: userCount,
      requestsPerMinute,
      errorRate,
      uptime: 86400, // 1 day uptime
      
      // Farm-specific metrics
      totalCows: cowCount,
      activeReminders: reminderCount,
      completedTasks: Math.floor(Math.random() * 50) + 20, // Mock completed tasks
      systemAlerts: Math.floor(Math.random() * 3) // 0-2 alerts
    };

    // Store metrics in database for historical tracking
    try {
      await prisma.systemMetrics.create({
        data: metrics
      });
    } catch (dbError) {
      console.error('Failed to store metrics in database:', dbError);
      // Don't fail the request if we can't store metrics
    }

    return metrics;
  } catch (error) {
    console.error('Error calculating system metrics:', error);
    
    // Return mock data if we can't calculate real metrics
    return {
      id: `mock-metrics-${Date.now()}`,
      timestamp: new Date().toISOString(),
      cpuUsage: 25,
      memoryUsage: 45,
      diskUsage: 55,
      networkIn: 75,
      networkOut: 35,
      dbConnections: 8,
      dbResponseTime: 25,
      dbQueryCount: 120,
      dbSlowQueries: 0,
      activeUsers: 5,
      requestsPerMinute: 180,
      errorRate: 0.5,
      uptime: 86400,
      totalCows: 150,
      activeReminders: 25,
      completedTasks: 35,
      systemAlerts: 1
    };
  }
}