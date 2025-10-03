
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ReminderService, WorkforceForecast as WorkforceForecastType } from '../../services/ReminderService';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface WorkforceForecastProps {
  reminders: any[];
  cows: any[];
  syncMethods: any[];
}

const WorkforceForecast: React.FC<WorkforceForecastProps> = ({ reminders, cows, syncMethods }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDay, setSelectedDay] = useState<WorkforceForecastType | null>(null);

  // Initialize ReminderService and generate forecast
  ReminderService.initialize(reminders, cows, syncMethods);
  const forecastData = ReminderService.generateWorkforceForecast(14);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dayData = forecastData.find(d => d.date === label);
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value} personnel
            </p>
          ))}
          {dayData && dayData.taskBreakdown.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600 font-medium mb-1">Tasks:</p>
              {dayData.taskBreakdown.map((task, idx) => (
                <p key={idx} className="text-xs text-gray-500">
                  {task.task}: {task.cowCount} cows
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleDayClick = (data: any) => {
    const dayData = forecastData.find(d => d.date === data.date);
    setSelectedDay(dayData || null);
  };

  return (
    <div className="vet-card">
      <div 
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Workforce Forecast (Next 14 Days)</h3>
          <div className="group relative">
            <Info size={16} className="text-gray-400 hover:text-gray-600" />
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
              Shows estimated personnel needed based on scheduled tasks. Click on data points for daily breakdown.
            </div>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={forecastData}
                onClick={handleDayClick}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="workers" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  name="Workers"
                  dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="technicians" 
                  stroke="#1e40af" 
                  strokeWidth={2}
                  name="Technicians"
                  dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="doctors" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="Doctors"
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {selectedDay && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Detailed Breakdown for {selectedDay.date}</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedDay.workers}</p>
                  <p className="text-sm text-gray-600">Workers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedDay.technicians}</p>
                  <p className="text-sm text-gray-600">Technicians</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{selectedDay.doctors}</p>
                  <p className="text-sm text-gray-600">Doctors</p>
                </div>
              </div>
              {selectedDay.taskBreakdown.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 mb-2">Scheduled Tasks:</p>
                  <div className="space-y-2">
                    {selectedDay.taskBreakdown.map((task, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                        <span className="text-sm text-gray-700">{task.task}</span>
                        <div className="flex space-x-4 text-xs text-gray-500">
                          <span>{task.cowCount} cows</span>
                          <span>
                            W:{task.workforceNeeded.workers || 0} 
                            T:{task.workforceNeeded.technicians || 0} 
                            D:{task.workforceNeeded.doctors || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkforceForecast;
