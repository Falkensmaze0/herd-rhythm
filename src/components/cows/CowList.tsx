
import React, { useState, useMemo } from 'react';
import { Cow } from '../../types';
import { format } from 'date-fns';
import { QrCode, Search } from 'lucide-react';
import QRScanModal from './QRScanModal';
import CowProfileModal from './CowProfileModal';

interface CowListProps {
  cows: Cow[];
  onSelectCow: (cow: Cow) => void;
  onAddCow: () => void;
}

interface CowListProps {
  cows: Cow[];
  onSelectCow: (cow: Cow) => void;
  onAddCow: () => void;
  showControls?: boolean;
  containerClassName?: string;
}

const CowList: React.FC<CowListProps> = ({
  cows,
  onSelectCow,
  onAddCow,
  showControls = true,
  containerClassName = "vet-card"
}) => {
  const [selectedCows, setSelectedCows] = useState<string[]>([]);
  const [previewCowId, setPreviewCowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent text-primary';
      case 'pregnant': return 'bg-blue-50 text-blue-800';
      case 'sick': return 'bg-red-50 text-red-800';
      case 'retired': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Add cow to selection (QR scan or click)
  const handleAddToSelection = (cowId: string) => {
    setSelectedCows(prev => prev.includes(cowId) ? prev : [...prev, cowId]);
  };
  // Remove cow from selection (swipe left or unselect icon)
  const handleRemoveFromSelection = (cowId: string) => {
    setSelectedCows(prev => prev.filter(id => id !== cowId));
  };

  // QR scan adds to selection
  const handleQRScanSuccess = (cowId: string) => {
    const cow = cows.find(c => c.id === cowId);
    if (cow) {
      handleAddToSelection(cowId);
    } else {
      console.error('Cow not found with ID:', cowId);
    }
  };

  // Preview toggle
  const togglePreview = (cowId: string) => {
    setPreviewCowId(prev => prev === cowId ? null : cowId);
  };

  // Gesture support for swipe left (mobile)
  // For brevity, not implemented here, but can use a library like react-swipeable

  const filteredCows = useMemo(() => {
    if (!searchQuery) return cows;
    const query = searchQuery.toLowerCase();
    return cows.filter(cow => 
      cow.name.toLowerCase().includes(query) ||
      cow.id.toLowerCase().includes(query) ||
      cow.breed.toLowerCase().includes(query)
    );
  }, [cows, searchQuery]);

  return (
    <div className={containerClassName}>
      {showControls && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Cow Management</h2>
          <button onClick={onAddCow} className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary/90 transition">
            Add New Cow
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsQRModalOpen(true)}
          className="bg-muted text-muted-foreground p-2 flex items-center justify-center rounded hover:bg-accent transition"
          aria-label="Scan QR Code"
        >
          <QrCode size={20} />
        </button>
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search cows by name, ID, or breed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      
      <QRScanModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />
      
      <div className="grid gap-4 overflow-y-auto max-h-[60vh]">
        {filteredCows.map((cow) => {
          const isSelected = selectedCows.includes(cow.id);
          const isPreviewing = previewCowId === cow.id;
          return (
            <div
              key={cow.id}
              className={`border border-input rounded-lg p-4 bg-background transition-shadow cursor-pointer relative ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'} `}
              onClick={() => handleAddToSelection(cow.id)}
              onDoubleClick={() => togglePreview(cow.id)}
              // For mobile, long tap can be handled with a gesture library
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-primary">{cow.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cow.status)}`}>
                      {cow.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Breed:</span> {cow.breed}
                    </div>
                    <div>
                      <span className="font-medium">Age:</span> {cow.age} years
                    </div>
                    <div>
                      <span className="font-medium">Last Sync:</span> {format(new Date(cow.lastSyncDate), 'MMM dd, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">ID:</span> #{cow.id}
                    </div>
                  </div>
                  {cow.healthNotes && (
                    <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded">
                      <span className="font-medium">Notes:</span> {cow.healthNotes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-muted-foreground">
                    {cow.reminders.length} active reminders
                  </div>
                  <button
                    className="rounded-full p-1 bg-muted hover:bg-accent transition"
                    onClick={e => { e.stopPropagation(); togglePreview(cow.id); }}
                    aria-label={isPreviewing ? 'Hide details' : 'Show details'}
                  >
                    <span className={`transition-transform duration-200 ${isPreviewing ? 'rotate-180' : ''}`}>{isPreviewing ? '▲' : '▼'}</span>
                  </button>
                  {isSelected && (
                    <button
                      className="rounded-full p-1 bg-red-100 text-red-700 hover:bg-red-200 transition"
                      onClick={e => { e.stopPropagation(); handleRemoveFromSelection(cow.id); }}
                      aria-label="Unselect cow"
                    >
                      Unselect
                    </button>
                  )}
                </div>
              </div>
              {/* Animated preview section */}
              <div
                className={`overflow-hidden transition-all duration-300 ${isPreviewing ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                style={{ background: '#f9fafb', borderRadius: 8, marginTop: 8, padding: isPreviewing ? 16 : 0 }}
              >
                {isPreviewing && (
                  <div>
                    <div className="font-semibold mb-2">Cow Details</div>
                    <div className="text-sm mb-1">Breed: {cow.breed}</div>
                    <div className="text-sm mb-1">Age: {cow.age}</div>
                    <div className="text-sm mb-1">Last Sync: {format(new Date(cow.lastSyncDate), 'MMM dd, yyyy')}</div>
                    <div className="text-sm mb-1">Status: {cow.status}</div>
                    <div className="text-sm mb-1">Health Notes: {cow.healthNotes || 'None'}</div>
                    {/* Add more protocol-relevant details here */}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CowList;
