
import React, { useState, useEffect } from 'react';
import { Reminder } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ReminderService } from '../../services/ReminderService';

interface ReminderCalendarProps {
  reminders: Reminder[];
  cows?: any[];
  syncMethods?: any[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onCompleteReminder?: (id: string) => void;
}

const ReminderCalendar: React.FC<ReminderCalendarProps> = ({ 
  reminders, 
  cows = [],
  syncMethods = [],
  currentDate, 
  onDateChange, 
  onCompleteReminder 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarReminders, setCalendarReminders] = useState<Reminder[]>([]);
  
  useEffect(() => {
    // Initialize ReminderService with consistent data
    ReminderService.initialize(reminders, cows, syncMethods);
    setCalendarReminders(ReminderService.getAllReminders());
  }, [reminders, cows, syncMethods]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getRemindersForDate = (date: Date) => {
    return calendarReminders.filter(reminder => 
      isSameDay(new Date(reminder.dueDate), date)
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    onDateChange(day);
  };

  const handleCompleteReminder = (id: string) => {
    if (onCompleteReminder) {
      onCompleteReminder(id);
      ReminderService.completeReminder(id);
      // Update local state
      setCalendarReminders(ReminderService.getAllReminders());
    }
  };

  const selectedDateReminders = selectedDate ? getRemindersForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 vet-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reminder Calendar - {format(currentDate, 'MMMM yyyy')}
        </h3>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dayReminders = getRemindersForDate(day);
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  p-2 min-h-20 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                  ${isCurrentDay ? 'bg-blue-50 border-blue-300' : ''}
                  ${isSelected ? 'bg-blue-100 border-blue-400' : ''}
                `}
                onClick={() => handleDayClick(day)}
              >
                <div className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1 mt-1">
                  {dayReminders.slice(0, 2).map(reminder => (
                    <div
                      key={reminder.id}
                      className={`text-xs p-1 rounded text-white ${getPriorityColor(reminder.priority)}`}
                      title={reminder.title}
                    >
                      {reminder.title.substring(0, 10)}...
                    </div>
                  ))}
                  {dayReminders.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayReminders.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="vet-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedDate ? `Tasks for ${format(selectedDate, 'MMMM d, yyyy')}` : 'Select a date'}
        </h3>
        
        {selectedDate ? (
          <div className="space-y-3">
            {selectedDateReminders.length > 0 ? (
              selectedDateReminders.map(reminder => (
                <div
                  key={reminder.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                      <div className="mt-2 flex items-center space-x-3">
                        <span className={`inline-block w-2 h-2 rounded-full ${getPriorityColor(reminder.priority)}`}></span>
                        <span className="text-xs text-gray-500 uppercase">{reminder.priority} priority</span>
                        <span className="text-xs text-gray-500 uppercase">{reminder.type}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {!reminder.completed && onCompleteReminder && (
                        <button
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteReminder(reminder.id);
                          }}
                        >
                          Complete
                        </button>
                      )}
                      {reminder.completed && (
                        <span className="text-xs text-green-600 font-medium">✓ Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks scheduled for this date</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Click on a calendar day to view tasks</p>
        )}
      </div>
    </div>
  );
};

export default ReminderCalendar;
