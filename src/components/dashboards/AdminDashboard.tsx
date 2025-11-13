'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Server } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RoleDashboardLayout } from './RoleDashboardLayout';
import type { Highlight } from './RoleDashboardLayout';
import { DashboardSkeleton } from './DashboardSkeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface SystemMetricsAPI {
  cpuLoad: number[];
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
  apiRequestsLast10min: number;
  network: {
    interfaces: Record<string, { address: string; family: string; internal: boolean }[]>;
  };
  process: {
    pid: number;
    memoryUsageMB: number;
    startTime: string;
  };
  downtimes: { start: string; end: string; reason?: string }[];
  feedbackCount: number;
}

const WINDOW_OPTIONS = [
  { value: '5m', label: '5 min' },
  { value: '30m', label: '30 min' },
  { value: '1h', label: '1 hour' },
  { value: '6h', label: '6 hours' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '1 week' },
  { value: '30d', label: '1 month' },
  { value: '90d', label: '3 months' },
];

const SystemHealthCard = ({
  metricsData,
  windowParam,
  setWindowParam,
}: {
  metricsData: SystemMetricsAPI;
  windowParam: string;
  setWindowParam: (value: string) => void;
}) => {
  const cpuUsage = metricsData.cpuLoad.reduce((a, b) => a + b, 0) / metricsData.cpuLoad.length;
  const memUsage = metricsData.ram.usagePercent;
  const currentTime = new Date();
  const cpuSeries = [{ x: currentTime, y: cpuUsage }];
  const memSeries = [{ x: currentTime, y: memUsage }];

  const chartData = {
    labels: cpuSeries.map((point) => point.x.toLocaleTimeString()),
    datasets: [
      {
        label: 'CPU (%)',
        data: cpuSeries.map((point) => point.y),
        borderColor: '#0f766e',
        fill: true,
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        tension: 0.35,
      },
      {
        label: 'RAM (%)',
        data: memSeries.map((point) => point.y),
        borderColor: '#7c3aed',
        fill: true,
        backgroundColor: 'rgba(124, 58, 237, 0.08)',
        tension: 0.35,
      },
    ],
  };

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="h-5 w-5" />
            System Health
          </CardTitle>
          <select value={windowParam} onChange={(event) => setWindowParam(event.target.value)} className="role-select">
            {WINDOW_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <CardDescription>CPU and RAM telemetry averaged across every core.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div style={{ width: '100%', height: 220 }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { display: true } },
              scales: { y: { beginAtZero: true, max: 100 } },
            }}
          />
        </div>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">CPU Latest</p>
            <p className="text-2xl font-semibold">{cpuUsage.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              Across {metricsData.cpuLoad.length} logical cores
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">RAM Latest</p>
            <p className="text-2xl font-semibold">{memUsage.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              Total {(metricsData.ram.total / 1e9).toFixed(1)} GB • Free{' '}
              {(metricsData.ram.free / 1e9).toFixed(1)} GB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SystemMetaCard = ({ metricsData }: { metricsData: SystemMetricsAPI }) => {
  const formatGB = (value: number) => `${(value / 1024 / 1024 / 1024).toFixed(1)} GB`;
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Runtime Signals</CardTitle>
        <CardDescription>Node, process, and connectivity facts refreshed live.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Uptime</p>
            <p className="text-2xl font-semibold">{formatDuration(metricsData.uptimeSeconds)}</p>
            <p className="text-sm text-muted-foreground">
              {Math.floor(metricsData.uptimeSeconds / 3600)} hours online
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">API load</p>
            <p className="text-2xl font-semibold">
              {metricsData.apiRequestsLast10min.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Requests in the last 10 minutes</p>
          </div>
        </div>
        <Separator />
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Node version</span>
            <span className="font-medium">{metricsData.nodeVersion}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Process</span>
            <span className="font-medium">PID {metricsData.process.pid}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Memory footprint</span>
            <span className="font-medium">{metricsData.process.memoryUsageMB} MB</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">RAM available</span>
            <span className="font-medium">
              {formatGB(metricsData.ram.free)} / {formatGB(metricsData.ram.total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const formatDuration = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [windowParam, setWindowParam] = useState('1h');
  const [metricsData, setMetricsData] = useState<SystemMetricsAPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowParam]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/system-metrics?window=${windowParam}`);
      const json = await res.json();
      setMetricsData(json.data);
    } catch (err) {
      setMetricsData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metricsData) {
    return (
      <RoleDashboardLayout
        role="admin"
        title="Admin Command Center"
        description="Calibrating telemetry and infrastructure vitals."
        actions={
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Refreshing
          </Button>
        }
      >
        <DashboardSkeleton />
      </RoleDashboardLayout>
    );
  }

  const highlights: Highlight[] = [
    {
      label: 'Uptime',
      value: formatDuration(metricsData.uptimeSeconds),
      hint: `${metricsData.process.memoryUsageMB} MB process footprint`,
    },
    {
      label: 'API Requests',
      value: metricsData.apiRequestsLast10min.toLocaleString(),
      hint: 'Last 10 minutes',
    },
    {
      label: 'RAM usage',
      value: `${metricsData.ram.usagePercent.toFixed(0)}%`,
      hint: `${(metricsData.ram.used / 1e9).toFixed(1)} GB in use`,
      tone: metricsData.ram.usagePercent > 80 ? 'warn' : 'default',
    },
  ];

  return (
    <RoleDashboardLayout
      role="admin"
      title="Admin Command Center"
      description={`Welcome back, ${user?.name ?? 'team'}. Live metrics across ${
        metricsData.cpuLoad.length
      } cores and all nodes.`}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="role-button" onClick={loadMetrics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Badge variant="secondary" className="rounded-full bg-emerald-100 text-emerald-700">
            System online
          </Badge>
        </div>
      }
      highlights={highlights}
    >
      <div className="role-grid lg:grid-cols-2">
        <SystemHealthCard
          metricsData={metricsData}
          windowParam={windowParam}
          setWindowParam={setWindowParam}
        />
        <SystemMetaCard metricsData={metricsData} />
      </div>
    </RoleDashboardLayout>
  );
};

export default AdminDashboard;
