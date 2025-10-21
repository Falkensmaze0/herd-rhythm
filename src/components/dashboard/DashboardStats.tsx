
import React from 'react';
import { Analytics } from '../../types';

interface DashboardStatsProps {
  analytics: Analytics;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ analytics }) => {
  const stats = [
    {
      title: 'Total Cows',
      value: analytics.totalCows,
      icon: '🐄',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Active Reminders',
      value: analytics.activeReminders,
      icon: '⏰',
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      title: 'Completed Syncs',
      value: analytics.completedSyncs,
      icon: '✅',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Pregnancy Rate',
      value: `${analytics.pregnancyRate.toFixed(2)}%`,
      icon: '📊',
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="vet-card animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
