
import React, { useState } from 'react';
import { Cow } from '../../types';

interface CowFormProps {
  cow?: Cow;
  onSave: (cow: Omit<Cow, 'id' | 'reminders'>) => void;
  onCancel: () => void;
}

const CowForm: React.FC<CowFormProps> = ({ cow, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: cow?.name || '',
    breed: cow?.breed || '',
    age: cow?.age || 1,
    lastSyncDate: cow?.lastSyncDate || '',
    healthNotes: cow?.healthNotes || '',
    status: cow?.status || 'active' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Cow name is required';
    }
    
    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }
    
    if (formData.age < 1 || formData.age > 20) {
      newErrors.age = 'Age must be between 1 and 20 years';
    }
    
    if (!formData.lastSyncDate) {
      newErrors.lastSyncDate = 'Last sync date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="vet-card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {cow ? 'Edit Cow' : 'Add New Cow'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cow Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
              placeholder="Enter cow name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breed *
            </label>
            <select
              value={formData.breed}
              onChange={(e) => handleChange('breed', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
            >
              <option value="">Select breed</option>
              <option value="Holstein">Holstein</option>
              <option value="Jersey">Jersey</option>
              <option value="Angus">Angus</option>
              <option value="Simmental">Simmental</option>
              <option value="Charolais">Charolais</option>
              <option value="Hereford">Hereford</option>
            </select>
            {errors.breed && <p className="text-red-500 text-sm mt-1">{errors.breed}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age (years) *
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
            />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Sync Date *
            </label>
            <input
              type="date"
              value={formData.lastSyncDate}
              onChange={(e) => handleChange('lastSyncDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
            />
            {errors.lastSyncDate && <p className="text-red-500 text-sm mt-1">{errors.lastSyncDate}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
            >
              <option value="active">Active</option>
              <option value="pregnant">Pregnant</option>
              <option value="sick">Sick</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Notes
            </label>
            <textarea
              value={formData.healthNotes}
              onChange={(e) => handleChange('healthNotes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vet-blue"
              placeholder="Enter any health notes or observations"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            className="vet-button-primary"
          >
            {cow ? 'Update Cow' : 'Add Cow'}
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

export default CowForm;
