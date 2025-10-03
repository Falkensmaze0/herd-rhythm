
import React from 'react';
import { Cow } from '../../types';
import { format } from 'date-fns';

interface CowListProps {
  cows: Cow[];
  onSelectCow: (cow: Cow) => void;
  onAddCow: () => void;
}

const CowList: React.FC<CowListProps> = ({ cows, onSelectCow, onAddCow }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pregnant': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="vet-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cow Management</h2>
        <button onClick={onAddCow} className="vet-button-primary">
          Add New Cow
        </button>
      </div>
      
      <div className="grid gap-4">
        {cows.map((cow) => (
          <div
            key={cow.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectCow(cow)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{cow.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cow.status)}`}>
                    {cow.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Breed:</span> {cow.breed}
                  </div>
                  <div>
                    <span className="font-medium">Age:</span> {cow.age} years
                  </div>
                  <div>
                    <span className="font-medium">Last Sync:</span> {format(new Date(cow.lastSyncDate), 'MMM dd, yyyy')}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span> #{cow.id}
                  </div>
                </div>
                {cow.healthNotes && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Notes:</span> {cow.healthNotes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {cow.reminders.length} active reminders
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CowList;
