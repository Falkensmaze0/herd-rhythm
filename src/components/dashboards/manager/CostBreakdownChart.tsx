import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CostBreakdownChartProps {
  breakdown: {
    feed: number;
    utilities: number;
    maintenance: number;
    deathsAndIllness: number;
    medical: {
      labor: number;
      equipment: number;
    };
    incidentals: number;
  };
  timeWindowLabel?: string;
}

const COST_COLORS = [
  '#1D4ED8',
  '#0EA5E9',
  '#10B981',
  '#F97316',
  '#9333EA',
  '#E11D48',
  '#6366F1',
];

const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ breakdown, timeWindowLabel }) => {
  const segments = useMemo(() => {
    const entries: Array<{ name: string; value: number; type: string; color: string }> = [];
    const baseEntries: Array<[string, number]> = [
      ['Feed', breakdown.feed],
      ['Utilities', breakdown.utilities],
      ['Maintenance', breakdown.maintenance],
      ['Losses: Health', breakdown.deathsAndIllness],
      ['Incidentals', breakdown.incidentals],
    ];

    baseEntries.forEach(([label, value], index) => {
      entries.push({
        name: label,
        value,
        type: 'primary',
        color: COST_COLORS[index % COST_COLORS.length],
      });
    });

    entries.push(
      {
        name: 'Medical Labor',
        value: breakdown.medical.labor,
        type: 'medical',
        color: COST_COLORS[5],
      },
      {
        name: 'Medical Equipment',
        value: breakdown.medical.equipment,
        type: 'medical',
        color: COST_COLORS[6],
      }
    );

    return entries.filter((entry) => entry.value > 0);
  }, [breakdown]);

  const totalSpend = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Cost Allocation</CardTitle>
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground" />
            <div className="absolute right-0 top-full z-10 hidden w-64 rounded-md bg-slate-900 p-2 text-xs text-white shadow-md group-hover:block">
              Breakdown of operating expenses for the selected time window.
            </div>
          </div>
        </div>
        {timeWindowLabel ? (
          <p className="text-xs text-muted-foreground">{timeWindowLabel} overview</p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:space-x-6">
          <div className="mx-auto w-full max-w-xs">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {segments.map((segment, index) => (
                    <Cell key={segment.name} fill={segment.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 12, borderColor: '#F3F4F6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total spend</p>
              <p className="text-lg font-semibold">{formatCurrency(totalSpend)}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {segments.map((segment, index) => (
                <div
                  key={segment.name}
                  className="flex items-center justify-between rounded-lg border border-slate-200/80 px-3 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-sm font-medium text-slate-700">{segment.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">{formatCurrency(segment.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="w-fit text-xs font-medium">
          Major investment: {segments.sort((a, b) => b.value - a.value)[0]?.name ?? 'N/A'}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default CostBreakdownChart;
