import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
// Adjust the import below to your actual ManagerAnalytics type location
import { ManagerAnalytics } from '@/types';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<ManagerAnalytics | null>(null);
  const [windowParam, setWindowParam] = useState('1w');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line
  }, [windowParam]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/manager/analytics?window=${windowParam}`);
      const data = res.ok ? await res.json() : null;
      setAnalyticsData(data?.data || null);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // -------- Time Window Selector --------
  const windowOptions = [
    { value: '5m', label: '5 Min' },
    { value: '30m', label: '30 Min' },
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '1 Week' },
    { value: '30d', label: '1 Month' },
    { value: '90d', label: '1 Quarter' },
    { value: '1y', label: '1 Year' }
  ];

  const AnalyticsWindowSelector = () => (
    <select
      value={windowParam}
      onChange={e => setWindowParam(e.target.value)}
      className="border rounded px-2 py-1 text-sm bg-white ml-2"
      style={{ minWidth: 90 }}
    >
      {windowOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  if (loading || !analyticsData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const {
    profitToSpending,
    profit,
    spending,
    costBreakdown,
    overdueTasks,
    overdueReminders,
    completionRate,
    workforceForecast,
    projection
  } = analyticsData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}. Operational analytics below.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Farm Operations Active</Badge>
          <AnalyticsWindowSelector />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Profit / Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 text-xl font-bold">¥{profit.toLocaleString()} / ¥{spending.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Ratio: {profitToSpending.toFixed(2)}</div>
              <Separator className="my-3" />
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(costBreakdown).map(([k, v]) =>
                  typeof v === 'number' ? (
                    <div key={k}>
                      <span className="text-xs text-gray-600">{k}</span><br />
                      <span className="font-semibold">¥{v.toLocaleString()}</span>
                    </div>
                  ) : (
                    // For nested breakdowns like medical: { labor, equipment }
                    <div key={k}>
                      {Object.entries(v as Record<string, number>).map(([nk, nv]) =>
                        <div key={nk}>
                          <span className="text-xs text-gray-600">{k}/{nk}</span><br />
                          <span className="font-semibold">¥{nv.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardHeader><CardTitle>Completion Rate</CardTitle></CardHeader>
            <CardContent className="text-xl font-bold">{completionRate}%</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Overdue Tasks</CardTitle></CardHeader>
            <CardContent className="text-xl font-bold">{overdueTasks} / {overdueReminders}</CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card>
            <CardHeader><CardTitle>Workforce Forecast</CardTitle></CardHeader>
            <CardContent>
              {/* Plug in a chart here as needed */}
              <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(workforceForecast, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card>
            <CardHeader><CardTitle>Projections (ML Powered in Future)</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(projection, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

