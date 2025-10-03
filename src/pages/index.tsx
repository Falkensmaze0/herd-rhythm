
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../components/layout/Sidebar';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentReminders from '../components/dashboard/RecentReminders';
import CowList from '../components/cows/CowList';
import CowForm from '../components/cows/CowForm';
import SyncMethodList from '../components/sync/SyncMethodList';
import SyncMethodForm from '../components/sync/SyncMethodForm';
import WorkforceSetup from '../components/sync/WorkforceSetup';
import AnalyticsCharts from '../components/analytics/AnalyticsCharts';
import ReminderCalendar from '../components/reminders/ReminderCalendar';
import { Cow, SyncMethod, Reminder, Analytics } from '../types';
import { ReminderService } from '../services/ReminderService';

const Index = () => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [cows, setCows] = useState<Cow[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [syncMethods, setSyncMethods] = useState<SyncMethod[]>([]);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [showCowForm, setShowCowForm] = useState(false);
  const [editingSyncMethod, setEditingSyncMethod] = useState<SyncMethod | null>(null);
  const [showSyncMethodForm, setShowSyncMethodForm] = useState(false);
  const [workforceSetupMethod, setWorkforceSetupMethod] = useState<SyncMethod | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetcher = useCallback(async <T,>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request to ${url} failed`);
    }
    return response.json() as Promise<T>;
  }, []);

  const cowsQuery = useQuery<Cow[]>({
    queryKey: ['cows'],
    queryFn: () => fetcher<Cow[]>('/api/cows'),
  });

  const remindersQuery = useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: () => fetcher<Reminder[]>('/api/reminders'),
  });

  const syncMethodsQuery = useQuery<SyncMethod[]>({
    queryKey: ['sync-methods'],
    queryFn: () => fetcher<SyncMethod[]>('/api/sync-methods'),
  });

  const analyticsQuery = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: () => fetcher<Analytics>('/api/analytics'),
  });

  useEffect(() => {
    if (cowsQuery.data) {
      setCows(cowsQuery.data);
    }
  }, [cowsQuery.data]);

  useEffect(() => {
    if (remindersQuery.data) {
      setReminders(remindersQuery.data);
    }
  }, [remindersQuery.data]);

  useEffect(() => {
    if (syncMethodsQuery.data) {
      setSyncMethods(syncMethodsQuery.data);
    }
  }, [syncMethodsQuery.data]);

  useEffect(() => {
    ReminderService.initialize(reminders, cows, syncMethods);
  }, [reminders, cows, syncMethods]);

  useEffect(() => {
    if (!selectedCow) {
      return;
    }

    const updated = cows.find((cow) => cow.id === selectedCow.id);
    if (updated && updated !== selectedCow) {
      setSelectedCow(updated);
    }
  }, [cows, selectedCow]);

  const isLoading = cowsQuery.isLoading || remindersQuery.isLoading || syncMethodsQuery.isLoading;
  const loadError =
    (cowsQuery.error as Error | undefined) ||
    (remindersQuery.error as Error | undefined) ||
    (syncMethodsQuery.error as Error | undefined);

  const analyticsData = useMemo<Analytics>(() => ({
    totalCows: analyticsQuery.data?.totalCows ?? 0,
    activeReminders: analyticsQuery.data?.activeReminders ?? 0,
    completedSyncs: analyticsQuery.data?.completedSyncs ?? 0,
    pregnancyRate: analyticsQuery.data?.pregnancyRate ?? 0,
    complianceRate: analyticsQuery.data?.complianceRate ?? 0,
  }), [analyticsQuery.data]);

  const handleCompleteReminder = async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
      });

      setReminders(prev => {
        const updated = prev.map(reminder =>
          reminder.id === id ? { ...reminder, completed: true } : reminder
        );
        ReminderService.updateReminders(updated);
        return updated;
      });

      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    } catch (error) {
      console.error('Failed to complete reminder', error);
    }
  };

  const handleSaveCow = async (cowData: Omit<Cow, 'id' | 'reminders'>) => {
    try {
      if (editingCow) {
        const response = await fetch(`/api/cows/${editingCow.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cowData),
        });
        const updatedCow: Cow = await response.json();
        setCows(prev => prev.map(cow => (cow.id === updatedCow.id ? updatedCow : cow)));
        setSelectedCow(prev => (prev && prev.id === updatedCow.id ? updatedCow : prev));
      } else {
        const response = await fetch('/api/cows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cowData),
        });
        const newCow: Cow = await response.json();
        setCows(prev => [...prev, newCow]);
      }

      queryClient.invalidateQueries({ queryKey: ['cows'] });
      setShowCowForm(false);
      setEditingCow(null);
    } catch (error) {
      console.error('Failed to save cow', error);
    }
  };

  const handleSaveSyncMethod = async (methodData: Omit<SyncMethod, 'id'>) => {
    try {
      if (editingSyncMethod) {
        const response = await fetch(`/api/sync-methods/${editingSyncMethod.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(methodData),
        });
        const updatedMethod: SyncMethod = await response.json();
        setSyncMethods(prev => prev.map(method => (method.id === updatedMethod.id ? updatedMethod : method)));
      } else {
        const response = await fetch('/api/sync-methods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(methodData),
        });
        const newMethod: SyncMethod = await response.json();
        setSyncMethods(prev => [...prev, newMethod]);
      }

      queryClient.invalidateQueries({ queryKey: ['sync-methods'] });
      setShowSyncMethodForm(false);
      setEditingSyncMethod(null);
    } catch (error) {
      console.error('Failed to save synchronization method', error);
    }
  };

  const handleSaveWorkforceSetup = async (method: SyncMethod) => {
    try {
      const response = await fetch(`/api/sync-methods/${method.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: method.name,
          description: method.description,
          duration: method.duration,
          isCustom: method.isCustom,
          hasWorkforceSettings: method.hasWorkforceSettings,
          steps: method.steps,
        }),
      });

      const updatedMethod: SyncMethod = await response.json();
      setSyncMethods(prev => prev.map(m => (m.id === updatedMethod.id ? updatedMethod : m)));
      setWorkforceSetupMethod(null);
      queryClient.invalidateQueries({ queryKey: ['sync-methods'] });
    } catch (error) {
      console.error('Failed to save workforce setup', error);
    }
  };

  const handleDeleteSyncMethod = async (id: string) => {
    try {
      await fetch(`/api/sync-methods/${id}`, {
        method: 'DELETE',
      });
      setSyncMethods(prev => prev.filter(method => method.id !== id));
      queryClient.invalidateQueries({ queryKey: ['sync-methods'] });
    } catch (error) {
      console.error('Failed to delete sync method', error);
    }
  };

  const handleSelectSyncMethod = (method: SyncMethod) => {
    alert(`Protocol "${method.name}" selected. This would open a dialog to apply to selected cows.`);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="vet-card">
          <p className="text-gray-600">Loading herd data...</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="vet-card">
          <p className="text-red-600">{loadError.message || 'Unable to load herd data.'}</p>
        </div>
      );
    }

    if (showCowForm) {
      return (
        <CowForm
          cow={editingCow || undefined}
          onSave={handleSaveCow}
          onCancel={() => {
            setShowCowForm(false);
            setEditingCow(null);
          }}
        />
      );
    }

    if (showSyncMethodForm) {
      return (
        <SyncMethodForm
          method={editingSyncMethod || undefined}
          onSave={handleSaveSyncMethod}
          onCancel={() => {
            setShowSyncMethodForm(false);
            setEditingSyncMethod(null);
          }}
        />
      );
    }

    if (workforceSetupMethod) {
      return (
        <WorkforceSetup
          method={workforceSetupMethod}
          onSave={handleSaveWorkforceSetup}
          onCancel={() => setWorkforceSetupMethod(null)}
        />
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Overview of your cattle synchronization management</p>
            </div>
            <DashboardStats analytics={analyticsData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentReminders
                reminders={reminders}
                cows={cows}
                syncMethods={syncMethods}
                onCompleteReminder={handleCompleteReminder}
              />
              <div className="vet-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCowForm(true)}
                    className="w-full vet-button-primary text-left"
                  >
                    Add New Cow
                  </button>
                  <button
                    onClick={() => setActiveSection('sync-methods')}
                    className="w-full vet-button-secondary text-left"
                  >
                    View Sync Methods
                  </button>
                  <button
                    onClick={() => setActiveSection('analytics')}
                    className="w-full vet-button-secondary text-left"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reminders':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cow Reminders</h1>
              <p className="text-gray-600">Manage individual cow reminders and schedules</p>
            </div>
            <ReminderCalendar
              reminders={reminders}
              cows={cows}
              syncMethods={syncMethods}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onCompleteReminder={handleCompleteReminder}
            />
          </div>
        );

      case 'sync-methods':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Synchronization Methods</h1>
              <p className="text-gray-600">Manage predefined and custom synchronization protocols</p>
            </div>
            <SyncMethodList
              methods={syncMethods}
              onSelectMethod={handleSelectSyncMethod}
              onEditMethod={(method) => {
                setEditingSyncMethod(method);
                setShowSyncMethodForm(true);
              }}
              onDeleteMethod={handleDeleteSyncMethod}
              onCreateNew={() => setShowSyncMethodForm(true)}
              onWorkforceSetup={(method) => setWorkforceSetupMethod(method)}
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">Track performance and trends in your synchronization program</p>
            </div>
            <AnalyticsCharts 
              reminders={reminders}
              cows={cows}
              syncMethods={syncMethods}
            />
          </div>
        );

      case 'settings':
        return (
          <div className="vet-card">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600 mb-8">Configure your CattleSync Pro application</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notification Preferences</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Email reminders for upcoming tasks
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    SMS notifications for high-priority reminders
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Weekly summary reports
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Default Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Reminder Lead Time
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>1 day before</option>
                      <option>2 days before</option>
                      <option>3 days before</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Synchronization Method
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Ovsynch</option>
                      <option>CIDR Protocol</option>
                      <option>Select Synch</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
