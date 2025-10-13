
import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'reminders', label: 'Cow Reminders', icon: '⏰' },
  { id: 'sync-methods', label: 'Sync Methods', icon: '🔬' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-vet-blue">CattleSync Pro</h1>
        <p className="text-sm text-gray-600 mt-1">Veterinary Management</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200",
                  activeSection === item.id
                    ? "bg-vet-blue text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-vet-blue rounded-full flex items-center justify-center text-white font-semibold">
            VT
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Vet Technician</p>
            <p className="text-xs text-gray-500">technician@farm.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
