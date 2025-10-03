
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { pregnancyRateData, protocolUsageData, complianceData } from '../../data/mockData';
import WorkforceForecast from './WorkforceForecast';

interface AnalyticsChartsProps {
  reminders?: any[];
  cows?: any[];
  syncMethods?: any[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ 
  reminders = [], 
  cows = [], 
  syncMethods = [] 
}) => {
  return (
    <div className="space-y-8">
      <div className="vet-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pregnancy Rate Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pregnancyRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[60, 90]} />
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
                <YAxis domain={[80, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Compliance']} />
                <Bar dataKey="compliance" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
