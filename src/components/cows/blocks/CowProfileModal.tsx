// CowProfileModal Block – Modal dialog for reviewing cow details and triggering protocol application.
// Modern theme tokens and full developer comments.
//
// Props:
//   cow: Cow
//   isOpen: boolean
//   onClose: () => void
//   onSelectForProtocol?: (cow: Cow) => void // Only available to permitted roles
//   className?: string

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cow } from '@/types';

export interface CowProfileModalProps {
  cow: Cow;
  isOpen: boolean;
  onClose: () => void;
  onSelectForProtocol?: (cow: Cow) => void;
  className?: string;
}

/**
 * CowProfileModal: Shows full details, allows protocol action for permitted roles.
 */
export const CowProfileModal: React.FC<CowProfileModalProps> = ({
  cow, isOpen, onClose, onSelectForProtocol, className
}) => {
  // Optionally, resolve reminders and display in sections (active/completed)
  const reminders = cow.reminders || [];
  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <Dialog open={isOpen} onOpenChange={b => !b && onClose()}>
      <DialogContent className={`max-w-xl ${className || ''}`}>
        <DialogHeader>
          <DialogTitle>
            {cow.name} <Badge className="ml-2 capitalize">{cow.status}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-bold">Cow ID:</span> {cow.id}</div>
          <div><span className="font-bold">Breed:</span> {cow.breed}</div>
          <div><span className="font-bold">Age:</span> {cow.age}</div>
          <div><span className="font-bold">Last Sync:</span> {cow.lastSyncDate}</div>
          <div className="col-span-2"><span className="font-bold">Health Notes:</span> {cow.healthNotes || <span className="text-muted-foreground">None</span>}</div>
        </div>
        <div>
          <span className="font-bold text-sm">Active Reminders:</span>
          <ul className="pl-4 list-disc">
            {activeReminders.length === 0 ? (
              <li className="text-muted-foreground">None</li>
            ) : activeReminders.map(r => (
              <li key={r.id}>{r.title} (<span className="text-xs">due {r.dueDate}</span>)</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="font-bold text-sm">Completed Reminders:</span>
          <ul className="pl-4 list-disc">
            {completedReminders.length === 0 ? (
              <li className="text-muted-foreground">None</li>
            ) : completedReminders.map(r => (
              <li key={r.id}>{r.title}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          {onSelectForProtocol && (
            <Button
              variant="default"
              onClick={() => { onSelectForProtocol(cow); onClose(); }}
            >
              Apply Protocol
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};