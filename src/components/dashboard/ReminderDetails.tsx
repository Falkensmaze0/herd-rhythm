
import React from 'react';
import { Reminder } from '../../types';
import { format } from 'date-fns';

interface GroupedReminder {
  task: string;
  type: string;
  priority: string;
  dueDate: string;
  reminderIds: string[];
  cowCount: number;
}

interface ReminderDetailsProps {
  groupedReminder: GroupedReminder;
  reminders: Reminder[];
  onBack: () => void;
  onCompleteAll: (reminderIds: string[]) => void;
  onCompleteIndividual: (id: string) => void;
}

const ReminderDetails: React.FC<ReminderDetailsProps> = ({
  groupedReminder,
  reminders,
  onBack,
  onCompleteAll,
  onCompleteIndividual
}) => {
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

  return (
    <div className="vet-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back
          </button>
          <span className="text-xl">{getTypeIcon(groupedReminder.type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{groupedReminder.task}</h3>
            <p className="text-sm text-gray-600">
              {groupedReminder.cowCount} cow{groupedReminder.cowCount > 1 ? 's' : ''} due on {format(new Date(groupedReminder.dueDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(groupedReminder.priority)}`}>
            {groupedReminder.priority}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Cow ID: {reminder.cowId}</p>
              <p className="text-sm text-gray-600">{reminder.description}</p>
            </div>
            <button
              onClick={() => onCompleteIndividual(reminder.id)}
              className="vet-button-primary text-sm"
            >
              Complete
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="vet-button-secondary"
        >
          Back to Overview
        </button>
        <button
          onClick={() => onCompleteAll(groupedReminder.reminderIds)}
          className="vet-button-primary"
        >
          Complete All ({groupedReminder.cowCount})
        </button>
      </div>
    </div>
  );
};

export default ReminderDetails;
