import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Info } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkforceCapacityChartProps {
  data: Array<{
    period: string;
    requiredLaborHours: number;
    projectedShortfall: number;
  }>;
}

const WorkforceCapacityChart: React.FC<WorkforceCapacityChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return data.map((entry) => ({
      ...entry,
      availableCapacity: Math.max(entry.requiredLaborHours - entry.projectedShortfall, 0),
    }));
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Labor Planning Outlook</CardTitle>
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground" />
            <div className="absolute right-0 top-full z-10 hidden w-64 rounded-md bg-slate-900 p-2 text-xs text-white shadow-md group-hover:block">
              Required hours vs. projected shortfall for each upcoming period. Shortfall represents unmet labor demand.
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Align staffing to close gaps before the forecasted periods begin.
        </p>
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: number, name) => [`${value.toFixed(0)} hrs`, name === 'projectedShortfall' ? 'Projected Shortfall' : name === 'availableCapacity' ? 'Covered Labor' : 'Required Labor']}
                contentStyle={{ borderRadius: 12, borderColor: '#E5E7EB' }}
              />
              <Legend iconType="circle" />
              <Area
                type="monotone"
                dataKey="availableCapacity"
                name="Covered Labor"
                stroke="#22C55E"
                fill="#22C55E"
                fillOpacity={0.2}
                activeDot={{ r: 4 }}
              />
              <Bar
                dataKey="projectedShortfall"
                name="Projected Shortfall"
                stackId="a"
                fill="#F97316"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="requiredLaborHours"
                name="Required Labor"
                barSize={4}
                stroke="#2563EB"
                fill="#2563EB"
                fillOpacity={0.15}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No workforce forecast data for the selected window.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkforceCapacityChart;
