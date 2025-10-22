// CowList Block – Searchable/selectable grid for cows, role-action aware.
// Can trigger CowProfileModal, QR scan, or add-cow if permitted.
//
// Props:
//   cows: Cow[]
//   onSelectCow: (cow: Cow) => void // When user clicks a cow
//   onAddCow?: () => void           // Show add form/modal (only for manager/admin/doctor)
//   className?: string
//   enableQR?: boolean              // If QR scan should be available (manager, tech, doc)
//
// Developer Notes:
// - For protocol selection, pass onSelectCow.
// - For strict view-only, pass no onAddCow.

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, QrCode } from 'lucide-react';
import { Cow } from '@/types';

export interface CowListProps {
  cows: Cow[];
  onSelectCow: (cow: Cow) => void;
  onAddCow?: () => void;
  className?: string;
  enableQR?: boolean;
}

/**
 * CowList: filterable/selectable cow overview, with optional Add/QR
 */
export const CowList: React.FC<CowListProps> = ({
  cows, onSelectCow, onAddCow, className, enableQR
}) => {
  const [query, setQuery] = useState('');

  const filtered = cows.filter(cow =>
    cow.name.toLowerCase().includes(query.toLowerCase()) ||
    cow.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Herd Management</CardTitle>
        <div className="flex gap-2">
          {enableQR && (
            <Button size="sm" variant="secondary" title="Scan QR">
              <QrCode className="w-4 h-4 mr-1" /> QR
            </Button>
          )}
          {onAddCow && (
            <Button size="sm" variant="default" onClick={onAddCow} title="Add new cow">
              <UserPlus className="w-4 h-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Search by name or ID..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.length === 0 && <div className="col-span-full text-muted-foreground p-2">No cows found.</div>}
          {filtered.map(cow => (
            <div
              key={cow.id}
              tabIndex={0}
              className="rounded shadow-sm px-2 py-3 cursor-pointer border hover:bg-muted/30 focus-visible:ring-2"
              onClick={() => onSelectCow(cow)}
              aria-label={`View details for ${cow.name} (${cow.id})`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-primary">{cow.name}</span>
                <span className={`text-xs rounded px-2 py-1 capitalize ${
                  cow.status === 'pregnant' ? 'bg-green-100 text-green-800' :
                  cow.status === 'sick' ? 'bg-red-100 text-red-800' :
                  cow.status === 'retired' ? 'bg-gray-100 text-gray-600' :
                  'bg-blue-100 text-blue-800'}`}>{cow.status}</span>
              </div>
              <div className="text-xs">ID: {cow.id}</div>
              <div className="text-xs">Breed: {cow.breed}</div>
              <div className="text-xs">Age: {cow.age}</div>
              <div className="text-xs text-muted-foreground">Last sync: {cow.lastSyncDate}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};