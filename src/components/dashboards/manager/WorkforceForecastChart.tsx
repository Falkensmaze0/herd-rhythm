import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { WorkforceForecast } from "@/services/ReminderService";

// Utility for theme color tokens per role
const CHART_THEME = {
  workers: { color: "#4299E1", label: "Workers" }, // blue-500
  technicians: { color: "#48BB78", label: "Technicians" }, // green-500
  doctors: { color: "#F56565", label: "Doctors" }, // red-500
};

export interface WorkforceForecastChartProps {
  forecast: WorkforceForecast[];
  className?: string;
}

export const WorkforceForecastChart: React.FC<WorkforceForecastChartProps> = ({
  forecast,
  className = "",
}) => {
  const hasData = Array.isArray(forecast) && forecast.length > 0;

  return (
    <div className={`rounded-lg bg-background p-5 shadow ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-lg">Medical Staff Forecast</span>
        <div className="text-sm text-muted-foreground">
          Based on scheduled medical procedures and protocols
        </div>
      </div>
      <div className="h-64 relative">
        {hasData ? (
          <ChartContainer config={CHART_THEME}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <ChartTooltip />
              <ChartLegend verticalAlign="top" />
              <Line
                type="monotone"
                dataKey="workers"
                stroke={CHART_THEME.workers.color}
                name={CHART_THEME.workers.label}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="technicians"
                stroke={CHART_THEME.technicians.color}
                name={CHART_THEME.technicians.label}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="doctors"
                stroke={CHART_THEME.doctors.color}
                name={CHART_THEME.doctors.label}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="text-center text-muted-foreground pt-16 pb-16">
            No forecast data available for this time window.
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Based on scheduled tasks and sync protocol configurations for each day in this window.
      </p>
    </div>
  );
};

export default WorkforceForecastChart;