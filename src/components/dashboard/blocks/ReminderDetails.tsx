// ReminderDetails Block – Detail interface for a group of reminders.
// Expects a grouped bucket of reminders for a type/priority combo.
// Used as a modal/dialog body when a group is selected in RecentReminders.
//
// Props:
//   reminders: Reminder[] — List for the selected group.
//   cows?: Cow[]          — (Optional) for cow lookups.
//   groupType: string     — e.g. "injection"
//   groupPriority: string — e.g. "high"
//   onClose: () => void
//   onCompleteReminder: (id: string) => void
//   onCompleteAll: () => void

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reminder, Cow } from '@/types';

export interface ReminderDetailsProps {
  reminders: Reminder[];
  cows?: Cow[];
  groupType: string;
  groupPriority: string;
  onClose: () => void;
  onCompleteReminder: (id: string) => void;
  onCompleteAll: () => void;
  // Optionally: disableComplete?: boolean (for viewer-only roles)
}

/**
 * ReminderDetails Block – Modal/dialog content for a single type/priority group.
 */
export const ReminderDetails: React.FC<ReminderDetailsProps> = ({
  reminders, cows, groupType, groupPriority, onClose, onCompleteReminder, onCompleteAll,
}) => {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {groupType.toUpperCase()} Reminders | <Badge>{groupPriority}</Badge>
          </CardTitle>
          <Button onClick={onClose} size="sm" variant="ghost">Back</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reminders.map(rem => (
            <div key={rem.id} className="flex items-center justify-between p-2 rounded hover:bg-accent/40">
              <span>
                {/* Optionally resolve cow names/IDs */}
                <span className="font-bold mr-2">{rem.cowId}</span>
                <span className="text-muted-foreground">{rem.title}</span>
                <span className="text-xs ml-2 text-muted-foreground">due {rem.dueDate}</span>
              </span>
              <Button size="sm" onClick={() => onCompleteReminder(rem.id)}>
                Complete
              </Button>
            </div>
          ))}
        </div>
        <Button className="mt-4 w-full" variant="default" onClick={onCompleteAll}>
          Complete All
        </Button>
      </CardContent>
    </Card>
  );
};