import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Server } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface Timeseries { [key: string]: [string, number][] }
interface StatsEntry { avg: number; min: number; max: number; }
interface StatsSummary { [metric: string]: StatsEntry }
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
    interfaces: Record<string, {address: string, family: string, internal: boolean}[]>
  };
  process: {
    pid: number;
    memoryUsageMB: number;
    startTime: string;
  };
  downtimes: {start: string, end: string, reason?: string}[];
  feedbackCount: number;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [windowParam, setWindowParam] = useState('1h');
  const [metricsData, setMetricsData] = useState<SystemMetricsAPI | null>(null);
  const [loading, setLoading] = useState(true);

  const windowOptions = [
    { value: '5m', label: '5 min' },
    { value: '30m', label: '30 min' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '1d', label: '1 day' },
    { value: '7d', label: '1 week' },
    { value: '30d', label: '1 month' },
    { value: '90d', label: '3 months' }
  ];

  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line
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

  const SystemHealthCard = () => {
    if (!metricsData) return null;
    
    // Calculate average CPU load across all cores
    const cpuUsage = metricsData.cpuLoad.reduce((a, b) => a + b, 0) / metricsData.cpuLoad.length;
    const memUsage = metricsData.ram.usagePercent;
    
    // Create single point data for current values
    const currentTime = new Date();
    const cpuSeries = [{ x: currentTime, y: cpuUsage }];
    const memSeries = [{ x: currentTime, y: memUsage }];
    const chartData = {
      labels: cpuSeries.map(p => p.x.toLocaleTimeString()),
      datasets: [
        {
          label: 'CPU (%)',
          data: cpuSeries.map(p => p.y),
          borderColor: '#1d4ed8',
          fill: true,
          backgroundColor: 'rgba(29, 78, 216, 0.08)',
          tension: 0.3,
        },
        {
          label: 'RAM (%)',
          data: memSeries.map(p => p.y),
          borderColor: '#a21caf',
          fill: true,
          backgroundColor: 'rgba(162, 28, 175, 0.09)',
          tension: 0.3,
        }
      ]
    };
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
            <select
              value={windowParam}
              onChange={e => setWindowParam(e.target.value)}
              className="border rounded px-2 py-1 text-sm ml-6"
            >
              {windowOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div style={{ width: '100%', height: 220 }}>
            <Line data={chartData} options={{
              responsive: true,
              plugins: { legend: { display: true } },
              scales: { y: { beginAtZero: true, max: 100 } }
            }} />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium">CPU Latest</div>
              <div>{cpuUsage.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Across {metricsData.cpuLoad.length} CPU cores</div>
            </div>
            <div>
              <div className="font-medium">RAM Latest</div>
              <div>{memUsage.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Total: {(metricsData.ram.total / 1e9).toFixed(1)}GB, Free: {(metricsData.ram.free / 1e9).toFixed(1)}GB</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || !metricsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <RefreshCw className="h-5 w-5 animate-spin" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}. Here's your system overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            System Online
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthCard />
        {/* More cards for DB, active users, alerts, etc., wired as above */}
      </div>
    </div>
  );
};

export default AdminDashboard;
