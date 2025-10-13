import React from 'react';
import { Cow, SyncMethod } from '../../types';
import CowList from '../cows/CowList';

interface CowSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCowSelect: (cow: Cow, syncMethod: SyncMethod) => void;
  syncMethod: SyncMethod;
  cows: Cow[];
}

const CowSelectDialog: React.FC<CowSelectDialogProps> = ({
  isOpen,
  onClose,
  onCowSelect,
  syncMethod,
  cows
}) => {
  const handleCowSelect = (cow: Cow) => {
    onCowSelect(cow, syncMethod);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Cow for {syncMethod.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ×
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Choose a cow to start the synchronization protocol. You can use the QR code scanner to quickly find a specific cow.
        </p>

        <CowList
          cows={cows}
          onSelectCow={handleCowSelect}
          onAddCow={() => {/* Implement if needed */}}
        />
      </div>
    </div>
  );
};

export default CowSelectDialog;