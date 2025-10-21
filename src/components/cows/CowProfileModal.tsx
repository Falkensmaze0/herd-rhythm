import React from 'react';
import { format } from 'date-fns';
import { X, Calendar, Activity, Tag, Clipboard, Bell } from 'lucide-react';
import { Cow, Reminder } from '../../types';

interface CowProfileModalProps {
  cow: Cow;
  isOpen: boolean;
  onClose: () => void;
  onSelectForProtocol?: () => void;
}

const CowProfileModal: React.FC<CowProfileModalProps> = ({
  cow,
  isOpen,
  onClose,
  onSelectForProtocol
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pregnant': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4" />;
      case 'pregnant': return <Calendar className="w-4 h-4" />;
      case 'sick': return <Activity className="w-4 h-4" />;
      case 'retired': return <Tag className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'injection': return '💉';
      case 'checkup': return '🔍';
      case 'ai': return '🧬';
      default: return '📝';
    }
  };

  const activeReminders = cow.reminders.filter(r => !r.completed);
  const completedReminders = cow.reminders.filter(r => r.completed);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">{cow.name}</h2>
              <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cow.status)}`}>
                {getStatusIcon(cow.status)}
                <span>{cow.status}</span>
              </span>
            </div>
            <p className="text-gray-500 mt-1">ID: #{cow.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">Breed</span>
              <p className="font-medium">{cow.breed}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Age</span>
              <p className="font-medium">{cow.age} years</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Last Sync Date</span>
              <p className="font-medium">{format(new Date(cow.lastSyncDate), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Active Reminders</span>
              <p className="font-medium">{activeReminders.length}</p>
            </div>
          </div>

          {/* Health Notes */}
          {cow.healthNotes && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clipboard className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Health Notes</h3>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700">{cow.healthNotes}</p>
              </div>
            </div>
          )}

          {/* Active Reminders */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold">Active Reminders</h3>
            </div>
            <div className="space-y-2">
              {activeReminders.length === 0 ? (
                <p className="text-gray-500 italic">No active reminders</p>
              ) : (
                activeReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="border border-gray-200 p-3 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span>{getTypeIcon(reminder.type)}</span>
                          <span className="font-medium">{reminder.title}</span>
                          <span className={`text-sm ${getPriorityColor(reminder.priority)}`}>
                            • {reminder.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(reminder.dueDate), 'MMM dd')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Reminders */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold">Completed Reminders</h3>
            </div>
            <div className="space-y-2">
              {completedReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="border border-gray-200 p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{getTypeIcon(reminder.type)}</span>
                        <span className="font-medium text-gray-500">{reminder.title}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{reminder.description}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {format(new Date(reminder.dueDate), 'MMM dd')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {onSelectForProtocol && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onSelectForProtocol}
              className="w-full vet-button-primary"
            >
              Apply Protocol to This Cow
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CowProfileModal;