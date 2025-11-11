// CowForm Block – Creates or edits a single cow record
// Usable in add/edit modal flows for admins, managers, doctors.
// Uses modern theme tokens and UI kit input primitives throughout.
// Props:
//   cow?: Cow                       // If provided, form edits this cow; otherwise, "add new".
//   onSave: (cow: CowInput) => void // Called when form submits valid data.
//   onCancel: () => void            // Called when user cancels.
//   className?: string
//   role?: string                   // Optionally passed for field gating (add logic as needed)
//
// Developer Note: CowInput should match form fields, *not* full Cow object if backend ID etc. is auto-generated.

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cow } from '@/types';

// For input safety, define CowInput (minus ID, reminders, etc)
export type CowInput = Omit<Cow, 'id' | 'reminders'> & {
  id?: string;
};

export interface CowFormProps {
  cow?: Cow;
  onSave: (cow: CowInput) => void;
  onCancel: () => void;
  className?: string;
  role?: string; // for future field gating usage
}

/**
 * CowForm: create/edit a cow, fully documented and portable block.
 */
export const CowForm: React.FC<CowFormProps> = ({
  cow,
  onSave,
  onCancel,
  className,
  role
}) => {
  const [form, setForm] = useState<CowInput>(
    cow || {
      name: '',
      breed: '',
      age: 0,
      lastSyncDate: '',
      healthNotes: '',
      status: 'active',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: typeof errors = {};
    if (!form.name || form.name.length < 2) e.name = 'Name is required';
    if (!form.breed) e.breed = 'Breed is required';
    if (form.age < 0 || form.age > 40) e.age = 'Age must be 0-40';
    if (!form.lastSyncDate) e.lastSyncDate = 'Last Sync Date required';
    // Add more as needed.
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleInput<K extends keyof CowInput>(key: K, val: CowInput[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <Card>
        <CardHeader>
          <CardTitle>
            {cow ? 'Edit Cow' : 'Add New Cow'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => handleInput('name', e.target.value)}
              required
              autoFocus
            />
            {errors.name && <div className="text-red-600 text-xs">{errors.name}</div>}
          </div>
          <div>
            <Label htmlFor="breed">Breed</Label>
            <Input
              id="breed"
              value={form.breed}
              onChange={e => handleInput('breed', e.target.value)}
              required
            />
            {errors.breed && <div className="text-red-600 text-xs">{errors.breed}</div>}
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={0}
              max={40}
              value={form.age}
              onChange={e => handleInput('age', Number(e.target.value))}
              required
            />
            {errors.age && <div className="text-red-600 text-xs">{errors.age}</div>}
          </div>
          <div>
            <Label htmlFor="lastSyncDate">Last Sync Date</Label>
            <Input
              id="lastSyncDate"
              type="date"
              value={form.lastSyncDate}
              onChange={e => handleInput('lastSyncDate', e.target.value)}
              required
            />
            {errors.lastSyncDate && <div className="text-red-600 text-xs">{errors.lastSyncDate}</div>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={e => handleInput('status', e.target.value as CowInput['status'])}
              className="w-full border rounded px-2 py-1"
              required
            >
              <option value="active">Active</option>
              <option value="pregnant">Pregnant</option>
              <option value="sick">Sick</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div>
            <Label htmlFor="healthNotes">Health Notes</Label>
            <Input
              id="healthNotes"
              value={form.healthNotes}
              onChange={e => handleInput('healthNotes', e.target.value)}
              placeholder="Notes (optional)"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="default">
              {cow ? 'Save' : 'Add Cow'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};