import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Plus,
  Syringe,
  Thermometer,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { fetchWithAuth } from '@/lib/apiClient';
import { DashboardSkeleton } from './DashboardSkeleton';

type HealthAnalyticsSummary = {
  window: string;
  eventCounts: Record<string, number>;
  timeseries: Record<string, { x: string; y: number }[]>;
  outcomeBreakdown: Record<string, number>;
  cohortStats: Record<string, unknown>;
  atRiskAnimals: {
    cowId: string;
    eventType: string;
    lastSeen: string;
    status: string;
  }[];
};

type ProtocolComplianceSummary = {
  window: string;
  protocols: Record<
    string,
    {
      total: number;
      completed: number;
      missed: number;
      complianceRate: number;
      timeseries: { x: string; y: number }[];
    }
  >;
  overall: {
    total: number;
    completed: number;
    missed: number;
    complianceRate: number;
  };
};

const WINDOW_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

const EVENT_COLORS = ['#2563eb', '#16a34a', '#f97316', '#9333ea', '#0ea5e9'];

const COMPLIANCE_CHART_CONFIG: ChartConfig = {
  complianceRate: {
    label: 'Compliance Rate',
    color: '#2563eb',
  },
};

const formatMetricLabel = (key: string) =>
  key
    .split(/[_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getEventIcon = (type: string) => {
  switch (type) {
    case 'illness':
    case 'disease':
      return <Thermometer className="h-5 w-5 text-orange-500" />;
    case 'recovery':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'pregnancy':
    case 'calving':
      return <TrendingUp className="h-5 w-5 text-indigo-500" />;
    case 'death':
    case 'mortality':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <Activity className="h-5 w-5 text-blue-500" />;
  }
};

const getStatusBadgeClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes('unresolved') || normalized.includes('critical')) {
    return 'border-red-200 text-red-600 bg-red-50';
  }
  if (normalized.includes('monitor') || normalized.includes('pending')) {
    return 'border-amber-200 text-amber-600 bg-amber-50';
  }
  if (normalized.includes('recover') || normalized.includes('resolved')) {
    return 'border-emerald-200 text-emerald-600 bg-emerald-50';
  }
  return 'border-slate-200 text-slate-600 bg-slate-50';
};

const WindowSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="border rounded px-2 py-1 text-sm bg-white shadow-sm"
  >
    {WINDOW_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const QuickActions: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Button variant="default" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          New Treatment
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Syringe className="mr-2 h-4 w-4" />
          Schedule Vaccination
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Thermometer className="mr-2 h-4 w-4" />
          Record Health Check
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [healthAnalytics, setHealthAnalytics] = useState<HealthAnalyticsSummary | null>(null);
  const [complianceSummary, setComplianceSummary] = useState<ProtocolComplianceSummary | null>(
    null
  );
  const [windowParam, setWindowParam] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const [healthRes, complianceRes] = await Promise.all([
          fetchWithAuth(`/api/doctor/health-analytics?window=${windowParam}`),
          fetchWithAuth(`/api/doctor/compliance?window=${windowParam}`),
        ]);

        const healthJson = await healthRes.json();
        if (!healthRes.ok || !healthJson?.success) {
          throw new Error(healthJson?.message || 'Failed to load health analytics');
        }
        const complianceJson = await complianceRes.json();
        if (!complianceRes.ok || !complianceJson?.success) {
          throw new Error(complianceJson?.message || 'Failed to load compliance analytics');
        }

        setHealthAnalytics(healthJson.data as HealthAnalyticsSummary);
        setComplianceSummary(complianceJson.data as ProtocolComplianceSummary);
      } catch (err) {
        console.error('Doctor analytics error:', err);
        setError(
          err instanceof Error ? err.message : 'We could not fetch the latest medical analytics.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [windowParam]);

  const topEventTypes = useMemo(() => {
    if (!healthAnalytics) {
      return [];
    }
    return Object.entries(healthAnalytics.eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);
  }, [healthAnalytics]);

  const eventTrendConfig = useMemo<ChartConfig>(() => {
    const entries = topEventTypes.map((type, index) => [
      type,
      {
        label: formatMetricLabel(type),
        color: EVENT_COLORS[index % EVENT_COLORS.length],
      },
    ]);
    return Object.fromEntries(entries) as ChartConfig;
  }, [topEventTypes]);

  const eventTimeseriesData = useMemo(() => {
    if (!healthAnalytics || topEventTypes.length === 0) {
      return [];
    }
    const buckets: Record<string, Record<string, number>> = {};

    topEventTypes.forEach((type) => {
      const series = healthAnalytics.timeseries[type] ?? [];
      series.forEach(({ x }) => {
        const day = format(new Date(x), 'yyyy-MM-dd');
        if (!buckets[day]) {
          buckets[day] = {};
        }
        buckets[day][type] = (buckets[day][type] ?? 0) + 1;
      });
    });

    return Object.entries(buckets)
      .map(([date, values]) => {
        const metrics: Record<string, number> = {};
        topEventTypes.forEach((type) => {
          metrics[type] = values[type] ?? 0;
        });
        return {
          date,
          dateLabel: format(new Date(date), 'MMM dd'),
          ...metrics,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [healthAnalytics, topEventTypes]);

  const outcomeBreakdown = useMemo(() => {
    if (!healthAnalytics) {
      return [];
    }
    const entries = Object.entries(healthAnalytics.outcomeBreakdown);
    const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;
    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([outcome, count]) => ({
        outcome,
        label: formatMetricLabel(outcome),
        count,
        percentage: Math.round((count / total) * 1000) / 10,
      }));
  }, [healthAnalytics]);

  const complianceChartData = useMemo(() => {
    if (!complianceSummary) {
      return [];
    }
    return Object.entries(complianceSummary.protocols)
      .map(([protocol, stats]) => ({
        protocol,
        label: formatMetricLabel(protocol),
        complianceRate: stats.complianceRate,
        completed: stats.completed,
        missed: stats.missed,
        total: stats.total,
      }))
      .sort((a, b) => b.complianceRate - a.complianceRate);
  }, [complianceSummary]);

  const summaryMetrics = useMemo(() => {
    if (!healthAnalytics) {
      return [];
    }
    const totalEvents = Object.values(healthAnalytics.eventCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const illnessEvents = healthAnalytics.eventCounts['illness'] ?? 0;
    const recoveries = healthAnalytics.eventCounts['recovery'] ?? 0;
    const atRisk = healthAnalytics.atRiskAnimals.length;

    const metrics = [
      {
        key: 'events',
        label: 'Events Logged',
        value: totalEvents.toLocaleString(),
        helper: topEventTypes[0] ? `${formatMetricLabel(topEventTypes[0])} leading` : undefined,
        icon: <Activity className="h-5 w-5 text-blue-500" />,
      },
      {
        key: 'illness',
        label: 'Illness Events',
        value: illnessEvents.toLocaleString(),
        helper: `${atRisk} flagged`,
        icon: <Thermometer className="h-5 w-5 text-orange-500" />,
      },
      {
        key: 'recovery',
        label: 'Recoveries',
        value: recoveries.toLocaleString(),
        helper: 'Successful interventions',
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      },
      {
        key: 'at-risk',
        label: 'At-Risk Animals',
        value: atRisk.toLocaleString(),
        helper: 'Requires follow-up',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      },
    ];

    if (complianceSummary) {
      const totalProtocols = complianceSummary.overall.total;
      metrics.push({
        key: 'compliance',
        label: 'Protocol Compliance',
        value: `${complianceSummary.overall.complianceRate.toFixed(1)}%`,
        helper: totalProtocols
          ? `${complianceSummary.overall.completed}/${totalProtocols} completed`
          : 'No protocols recorded',
        icon: <TrendingUp className="h-5 w-5 text-indigo-500" />,
      });
    }

    return metrics;
  }, [healthAnalytics, complianceSummary, topEventTypes]);

  const atRiskAnimals = healthAnalytics?.atRiskAnimals ?? [];
  const windowLabel =
    WINDOW_OPTIONS.find((option) => option.value === windowParam)?.label || windowParam;

  if (loading) {
    return (
      <DashboardSkeleton
        title="Medical Intelligence Dashboard"
        description={`Collecting ${windowLabel.toLowerCase()} health telemetry...`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Intelligence Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Good day, Dr. {user?.name}. Live herd health insights for the last {windowLabel}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            Data refreshed on demand
          </Badge>
          <WindowSelector value={windowParam} onChange={setWindowParam} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Live data unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summaryMetrics.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {summaryMetrics.map((metric) => (
            <Card key={metric.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                {metric.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.helper && (
                  <p className="text-xs text-muted-foreground">{metric.helper}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Health Event Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {eventTimeseriesData.length > 0 ? (
              <ChartContainer config={eventTrendConfig}>
                <AreaChart data={eventTimeseriesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {topEventTypes.map((type) => (
                    <Area
                      key={type}
                      type="monotone"
                      dataKey={type}
                      stroke={`var(--color-${type})`}
                      fill={`var(--color-${type})`}
                      strokeWidth={2}
                      fillOpacity={0.15}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </AreaChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                No medical events recorded for the selected window.
              </p>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Outcome Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {outcomeBreakdown.length > 0 ? (
                outcomeBreakdown.slice(0, 6).map((item) => (
                  <div key={item.outcome} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.count} events</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No outcome data available.</p>
              )}
            </CardContent>
          </Card>
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Protocol Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {complianceChartData.length > 0 ? (
              <>
                <ChartContainer config={COMPLIANCE_CHART_CONFIG}>
                  <BarChart data={complianceChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent formatter={(value) => `${Number(value).toFixed(1)}%`} />
                      }
                    />
                    <Bar
                      dataKey="complianceRate"
                      radius={[6, 6, 0, 0]}
                      fill="var(--color-complianceRate)"
                    />
                  </BarChart>
                </ChartContainer>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Protocol</TableHead>
                        <TableHead>Compliance</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Missed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complianceChartData.map((protocol) => (
                        <TableRow key={protocol.protocol}>
                          <TableCell className="font-medium">{protocol.label}</TableCell>
                          <TableCell>{protocol.complianceRate.toFixed(1)}%</TableCell>
                          <TableCell>
                            {protocol.completed}/{protocol.total}
                          </TableCell>
                          <TableCell>{protocol.missed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No protocol reminders were recorded during this window.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Animals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {atRiskAnimals.length > 0 ? (
              <div className="space-y-3">
                {atRiskAnimals.slice(0, 6).map((animal) => (
                  <div key={`${animal.cowId}-${animal.lastSeen}`} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">#{animal.cowId}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMetricLabel(animal.eventType)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          getStatusBadgeClass(animal.status)
                        )}
                      >
                        {formatMetricLabel(animal.status)}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>Last seen</span>
                      <span className="text-right">
                        {format(new Date(animal.lastSeen), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
                {atRiskAnimals.length > 6 && (
                  <p className="text-xs text-muted-foreground">
                    Showing first 6 animals. Review full list in the medical records module.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No animals are currently flagged as at risk.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
