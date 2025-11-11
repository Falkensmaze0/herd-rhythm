import React, { useState, useEffect } from 'react';
import { Reminder, Cow, SyncMethod } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ReminderService } from '../../services/ReminderService';
import ReminderDetailModal from './ReminderDetailModal';

interface ReminderCalendarProps {
  reminders: Reminder[];
  cows?: Cow[];
  syncMethods?: SyncMethod[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onCompleteReminder?: (id: string) => void;
  today: Date;
  availableYears: number[];
}

const ReminderCalendar: React.FC<ReminderCalendarProps> = ({ 
  reminders, 
  cows = [],
  syncMethods = [],
  currentDate, 
  onDateChange, 
  onCompleteReminder,
  today,
  availableYears 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarReminders, setCalendarReminders] = useState<Reminder[]>([]);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  
  // Map priority to palette tokens for global theme reactivity
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-[hsl(var(--priority-high))]';
      case 'medium':
        return 'bg-[hsl(var(--priority-medium))]';
      case 'low':
        return 'bg-[hsl(var(--priority-low))]';
      default:
        return 'bg-[hsl(var(--priority-default))]';
    }
  };

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

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    onDateChange(day);
  };

  const handleCompleteReminder = (id: string) => {
    const reminder = calendarReminders.find(r => r.id === id);
    if (!reminder) return;

    // Prevent completing future tasks
    if (new Date(reminder.dueDate) > today) {
      alert('Cannot complete future tasks');
      return;
    }

    if (onCompleteReminder) {
      onCompleteReminder(id);
      ReminderService.completeReminder(id);
      // Update local state
      setCalendarReminders(ReminderService.getAllReminders());
    }
  };

  const getSelectedDateReminders = () => {
    return selectedDate ? getRemindersForDate(selectedDate) : [];
  };

  const selectedDateReminders = getSelectedDateReminders();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 vet-card bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Reminder Calendar</h3>
          <div className="flex space-x-4">
            <select
              className="px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              value={format(currentDate, 'MM')}
              onChange={(e) => {
                const newDate = new Date(currentDate);
                newDate.setMonth(parseInt(e.target.value) - 1);
                onDateChange(newDate);
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month.toString().padStart(2, '0')}>
                  {format(new Date(2025, month - 1), 'MMMM')}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              value={format(currentDate, 'yyyy')}
              onChange={(e) => {
                const newDate = new Date(currentDate);
                newDate.setFullYear(parseInt(e.target.value));
                onDateChange(newDate);
              }}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-[hsl(var(--muted-foreground))]">
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
      className={[
        "p-2 min-h-20 border border-[hsl(var(--border))] cursor-pointer transition-colors",
        isCurrentDay ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary-dark))] shadow-lg ring-2 ring-[hsl(var(--primary-light))]" : "",
        isSelected ? "bg-[hsl(var(--primary-light))] border-[hsl(var(--primary))]" : "",
        "hover:bg-[hsl(var(--hover))]"
      ].join(" ")}
      onClick={() => handleDayClick(day)}
    >
      <div className={`text-sm font-medium ${
        isCurrentDay
          ? "text-[hsl(var(--primary))]"
          : isSelected
          ? "text-[hsl(var(--primary-dark))]"
          : "text-[hsl(var(--foreground))]"
      }`}>
        {format(day, "d")}
      </div>
      <div className="space-y-1 mt-1">
        {dayReminders.slice(0, 2).map(reminder => (
          <div
            key={reminder.id}
            className={[
              "text-xs",
              "p-1",
              "rounded",
              "text-[hsl(var(--card-foreground))]",
              getPriorityColor(reminder.priority)
            ].join(" ")}
            title={reminder.title}
          >
            {reminder.title.substring(0, 10)}...
          </div>
        ))}
        {dayReminders.length > 2 && (
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            +{dayReminders.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
})}
        </div>
      </div>

      <div className="vet-card bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] shadow">
        <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">
          {selectedDate ? `Tasks for ${format(selectedDate, 'MMMM d, yyyy')}` : 'Select a date'}
        </h3>
        
        {selectedDate ? (
          <div className="space-y-3">
            {selectedDateReminders.length > 0 ? (
              selectedDateReminders.map(reminder => (
                <div
                  key={reminder.id}
                  className="p-3 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--hover))] cursor-pointer"
                  onClick={() => setSelectedReminder(reminder)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-[hsl(var(--foreground))]">{reminder.title}</h4>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{reminder.description}</p>
                      <div className="mt-2 flex items-center space-x-3">
                        <span className={`inline-block w-2 h-2 rounded-full ${getPriorityColor(reminder.priority)}`}></span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase">{reminder.priority} priority</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase">{reminder.type}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {!reminder.completed && onCompleteReminder && (
                        <button
                          className="text-xs bg-[hsl(var(--success))] text-[hsl(var(--card-foreground))] px-2 py-1 rounded hover:bg-[hsl(var(--success-dark))]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteReminder(reminder.id);
                          }}
                        >
                          Complete
                        </button>
                      )}
                      {reminder.completed && (
                        <span className="text-xs text-[hsl(var(--success))] font-medium">✓ Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[hsl(var(--muted-foreground))] text-center py-8">No tasks scheduled for this date</p>
            )}
          </div>
        ) : (
          <p className="text-[hsl(var(--muted-foreground))] text-center py-8">Click on a calendar day to view tasks</p>
        )}
      </div>

      {selectedReminder && (
        <ReminderDetailModal
          reminder={selectedReminder}
          cow={cows?.find(c => c.id === selectedReminder.cowId)}
          syncMethod={syncMethods?.find(m => m.id === selectedReminder.syncMethodId)}
          isOpen={!!selectedReminder}
          onClose={() => setSelectedReminder(null)}
          onComplete={onCompleteReminder}
        />
      )}
    </div>
  );
};

export default ReminderCalendar;

