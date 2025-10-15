
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardRouter } from '@/components/dashboards/DashboardRouter';
import { getRoleConfig } from '@/config/roleConfig';
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
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
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
  const [today] = useState(new Date());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Calculate available years from reminders
  useEffect(() => {
    if (reminders.length > 0) {
      const years = reminders.map(r => new Date(r.dueDate).getFullYear());
      const uniqueYears = Array.from(new Set(years));
      const currentYear = new Date().getFullYear();
      if (!uniqueYears.includes(currentYear)) {
        uniqueYears.push(currentYear);
      }
      setAvailableYears(uniqueYears.sort((a, b) => a - b));
    } else {
      setAvailableYears([new Date().getFullYear()]);
    }
  }, [reminders]);

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
    // Invalidate all related queries when data changes
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      queryClient.invalidateQueries({ queryKey: ['reminders'] }),
      queryClient.invalidateQueries({ queryKey: ['cows'] }),
      queryClient.invalidateQueries({ queryKey: ['sync-methods'] })
    ]);
  }, [reminders, cows, syncMethods, queryClient]);

  useEffect(() => {
    if (!selectedCow) {
      return;
    }

    const updated = cows.find((cow) => cow.id === selectedCow.id);
    if (updated && updated !== selectedCow) {
      setSelectedCow(updated);
    }
  }, [cows, selectedCow]);

  const dataLoading = cowsQuery.isLoading || remindersQuery.isLoading || syncMethodsQuery.isLoading;
  const loadError =
    (cowsQuery.error as Error | undefined) ||
    (remindersQuery.error as Error | undefined) ||
    (syncMethodsQuery.error as Error | undefined);

  const analyticsData = useMemo<Analytics>(() => ({
    // Calculate analytics based on current data
    totalCows: cows.length,
    activeReminders: reminders.filter(r => !r.completed).length,
    completedSyncs: reminders.filter(r => r.completed).length,
    pregnancyRate: cows.length ? (cows.filter(c => c.status === 'pregnant').length / cows.length) * 100 : 0,
    complianceRate: reminders.length ? (reminders.filter(r => r.completed).length / reminders.length) * 100 : 0
  }), [cows, reminders]);

  const handleCompleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    // Prevent completing future tasks
    if (new Date(reminder.dueDate) > today) {
      alert('Cannot complete future tasks');
      return;
    }
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

  const handleExportData = async () => {
    try {
      const data = {
        cows,
        reminders,
        syncMethods,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cattlesync-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportData = async (file: File | undefined) => {
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.cows || !data.reminders || !data.syncMethods) {
        throw new Error('Invalid data format');
      }

      // Update database through API
      await fetch('/api/import-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Update local state
      setCows(data.cows);
      setReminders(data.reminders);
      setSyncMethods(data.syncMethods);

      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cows'] }),
        queryClient.invalidateQueries({ queryKey: ['reminders'] }),
        queryClient.invalidateQueries({ queryKey: ['sync-methods'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] })
      ]);

      alert('Data imported successfully!');
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
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

  // Redirect to appropriate page based on authentication status
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show role-specific dashboard for authenticated users
  if (isAuthenticated && user && activeSection === 'dashboard') {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          <main className="flex-1 p-8 overflow-y-auto ml-64">
            <DashboardRouter />
          </main>
        </div>
      </AuthGuard>
    );
  }

  const renderContent = () => {
    if (dataLoading) {
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
              today={today}
              availableYears={availableYears}
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
              cows={cows}
              onSelectMethod={handleSelectSyncMethod}
              onEditMethod={(method) => {
                setEditingSyncMethod(method);
                setShowSyncMethodForm(true);
              }}
              onDeleteMethod={handleDeleteSyncMethod}
              onCreateNew={() => setShowSyncMethodForm(true)}
              onWorkforceSetup={(method) => setWorkforceSetupMethod(method)}
              setShowCowForm={setShowCowForm}
              onApplyProtocol={async (cow, syncMethod) => {
                try {
                  const startDate = new Date();
                  const newReminders = syncMethod.steps.map(step => ({
                    id: `${cow.id}-${step.id}-${Date.now()}`,
                    cowId: cow.id,
                    syncMethodId: syncMethod.id,
                    type: 'custom' as const,
                    title: step.title,
                    description: step.description,
                    dueDate: addDays(startDate, step.day).toISOString(),
                    completed: false,
                    priority: 'medium' as const,
                    syncStepId: step.id,
                    workforceSnapshot: {
                      workers: step.workforceRequirements?.worker_per_cows ? 1 : 0,
                      technicians: step.workforceRequirements?.technician_per_cows ? 1 : 0,
                      doctors: step.workforceRequirements?.doctor_per_cows ? 1 : 0
                    }
                  }));

                  // Create all reminders
                  await Promise.all(newReminders.map(reminder => 
                    fetch('/api/reminders', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(reminder),
                    })
                  ));

                  // Update cow's last sync date
                  await fetch(`/api/cows/${cow.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      lastSyncDate: startDate.toISOString(),
                      status: 'active'
                    }),
                  });
                  
                  // Update local state
                  setReminders(prev => [...prev, ...newReminders]);
                  setCows(prev => prev.map(c => 
                    c.id === cow.id 
                      ? { ...c, lastSyncDate: startDate.toISOString(), status: 'active' }
                      : c
                  ));

                  // Refresh all affected queries
                  await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['cows'] }),
                    queryClient.invalidateQueries({ queryKey: ['reminders'] }),
                    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
                    queryClient.invalidateQueries({ queryKey: ['sync-methods'] })
                  ]);
                } catch (error) {
                  console.error('Failed to apply protocol:', error);
                  throw error;
                }
              }}
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

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Control</h3>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleExportData()}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Export Data
                    </button>
                    <label className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors cursor-pointer">
                      Import Data
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => handleImportData(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Export your data for backup or import existing data from another system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading or redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 p-8 overflow-y-auto ml-64">
          {renderContent()}
        </main>
      </div>
    </AuthGuard>
  );
};

export default Index;
