
import React from 'react';
import { SyncMethod } from '../../types';
import { Settings } from 'lucide-react';

interface SyncMethodListProps {
  methods: SyncMethod[];
  onSelectMethod: (method: SyncMethod) => void;
  onEditMethod: (method: SyncMethod) => void;
  onDeleteMethod: (id: string) => void;
  onCreateNew: () => void;
  onWorkforceSetup?: (method: SyncMethod) => void;
}

const SyncMethodList: React.FC<SyncMethodListProps> = ({
  methods,
  onSelectMethod,
  onEditMethod,
  onDeleteMethod,
  onCreateNew,
  onWorkforceSetup
}) => {
  return (
    <div className="vet-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Synchronization Methods</h2>
        <button onClick={onCreateNew} className="vet-button-primary">
          Create Custom Method
        </button>
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
                  onClick={() => onSelectMethod(method)}
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
    </div>
  );
};

export default SyncMethodList;
