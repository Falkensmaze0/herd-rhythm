
import React, { useState } from 'react';
import { SyncMethod, SyncStep } from '../../types';

interface SyncMethodFormProps {
  method?: SyncMethod;
  onSave: (method: Omit<SyncMethod, 'id'>) => void;
  onCancel: () => void;
}

const SyncMethodForm: React.FC<SyncMethodFormProps> = ({ method, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: method?.name || '',
    description: method?.description || '',
    duration: method?.duration || 10,
    steps: method?.steps || [
      { id: '1', day: 0, title: '', description: '', hormoneType: '', notes: '' }
    ]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Method name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.duration < 1 || formData.duration > 30) {
      newErrors.duration = 'Duration must be between 1 and 30 days';
    }
    
    if (formData.steps.length < 2) {
      newErrors.steps = 'At least 2 steps are required';
    }
    
    formData.steps.forEach((step, index) => {
      if (!step.title.trim()) {
        newErrors[`step_${index}_title`] = 'Step title is required';
      }
      if (!step.description.trim()) {
        newErrors[`step_${index}_description`] = 'Step description is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        isCustom: true
      });
    }
  };

  const addStep = () => {
    const newStep: SyncStep = {
      id: Date.now().toString(),
      day: Math.max(...formData.steps.map(s => s.day)) + 1,
      title: '',
      description: '',
      hormoneType: '',
      notes: ''
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index)
      }));
    }
  };

  const updateStep = (index: number, field: keyof SyncStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  return (
    <div className="vet-card max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {method ? 'Edit Sync Method' : 'Create Custom Sync Method'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Method Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
              placeholder="e.g., Custom Ovsynch Modified"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (days) *
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
            />
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
            placeholder="Describe the synchronization method and its purpose"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Protocol Steps</h3>
            <button
              type="button"
              onClick={addStep}
              className="vet-button-secondary text-sm"
            >
              Add Step
            </button>
          </div>
          {errors.steps && <p className="text-red-500 text-sm mb-4">{errors.steps}</p>}
          
          <div className="space-y-4">
            {formData.steps.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Step {index + 1}</h4>
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={step.day}
                      onChange={(e) => updateStep(index, 'day', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hormone Type
                    </label>
                    <select
                      value={step.hormoneType || ''}
                      onChange={(e) => updateStep(index, 'hormoneType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
                    >
                      <option value="">None</option>
                      <option value="GnRH">GnRH</option>
                      <option value="PGF2α">PGF2α</option>
                      <option value="Estradiol">Estradiol</option>
                      <option value="Progesterone">Progesterone</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Step Title *
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
                      placeholder="e.g., GnRH Injection"
                    />
                    {errors[`step_${index}_title`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`step_${index}_title`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
                      placeholder="Detailed instructions"
                    />
                    {errors[`step_${index}_description`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`step_${index}_description`]}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={step.notes || ''}
                      onChange={(e) => updateStep(index, 'notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
                      placeholder="Additional notes or considerations"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            className="vet-button-primary"
          >
            {method ? 'Update Method' : 'Create Method'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="vet-button-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SyncMethodForm;
