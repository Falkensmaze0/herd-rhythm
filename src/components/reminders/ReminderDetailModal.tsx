import React from 'react';
import { X } from 'lucide-react';
import { Reminder, Cow, SyncMethod } from '../../types';
import { format } from 'date-fns';

interface ReminderDetailModalProps {
  reminder: Reminder;
  cow?: Cow;
  syncMethod?: SyncMethod;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (id: string) => void;
}

const ReminderDetailModal: React.FC<ReminderDetailModalProps> = ({
  reminder,
  cow,
  syncMethod,
  isOpen,
  onClose,
  onComplete,
}) => {
  if (!isOpen) return null;

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
      default: return '📝';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{reminder.title}</h2>
            <p className="text-gray-500 mt-1">
              Due: {format(new Date(reminder.dueDate), 'MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(reminder.priority)}`}>
              {reminder.priority} priority
            </span>
            <span className="flex items-center space-x-2 text-gray-600">
              <span>{getTypeIcon(reminder.type)}</span>
              <span>{reminder.type}</span>
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Description</h3>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
              {reminder.description}
            </p>
          </div>

          {cow && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Cow Details</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-900">{cow.name}</p>
                <div className="mt-2 text-sm text-blue-800">
                  <p>ID: #{cow.id}</p>
                  <p>Breed: {cow.breed}</p>
                  <p>Status: {cow.status}</p>
                </div>
              </div>
            </div>
          )}

          {syncMethod && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Protocol Information</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-medium text-purple-900">{syncMethod.name}</p>
                <p className="text-sm text-purple-800 mt-1">{syncMethod.description}</p>
              </div>
            </div>
          )}

          {!reminder.completed && onComplete && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onComplete(reminder.id);
                  onClose();
                }}
                className="w-full vet-button-primary"
              >
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderDetailModal;