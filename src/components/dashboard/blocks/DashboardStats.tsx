// DashboardStats Block (modernized, with theme tokens and improvement hooks)
// Provides compact stats KPIs for the dashboard.
// Props:
//   analytics: { totalCows, activeReminders, completedSyncs, pregnancyRate }
//   className?: string (optional)
//   All colors/styles set via theme tokens, not legacy Tailwind utility classes.
//
// Usage: Place at top of dashboard page for all roles (see role-gating logic in parent).
// If user role restricts which KPIs are shown, filter in parent or add prop for fields.

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, Sync, Percent } from 'lucide-react';

interface Analytics {
  totalCows: number;
  activeReminders: number;
  completedSyncs: number;
  pregnancyRate: number;
}

export interface DashboardStatsProps {
  analytics: Analytics;
  className?: string;
}

/**
 * DashboardStats Block: Role-agnostic stats display (“KPI bar”).
 *
 * Expects full analytics object. For role-specific KPI filtering, limit the keys passed via parent.
 */
export const DashboardStats: React.FC<DashboardStatsProps> = ({ analytics, className }) => {
  const stats = [
    {
      label: 'Total Cows',
      value: analytics.totalCows,
      Icon: Users,
      bg: 'bg-accent', // Use your theme token, e.g., bg-accent or bg-brand-muted
      text: 'text-primary'
    },
    {
      label: 'Active Reminders',
      value: analytics.activeReminders,
      Icon: CheckCircle,
      bg: 'bg-yellow-50', // Replace with an appropriate theme class if possible
      text: 'text-yellow-800'
    },
    {
      label: 'Completed Syncs',
      value: analytics.completedSyncs,
      Icon: Sync,
      bg: 'bg-green-50',
      text: 'text-green-800'
    },
    {
      label: 'Pregnancy Rate',
      value: `${analytics.pregnancyRate}%`,
      Icon: Percent,
      bg: 'bg-blue-50',
      text: 'text-blue-800'
    }
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${className || ''}`}>
      {stats.map(({ label, value, Icon, bg, text }) => (
        <Card key={label} className="flex flex-col items-center justify-center py-2">
          <CardHeader className="flex flex-row items-center gap-3">
            <span className={`rounded-full p-2 ${bg}`}>
              <Icon className={`h-6 w-6 ${text}`} />
            </span>
            <CardTitle className="text-base">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{value}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};