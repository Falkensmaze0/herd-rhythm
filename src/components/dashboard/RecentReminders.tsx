
import React, { useState, useEffect } from 'react';
import { Reminder } from '../../types';
import { format } from 'date-fns';
import ReminderDetails from './ReminderDetails';
import { ReminderService } from '../../services/ReminderService';

interface RecentRemindersProps {
  reminders: Reminder[];
  cows?: any[];
  syncMethods?: any[];
  onCompleteReminder: (id: string) => void;
}

interface GroupedReminder {
  task: string;
  type: string;
  priority: string;
  dueDate: string;
  reminderIds: string[];
  cowCount: number;
}

const RecentReminders: React.FC<RecentRemindersProps> = ({ 
  reminders, 
  cows = [], 
  syncMethods = [], 
  onCompleteReminder 
}) => {
  const [selectedReminder, setSelectedReminder] = useState<GroupedReminder | null>(null);
  const [todaysReminders, setTodaysReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    // Initialize ReminderService and get today's reminders
    ReminderService.initialize(reminders, cows, syncMethods);
    const today = ReminderService.getTodaysReminders();
    setTodaysReminders(today);
  }, [reminders, cows, syncMethods]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'injection': return '💉';
      case 'checkup': return '🔍';
      case 'ai': return '🧬';
      case 'custom': return '📝';
      default: return '📋';
    }
  };

  // Group reminders by task, type, priority, and date using ReminderService data
  const groupedReminders = todaysReminders
    .filter(r => !r.completed)
    .reduce((groups: GroupedReminder[], reminder) => {
      const key = `${reminder.title}-${reminder.type}-${reminder.priority}-${reminder.dueDate}`;
      const existingGroup = groups.find(g => 
        g.task === reminder.title && 
        g.type === reminder.type && 
        g.priority === reminder.priority && 
        g.dueDate === reminder.dueDate
      );

      if (existingGroup) {
        existingGroup.reminderIds.push(reminder.id);
        existingGroup.cowCount++;
      } else {
        groups.push({
          task: reminder.title,
          type: reminder.type,
          priority: reminder.priority,
          dueDate: reminder.dueDate,
          reminderIds: [reminder.id],
          cowCount: 1
        });
      }

      return groups;
    }, [])
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleReminderClick = (groupedReminder: GroupedReminder) => {
    setSelectedReminder(groupedReminder);
  };

  const handleCompleteAll = (reminderIds: string[]) => {
    reminderIds.forEach(id => {
      onCompleteReminder(id);
      ReminderService.completeReminder(id);
    });
    setSelectedReminder(null);
    // Refresh today's reminders
    const updated = ReminderService.getTodaysReminders();
    setTodaysReminders(updated);
  };

  const handleCompleteIndividual = (id: string) => {
    onCompleteReminder(id);
    ReminderService.completeReminder(id);
    // Refresh today's reminders
    const updated = ReminderService.getTodaysReminders();
    setTodaysReminders(updated);
  };

  if (selectedReminder) {
    return (
      <ReminderDetails
        groupedReminder={selectedReminder}
        reminders={todaysReminders.filter(r => selectedReminder.reminderIds.includes(r.id))}
        onBack={() => setSelectedReminder(null)}
        onCompleteAll={handleCompleteAll}
        onCompleteIndividual={handleCompleteIndividual}
      />
    );
  }

  return (
    <div className="vet-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Reminders</h3>
      {groupedReminders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reminders for today</p>
      ) : (
        <div className="space-y-3">
          {groupedReminders.map((groupedReminder, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleReminderClick(groupedReminder)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getTypeIcon(groupedReminder.type)}</span>
                <div>
                  <p className="font-medium text-gray-900">{groupedReminder.task}</p>
                  <p className="text-sm text-gray-600">
                    {groupedReminder.cowCount} cow{groupedReminder.cowCount > 1 ? 's' : ''} due
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(groupedReminder.priority)}`}>
                      {groupedReminder.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      Due: {format(new Date(groupedReminder.dueDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {groupedReminder.cowCount} cow{groupedReminder.cowCount > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500">Click to view</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentReminders;
