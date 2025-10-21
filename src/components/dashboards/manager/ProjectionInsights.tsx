import React from 'react';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectionItem {
  timeHorizon: string;
  forecastedProfit: number;
  forecastedSpending: number;
  recommendedLabor: number;
}

interface ProjectionInsightsProps {
  data: ProjectionItem[];
}

const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

const ProjectionInsights: React.FC<ProjectionInsightsProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    timeHorizon: item.timeHorizon,
    profit: item.forecastedProfit,
    spending: item.forecastedSpending,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Strategic Outlook</CardTitle>
          <Badge variant="secondary" className="flex items-center space-x-1 bg-indigo-100 text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Forecast</span>
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          AI-ready projections highlight revenue, spending, and workforce requirements for the upcoming horizons.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.length ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 0, right: 16, top: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="timeHorizon" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: 12, borderColor: '#E5E7EB' }} />
                <Line type="monotone" dataKey="profit" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} name="Forecasted Profit" />
                <Line type="monotone" dataKey="spending" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Forecasted Spending" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No projection data available for the selected window.
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.map((item) => {
            const margin = item.forecastedProfit - item.forecastedSpending;
            const isPositive = margin >= 0;
            return (
              <div key={item.timeHorizon} className="rounded-lg border border-slate-200/80 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{item.timeHorizon}</p>
                  <Badge
                    variant="outline"
                    className={isPositive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}
                  >
                    {isPositive ? 'Positive Margin' : 'Monitor Spend'}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <p className="uppercase tracking-wide">Forecasted Profit</p>
                    <p className="text-sm font-semibold text-slate-700">{formatCurrency(item.forecastedProfit)}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide">Forecasted Spending</p>
                    <p className="text-sm font-semibold text-slate-700">{formatCurrency(item.forecastedSpending)}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide">Recommended Labor</p>
                    <p className="text-sm font-semibold text-slate-700">{item.recommendedLabor.toLocaleString()} hrs</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide">Margin</p>
                    <p className={isPositive ? 'text-sm font-semibold text-emerald-600' : 'text-sm font-semibold text-rose-600'}>
                      {formatCurrency(Math.abs(margin))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectionInsights;
