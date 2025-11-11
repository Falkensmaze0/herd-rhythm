// Refactored: ManagerDashboard now uses modular "blocks" (DashboardStats, RecentReminders, ReminderDetails),
// role-based rendering via AuthContext and roleConfig, and modern modal/dialog state.
//
// Features:
// - Handles analytics, reminders, cows, syncMethods fetch/load
// - Shows DashboardStats, RecentReminders, opens ReminderDetails as modal on reminder group click
// - Robust completion callbacks, refetch after completion
// - Role-based UI gating (manager, admin see completion actions; others get view-only)
// - Clean state, callback, and modal wiring
//
// TODO: (optionally) Generalize for other high-level dashboard roles if needed

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats } from '@/components/dashboard/blocks/DashboardStats';
import { RecentReminders } from '@/components/dashboard/blocks/RecentReminders';
import { ReminderDetails } from '@/components/dashboard/blocks/ReminderDetails';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getRoleConfig } from '@/config/roleConfig';
import WorkforceForecastChart from '@/components/dashboards/manager/WorkforceForecastChart';
import { RoleDashboardLayout } from './RoleDashboardLayout';
import { DashboardSkeleton } from './DashboardSkeleton';

import { Reminder, Cow, SyncMethod, User } from '@/types';
import type { ManagerAnalytics } from '@/types/manager';

// --- Types & Utility ---
type ReminderGroupKey = { groupType: string; groupPriority: string };

