import React from 'react';
import { TrendingUp, Target, AlertTriangle, Gauge } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PerformanceHighlightsProps {
  profit: number;
  spending: number;
  profitToSpending: number;
  completionRate: number;
  overdueTasks: number;
  overdueReminders: number;
  timeWindowLabel?: string;
}

const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

const PerformanceHighlights: React.FC<PerformanceHighlightsProps> = ({
  profit,
  spending,
  profitToSpending,
  completionRate,
  overdueTasks,
  overdueReminders,
  timeWindowLabel,
}) => {
  const net = profit - spending;
  const isPositive = net >= 0;
  const overdueRate = overdueReminders > 0 ? (overdueTasks / overdueReminders) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Operational Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-bold">{formatCurrency(profit)}</p>
          <p className="text-xs text-muted-foreground">
            {timeWindowLabel ? `${timeWindowLabel} revenue` : 'Revenue for selected window'}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Operating spend</span>
            <span>{formatCurrency(spending)}</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'mt-2 w-fit border-0 px-2 py-1 text-xs font-semibold',
              isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            )}
          >
            {isPositive ? 'Net gain' : 'Net loss'}: {formatCurrency(Math.abs(net))}
          </Badge>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
          <Gauge className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-2xl font-bold">{profitToSpending.toFixed(2)}x</p>
          <p className="text-xs text-muted-foreground">Profit to spending ratio</p>
          <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
            Operations are returning <span className="font-semibold">{(profitToSpending * 100).toFixed(1)}%</span> of spend as
            revenue.
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
          <Target className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
            <span className="text-xs text-muted-foreground">Completion rate</span>
          </div>
          <Progress value={completionRate} className="h-2.5" />
          <p className="text-xs text-muted-foreground">
            Maintain ≥95% to meet compliance targets across reproductive protocols.
          </p>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold">{overdueTasks}</p>
            <span className="text-xs text-muted-foreground">tasks overdue</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total reminders</span>
            <span>{overdueReminders}</span>
          </div>
          <Progress value={Math.min(100, overdueRate)} className="h-2.5" />
          <p className="text-xs text-muted-foreground">
            {overdueReminders > 0
              ? `${overdueRate.toFixed(1)}% of reminders require immediate attention.`
              : 'No reminders pending in this window.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceHighlights;
