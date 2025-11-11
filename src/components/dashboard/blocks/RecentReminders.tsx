// RecentReminders Block (modernized, full type docs, developer comments)
// Shows today's grouped reminders with grouping, priorities, color tokenized styling.
//
// Props:
//   reminders: Reminder[]     // List of reminders for today
//   cows: Cow[]              // Needed for cow detail lookup (optional if IDs suffice)
//   syncMethods: SyncMethod[] // For displaying protocol/type info (optional depending on display)
//   onCompleteReminder: (id: string) => void // Callback for marking as complete
//   className?: string
//   (Optional: role filter could be exposed to show/hide interaction buttons)
//
// All UI is modernized: uses theme tokens and shadcn UI. Animations use motion if present.
// For full detail, inject <ReminderDetails /> as modal/dialog from parent when group is clicked.

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Optionally, use Lucide icons based on type/priority, e.g., AlarmClock, Syringe, etc.

import { Reminder, Cow, SyncMethod } from '@/types';

export interface RecentRemindersProps {
  reminders: Reminder[];
  cows?: Cow[];
  syncMethods?: SyncMethod[];
  onCompleteReminder: (id: string) => void;
  className?: string;
  // Optionally: userRole?: 'manager' | 'admin' | ... to gate completion actions
}

/**
 * Groups reminders by type and priority for display.
 */
function groupReminders(reminders: Reminder[]) {
  // Example: group by { type, priority }
  const groups: Record<string, Reminder[]> = {};
  reminders.forEach(rem => {
    const key = `${rem.type}-${rem.priority}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(rem);
  });
  return groups;
}

export const RecentReminders: React.FC<RecentRemindersProps> = ({
  reminders,
  cows,
  syncMethods,
  onCompleteReminder,
  className
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const groups = groupReminders(reminders);

  // Handle group click to show details (parent triggers modal if desired)
  const onGroupClick = (groupKey: string) => setSelectedGroup(groupKey);

  // For role gating: only expose completion if allowed (add from props/context if needed)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Today's Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-muted-foreground">No reminders due today 🎉</div>
        ) : (
          <div className="flex flex-col gap-2">
            {Object.entries(groups).map(([groupKey, items]) => {
              const [type, priority] = groupKey.split('-');
              return (
                <div
                  key={groupKey}
                  className="flex items-center justify-between rounded transition cursor-pointer hover:bg-muted/50 px-3 py-2"
                  onClick={() => onGroupClick(groupKey)}
                  tabIndex={0}
                  aria-label={`Show details for ${type}, ${priority} reminders`}
                >
                  <div className="flex items-center gap-2">
                    {/* Insert icon by type/priority here */}
                    <Badge className="mr-1 capitalize">{type}</Badge>
                    <Badge variant="secondary" className={`capitalize`}>
                      {priority}
                    </Badge>
                    <span>
                      {items.length} due
                    </span>
                  </div>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};