function groupReminders(reminders: Reminder[]) {
  // Same as in RecentReminders, but returns grouped object for modal lookup
  const groups: Record<string, Reminder[]> = {};
  reminders.forEach(rem => {
    const key = `${rem.type}-${rem.priority}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(rem);
  });
  return groups;
}

export const ManagerDashboard: React.FC = () => {
  console.log('ManagerDashboard: Component mounting');
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<ManagerAnalytics | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);
  const [syncMethods, setSyncMethods] = useState<SyncMethod[]>([]);
  const [windowParam, setWindowParam] = useState('1w');
  const [loading, setLoading] = useState(true);

  // --- Modal state for ReminderDetails ---
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsGroupKey, setDetailsGroupKey] = useState<null | string>(null);

  // --- Derived role logic ---
  const role = user?.role || 'manager';
  const roleConfig = getRoleConfig(role);
  const canCompleteReminders = ['manager', 'admin'].includes(role); // Or: check using roleConfig.permissions

  // --- Load dashboard "data lake" ---
  useEffect(() => {
    console.log('ManagerDashboard: Starting data fetch, windowParam:', windowParam);
    let active = true;
    async function fetchAll() {
      setLoading(true);
      try {
        // Analytics
        const analyticsRes = await fetch(`/api/manager/analytics?window=${windowParam}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
          }
        });
        const analyticsJson = analyticsRes.ok ? await analyticsRes.json() : null;
        if (active) setAnalyticsData(analyticsJson?.data || null);

        // Reminders
        const remindersRes = await fetch(`/api/reminders`);
        const remindersJson = remindersRes.ok ? await remindersRes.json() : null;
        if (active) setReminders(remindersJson?.data || []);

        // Cows (for enriching reminders etc.)
        const cowsRes = await fetch(`/api/cows`);
        const cowsJson = cowsRes.ok ? await cowsRes.json() : null;
        if (active) setCows(cowsJson?.data || []);

        // SyncMethods (optional, for reminder context)
        const smRes = await fetch(`/api/sync-methods`);
        const smJson = smRes.ok ? await smRes.json() : null;
        if (active) setSyncMethods(smJson?.data || []);
      } catch (e) {
        // TODO: real error reporting
        console.error('Load dashboard error', e);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchAll();
    return () => { active = false; };
  }, [windowParam]);

  // --- Modal open trigger (from RecentReminders click) ---
  const [reminderGroupCache, setReminderGroupCache] = useState<Record<string, Reminder[]>>({});
  useEffect(() => {
    setReminderGroupCache(groupReminders(reminders));
  }, [reminders]);

  const openReminderDetails = (groupKey: string) => {
    setDetailsGroupKey(groupKey);
    setDetailsOpen(true);
  };
  const closeReminderDetails = () => {
    setDetailsOpen(false);
    setDetailsGroupKey(null);
  };

  // --- Completion callbacks ---
  const handleCompleteReminder = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/reminders/${id}`, { method: 'PUT', body: JSON.stringify({ completed: true }) });
        await refreshReminders();
      } catch (e) { /* TODO: toast error */ }
    },
    []
  );
  const handleCompleteAll = useCallback(async () => {
    if (detailsGroupKey && reminderGroupCache[detailsGroupKey]) {
      await Promise.all(reminderGroupCache[detailsGroupKey].map(rem =>
        fetch(`/api/reminders/${rem.id}`, { method: 'PUT', body: JSON.stringify({ completed: true }) })
      ));
      await refreshReminders();
      closeReminderDetails();
    }
  }, [detailsGroupKey, reminderGroupCache]);

  async function refreshReminders() {
    // Only refresh reminders, not full analytics
    const remindersRes = await fetch(`/api/reminders`);
    const remindersJson = remindersRes.ok ? await remindersRes.json() : null;
    setReminders(remindersJson?.data || []);
  }

  // --- Picker for Analytics Window ---
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
      className="role-select ml-2"
      style={{ minWidth: 110 }}
    >
      {windowOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  // --- Loading State ---
  if (loading || !analyticsData) {
    return (
      <RoleDashboardLayout
        role="manager"
        title="Manager Command Surface"
        description="Synchronizing labor, reminders, and herd analytics."
        actions={<AnalyticsWindowSelector />}
      >
        <DashboardSkeleton />
      </RoleDashboardLayout>
    );
  }

  // --- Extract today's reminders (example) ---
  const today = new Date().toISOString().substr(0, 10);
  const todaysReminders = reminders.filter(r => r.dueDate.startsWith(today) && !r.completed);

  // --- Details group extraction for modal ---
  let modalDetails: JSX.Element | null = null;
  if (detailsGroupKey && reminderGroupCache[detailsGroupKey]) {
    const [groupType, groupPriority] = detailsGroupKey.split('-');
    modalDetails = (
      <ReminderDetails
        reminders={reminderGroupCache[detailsGroupKey]}
        cows={cows}
        groupType={groupType}
        groupPriority={groupPriority}
        onClose={closeReminderDetails}
        onCompleteReminder={canCompleteReminders ? handleCompleteReminder : () => {}}
        onCompleteAll={canCompleteReminders ? handleCompleteAll : () => {}}
      />
    );
  }

  const windowLabel =
    windowOptions.find((opt) => opt.value === windowParam)?.label ?? windowParam;
  const activeReminders = reminders.filter((reminder) => !reminder.completed).length;
  const highlights = [
    {
      label: 'Active reminders',
      value: activeReminders,
      hint: `${todaysReminders.length} due today`,
      tone: activeReminders > 12 ? 'warn' : 'default',
    },
    {
      label: 'Analytics window',
      value: windowLabel,
      hint: 'Rolling aggregation',
    },
    {
      label: 'Sync methods',
      value: syncMethods.length,
      hint: 'Connected protocols',
      tone: 'positive',
    },
  ];

  return (
    <RoleDashboardLayout
      role="manager"
      title="Manager Command Surface"
      description={`Welcome back, ${user?.name ?? 'team'}. Workforce, reminders, and herd vitals in one place.`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-amber-100 text-amber-700">
            Farm operations active
          </Badge>
          <AnalyticsWindowSelector />
        </div>
      }
      highlights={highlights}
    >
      <DashboardStats
        analytics={{
          totalCows: analyticsData.totalCows,
          activeReminders: analyticsData.activeReminders,
          completedSyncs: analyticsData.completedSyncs,
          pregnancyRate: analyticsData.pregnancyRate,
        }}
      />

      <Separator />

      <div className="role-grid mb-8">
        <WorkforceForecastChart forecast={analyticsData.workforceForecast || []} />
      </div>

      <RecentReminders
        reminders={todaysReminders}
        cows={cows}
        syncMethods={syncMethods}
        onCompleteReminder={canCompleteReminders ? handleCompleteReminder : () => {}}
        className="mb-6"
      />

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        {modalDetails}
      </Dialog>
    </RoleDashboardLayout>
  );
};
