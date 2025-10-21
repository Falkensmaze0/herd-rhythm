
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

import WorkforceForecast from './WorkforceForecast';

import { startOfMonth, format, isWithinInterval, subMonths } from 'date-fns';
import { Reminder, Cow, SyncMethod } from '../../types';

interface AnalyticsChartsProps {
  reminders: Reminder[];
  cows: Cow[];
  syncMethods: SyncMethod[];
}

interface ChartData {
  month: string;
  rate: number;
}

interface ProtocolUsage {
  name: string;
  value: number;
  color: string;
}

interface ComplianceData {
  day: string;
  compliance: number;
  totalTasks: number;
  completedTasks: number;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ reminders, cows, syncMethods }) => {
  const calculatePregnancyRates = (): ChartData[] => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    const months: ChartData[] = [];

    for (let i = 0; i <= 6; i++) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthCows = cows.filter(cow => {
        const lastSyncDate = new Date(cow.lastSyncDate);
        return isWithinInterval(lastSyncDate, {
          start: monthStart,
          end: subMonths(monthStart, -1)
        });
      });
      
      const pregnantCows = monthCows.filter(cow => cow.status === 'pregnant').length;
      const rate = monthCows.length ? (pregnantCows / monthCows.length) * 100 : 0;
      
      months.unshift({
        month: format(monthStart, 'MMM yy'),
        rate: Math.round(rate)
      });
    }
    return months;
  };

  const calculateProtocolUsage = (): ProtocolUsage[] => {
    const usage = syncMethods.map(method => ({
      name: method.name,
      value: reminders.filter(r => r.syncMethodId === method.id).length,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
    }));
    return usage.filter(u => u.value > 0);
  };

  const calculateComplianceRate = (): ComplianceData[] => {
    const now = new Date();
    const lastWeek = Array.from({ length: 7 }, (_, i) => {
      const date = subMonths(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Get all tasks due on this day
      const dueTasks = reminders.filter(r => format(new Date(r.dueDate), 'yyyy-MM-dd') === dateStr);
      const totalTasks = dueTasks.length;
      
      // Get completed tasks that were due on this day
      const completedTasks = dueTasks.filter(r => r.completed).length;
      
      // Calculate compliance rate
      const rate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
      
      return {
        day: format(date, 'EEE'),
        compliance: Math.round(rate),
        totalTasks,
        completedTasks
      };
    });
    return lastWeek.reverse();
  };

  const pregnancyRateData = calculatePregnancyRates();
  const protocolUsageData = calculateProtocolUsage();
  const complianceData = calculateComplianceRate();
  return (
    <div className="space-y-8">
      <div className="vet-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pregnancy Rate Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pregnancyRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Pregnancy Rate']} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#1e40af" 
                strokeWidth={3}
                dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <WorkforceForecast 
        reminders={reminders}
        cows={cows}
        syncMethods={syncMethods}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="vet-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Usage Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolUsageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={300}
                >
                  {protocolUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="vet-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Compliance Rate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ComplianceData;
                      return (
                        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                          <p className="font-medium">{data.day}</p>
                          <p className="text-sm text-gray-600">Compliance: {data.compliance}%</p>
                          <p className="text-sm text-gray-600">
                            Tasks: {data.completedTasks}/{data.totalTasks}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="compliance" 
                  fill="#16a34a" 
                  animationDuration={300}
                  label={{
                    position: 'top',
                    content: (props: { value: number }) => `${props.value}%`,
                    fontSize: 12
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
