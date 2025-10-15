import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SystemMetrics, AuditLog, SystemLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Cpu, 
  Database, 
  HardDrive, 
  MemoryStick, 
  Network, 
  Shield, 
  Users, 
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Settings,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface SystemHealthProps {
  metrics: SystemMetrics;
}

const SystemHealthCard: React.FC<SystemHealthProps> = ({ metrics }) => {
  const getStatusColor = (value: number, warning: number = 70, critical: number = 90) => {
    if (value >= critical) return 'text-red-600 bg-red-50 border-red-200';
    if (value >= warning) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-red-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Server className="h-5 w-5" />
          <span>System Health</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* CPU Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <span className="text-sm font-semibold">{metrics.cpuUsage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.cpuUsage} className="h-2" />
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MemoryStick className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <span className="text-sm font-semibold">{metrics.memoryUsage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.memoryUsage} className="h-2" />
          </div>

          {/* Disk Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Disk</span>
              </div>
              <span className="text-sm font-semibold">{metrics.diskUsage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.diskUsage} className="h-2" />
          </div>

          {/* Network */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Network className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Network</span>
              </div>
              <div className="text-xs text-gray-500">
                <div>↑ {(metrics.networkOut / 1024 / 1024).toFixed(1)}MB/s</div>
                <div>↓ {(metrics.networkIn / 1024 / 1024).toFixed(1)}MB/s</div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Database Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Database Performance</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Connections:</span>
              <Badge variant={metrics.dbConnections > 50 ? 'destructive' : 'secondary'}>
                {metrics.dbConnections}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-medium">{metrics.dbResponseTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Queries/min:</span>
              <span className="font-medium">{metrics.dbQueryCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Slow Queries:</span>
              <Badge variant={metrics.dbSlowQueries > 0 ? 'destructive' : 'secondary'}>
                {metrics.dbSlowQueries}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ActiveUsersProps {
  users: any[]; // Replace with proper user session type
}

const ActiveUsersCard: React.FC<ActiveUsersProps> = ({ users }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Users className="h-5 w-5" />
        <span>Active Users ({users.length})</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {users.map((user, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {format(new Date(user.lastActivity), 'HH:mm')}
              </div>
              <Badge variant="outline" className="text-xs">
                {user.location || 'Unknown'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

interface AuditLogsProps {
  logs: AuditLog[];
}

const AuditLogsCard: React.FC<AuditLogsProps> = ({ logs }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Shield className="h-5 w-5" />
        <span>Recent Audit Logs</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs">
                  {format(new Date(log.createdAt), 'HH:mm:ss')}
                </TableCell>
                <TableCell className="text-xs">
                  {log.userId ? `User ${log.userId.substring(0, 8)}...` : 'System'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{log.resource}</TableCell>
                <TableCell>
                  {log.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

interface SystemAlertsProps {
  alerts: any[]; // Replace with proper alert type
}

const SystemAlertsCard: React.FC<SystemAlertsProps> = ({ alerts }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5" />
        <span>System Alerts</span>
        {alerts.length > 0 && (
          <Badge variant="destructive">{alerts.length}</Badge>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {alerts.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p>No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
              alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">
                {alert.title}
              </AlertTitle>
              <AlertDescription className="text-xs">
                {alert.description}
              </AlertDescription>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {format(new Date(alert.timestamp), 'MMM dd, HH:mm')}
                </span>
                <Button size="sm" variant="outline" className="h-6 text-xs">
                  Resolve
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, logsRes, usersRes, alertsRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/audit-logs?limit=20'),
        fetch('/api/admin/active-users'),
        fetch('/api/admin/alerts')
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setActiveUsers(usersData);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setSystemAlerts(alertsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const QuickActions: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" className="h-auto p-3">
            <div className="flex flex-col items-center space-y-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Manage Users</span>
            </div>
          </Button>
          <Button variant="outline" size="sm" className="h-auto p-3">
            <div className="flex flex-col items-center space-y-1">
              <Database className="h-4 w-4" />
              <span className="text-xs">Database</span>
            </div>
          </Button>
          <Button variant="outline" size="sm" className="h-auto p-3">
            <div className="flex flex-col items-center space-y-1">
              <Download className="h-4 w-4" />
              <span className="text-xs">Backup</span>
            </div>
          </Button>
          <Button variant="outline" size="sm" className="h-auto p-3">
            <div className="flex flex-col items-center space-y-1">
              <Settings className="h-4 w-4" />
              <span className="text-xs">Settings</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading || !metrics) {
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
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            System Online
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health - Large */}
        <div className="lg:col-span-2">
          <SystemHealthCard metrics={metrics} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Active Users */}
        <ActiveUsersCard users={activeUsers} />

        {/* System Alerts - Large */}
        <div className="lg:col-span-2">
          <SystemAlertsCard alerts={systemAlerts} />
        </div>

        {/* Audit Logs - Full Width */}
        <div className="lg:col-span-3">
          <AuditLogsCard logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};