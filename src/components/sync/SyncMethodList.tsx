
import React, { useState } from 'react';
import { addDays } from 'date-fns';
import { SyncMethod, Cow } from '../../types';
import { Settings } from 'lucide-react';
import CowSelectDialog from './CowSelectDialog';

interface SyncMethodListProps {
  methods: SyncMethod[];
  cows: Cow[];
  onSelectMethod: (method: SyncMethod) => void;
  onEditMethod: (method: SyncMethod) => void;
  onDeleteMethod: (id: string) => void;
  onCreateNew: () => void;
  onWorkforceSetup?: (method: SyncMethod) => void;
  onApplyProtocol: (cow: Cow, syncMethod: SyncMethod) => Promise<void>;
  setShowCowForm?: (show: boolean) => void;
}

const SyncMethodList: React.FC<SyncMethodListProps> = ({
  methods,
  cows,
  onSelectMethod,
  onEditMethod,
  onDeleteMethod,
  onCreateNew,
  onWorkforceSetup,
  onApplyProtocol,
  setShowCowForm
}) => {
  const [selectedMethod, setSelectedMethod] = useState<SyncMethod | null>(null);

  const handleSelectMethod = (method: SyncMethod) => {
    setSelectedMethod(method);
    onSelectMethod(method);
  };

  const handleCowSelect = async (cow: Cow, syncMethod: SyncMethod) => {
    if (cow.status === 'sick' || cow.status === 'retired' || cow.status === 'pregnant') {
      alert(`Cannot apply protocol to ${cow.status} cow`);
      return;
    }
    // Prevent protocol if cow already has an active protocol (future reminders for this cow)
    const hasActiveProtocol = cows
      .find(c => c.id === cow.id)?.reminders?.some(r => !r.completed && new Date(r.dueDate) >= new Date());
    if (hasActiveProtocol) {
      alert('This cow already has an active protocol.');
      return;
    }
    const startDate = new Date();
    const reminders = syncMethod.steps.map(step => ({
      id: `${cow.id}-${step.id}-${Date.now()}`,
      cowId: cow.id,
      syncMethodId: syncMethod.id,
      type: 'custom' as const,
      title: step.title,
      description: step.description,
      dueDate: addDays(startDate, step.day).toISOString(),
      completed: false,
      priority: 'medium' as const,
      syncStepId: step.id,
      workforceSnapshot: {
        workers: step.workforceRequirements?.worker_per_cows ? 1 : 0,
        technicians: step.workforceRequirements?.technician_per_cows ? 1 : 0,
        doctors: step.workforceRequirements?.doctor_per_cows ? 1 : 0
      }
    }));
    
    onApplyProtocol(cow, syncMethod);
  };
  return (
    <div className="vet-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Synchronization Methods</h2>
        <div className="flex space-x-4">
          <button onClick={onCreateNew} className="vet-button-primary">
            Create Custom Method
          </button>
          <button
            onClick={() => {
              if (typeof setShowCowForm === 'function') setShowCowForm(true);
            }}
            className="vet-button-secondary"
          >
            Add New Cow
          </button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {methods.map((method) => (
          <div key={method.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                  {method.isCustom && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      Custom
                    </span>
                  )}
                  {method.hasWorkforceSettings && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Workforce Configured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Duration: {method.duration} days</span>
                  <span>Steps: {method.steps.length}</span>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Protocol Steps:</h4>
                  <div className="space-y-2">
                    {method.steps.slice(0, 3).map((step) => (
                      <div key={step.id} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">Day {step.day}:</span> {step.title}
                        {step.hormoneType && (
                          <span className="ml-2 text-vet-blue">({step.hormoneType})</span>
                        )}
                        {step.workforceRequirements && (
                          <span className="ml-2 text-green-600 text-xs">
                            [Workforce: W:{step.workforceRequirements.worker_per_cows || 0} T:{step.workforceRequirements.technician_per_cows || 0} D:{step.workforceRequirements.doctor_per_cows || 0}]
                          </span>
                        )}
                      </div>
                    ))}
                    {method.steps.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{method.steps.length - 3} more steps...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => handleSelectMethod(method)}
                  className="vet-button-primary text-sm"
                >
                  Use Protocol
                </button>
                {onWorkforceSetup && (
                  <button
                    onClick={() => onWorkforceSetup(method)}
                    className="flex items-center space-x-1 vet-button-secondary text-sm"
                  >
                    <Settings size={14} />
                    <span>Workforce</span>
                  </button>
                )}
                {method.isCustom && (
                  <>
                    <button
                      onClick={() => onEditMethod(method)}
                      className="vet-button-secondary text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteMethod(method.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMethod && (
        <CowSelectDialog
          isOpen={!!selectedMethod}
          onClose={() => setSelectedMethod(null)}
          onCowSelect={handleCowSelect}
          syncMethod={selectedMethod}
          cows={cows}
        />
      )}
    </div>
  );
};

export default SyncMethodList;
