
import React, { useState } from 'react';
import { SyncMethod, SyncStep } from '../../types';
import { Info, AlertTriangle } from 'lucide-react';
import { ReminderService } from '../../services/ReminderService';

interface WorkforceSetupProps {
  method: SyncMethod;
  onSave: (method: SyncMethod) => void;
  onCancel: () => void;
}

const WorkforceSetup: React.FC<WorkforceSetupProps> = ({ method, onSave, onCancel }) => {
  const [steps, setSteps] = useState<SyncStep[]>(
    method.steps.map(step => ({
      ...step,
      workforceRequirements: step.workforceRequirements || {}
    }))
  );

  const defaultRequirements = ReminderService.getDefaultWorkforceRequirements();

  const updateStepWorkforce = (stepIndex: number, field: string, value: number | undefined) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? {
            ...step,
            workforceRequirements: {
              ...step.workforceRequirements,
              [field]: value || undefined
            }
          }
        : step
    ));
  };

  const useDefaults = (stepIndex: number, taskType: string) => {
    const defaults = defaultRequirements[taskType] || defaultRequirements['custom'];
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? {
            ...step,
            workforceRequirements: { ...defaults }
          }
        : step
    ));
  };

  const hasInsufficientWorkforce = (step: SyncStep) => {
    const reqs = step.workforceRequirements || {};
    return !reqs.worker_per_cows && !reqs.technician_per_cows && !reqs.doctor_per_cows;
  };

  const handleSave = () => {
    const updatedMethod: SyncMethod = {
      ...method,
      steps,
      hasWorkforceSettings: true
    };
    onSave(updatedMethod);
  };

  const getTaskType = (step: SyncStep): string => {
    const title = step.title.toLowerCase();
    if (title.includes('injection') || title.includes('gnrh') || title.includes('pgf')) return 'injection';
    if (title.includes('ai') || title.includes('insemination')) return 'ai';
    if (title.includes('check') || title.includes('pregnancy')) return 'checkup';
    return 'custom';
  };

  return (
    <div className="vet-card max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workforce Setup</h2>
          <p className="text-gray-600 mt-1">Configure personnel requirements for {method.name}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleSave} className="vet-button-primary">
            Save Settings
          </button>
          <button onClick={onCancel} className="vet-button-secondary">
            Cancel
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info size={16} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Workforce Role Definitions:</p>
              <div className="space-y-1 text-xs">
                <p><strong>Workers:</strong> General farm hands for basic tasks and cattle handling</p>
                <p><strong>Technicians:</strong> Skilled personnel for procedures like AI and hormone administration</p>
                <p><strong>Doctors:</strong> Veterinarians for medical examinations and complex procedures</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const taskType = getTaskType(step);
            const hasWarning = hasInsufficientWorkforce(step);
            
            return (
              <div 
                key={step.id} 
                className={`border rounded-lg p-6 ${hasWarning ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Day {step.day}: {step.title}
                      </h3>
                      {hasWarning && (
                        <AlertTriangle size={16} className="text-amber-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                    {step.hormoneType && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {step.hormoneType}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => useDefaults(index, taskType)}
                    className="text-sm vet-button-secondary ml-4"
                  >
                    Use Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <span>Cows per Worker</span>
                        <div className="group relative">
                          <Info size={12} className="text-gray-400" />
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                            Number of cows one worker can handle for this task
                          </div>
                        </div>
                      </div>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={step.workforceRequirements?.worker_per_cows || ''}
                      onChange={(e) => updateStepWorkforce(index, 'worker_per_cows', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
                      placeholder="e.g., 20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <span>Cows per Technician</span>
                        <div className="group relative">
                          <Info size={12} className="text-gray-400" />
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                            Number of cows one technician can handle for this task
                          </div>
                        </div>
                      </div>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={step.workforceRequirements?.technician_per_cows || ''}
                      onChange={(e) => updateStepWorkforce(index, 'technician_per_cows', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
                      placeholder="e.g., 15"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <span>Cows per Doctor</span>
                        <div className="group relative">
                          <Info size={12} className="text-gray-400" />
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                            Number of cows one doctor can handle for this task
                          </div>
                        </div>
                      </div>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={step.workforceRequirements?.doctor_per_cows || ''}
                      onChange={(e) => updateStepWorkforce(index, 'doctor_per_cows', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
                      placeholder="e.g., 25"
                    />
                  </div>
                </div>

                {hasWarning && (
                  <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle size={14} className="text-amber-600" />
                      <p className="text-sm text-amber-800">
                        No workforce requirements set for this step. Consider adding at least one role.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkforceSetup;
