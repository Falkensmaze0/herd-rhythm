
import React, { useState } from 'react';
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
import { mockCows, mockReminders, predefinedSyncMethods, mockAnalytics } from '../data/mockData';
import { Cow, SyncMethod, Reminder } from '../types';
import { ReminderService } from '../services/ReminderService';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [cows, setCows] = useState(mockCows);
  const [reminders, setReminders] = useState(mockReminders);
  const [syncMethods, setSyncMethods] = useState(predefinedSyncMethods);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [showCowForm, setShowCowForm] = useState(false);
  const [editingSyncMethod, setEditingSyncMethod] = useState<SyncMethod | null>(null);
  const [showSyncMethodForm, setShowSyncMethodForm] = useState(false);
  const [workforceSetupMethod, setWorkforceSetupMethod] = useState<SyncMethod | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleCompleteReminder = (id: string) => {
    setReminders(prev => {
      const updated = prev.map(reminder => 
        reminder.id === id ? { ...reminder, completed: true } : reminder
      );
      // Update ReminderService with new data
      ReminderService.updateReminders(updated);
      return updated;
    });
    console.log(`Reminder ${id} marked as completed`);
  };

  const handleSaveCow = (cowData: Omit<Cow, 'id' | 'reminders'>) => {
    if (editingCow) {
      setCows(prev => prev.map(cow => 
        cow.id === editingCow.id 
          ? { ...cow, ...cowData }
          : cow
      ));
      console.log('Cow updated:', cowData);
    } else {
      const newCow: Cow = {
        ...cowData,
        id: Date.now().toString(),
        reminders: []
      };
      setCows(prev => [...prev, newCow]);
      console.log('New cow added:', newCow);
    }
    setShowCowForm(false);
    setEditingCow(null);
  };

  const handleSaveSyncMethod = (methodData: Omit<SyncMethod, 'id'>) => {
    if (editingSyncMethod) {
      setSyncMethods(prev => prev.map(method => 
        method.id === editingSyncMethod.id 
          ? { ...method, ...methodData }
          : method
      ));
      console.log('Sync method updated:', methodData);
    } else {
      const newMethod: SyncMethod = {
        ...methodData,
        id: Date.now().toString()
      };
      setSyncMethods(prev => [...prev, newMethod]);
      console.log('New sync method created:', newMethod);
    }
    setShowSyncMethodForm(false);
    setEditingSyncMethod(null);
  };

  const handleSaveWorkforceSetup = (method: SyncMethod) => {
    setSyncMethods(prev => prev.map(m => 
      m.id === method.id ? method : m
    ));
    setWorkforceSetupMethod(null);
    console.log('Workforce setup saved for method:', method.name);
  };

  const handleDeleteSyncMethod = (id: string) => {
    setSyncMethods(prev => prev.filter(method => method.id !== id));
    console.log('Sync method deleted:', id);
  };

  const handleSelectSyncMethod = (method: SyncMethod) => {
    console.log('Selected sync method for application:', method);
    alert(`Protocol "${method.name}" selected. This would open a dialog to apply to selected cows.`);
  };

  const renderContent = () => {
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
            <DashboardStats analytics={mockAnalytics} />
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
