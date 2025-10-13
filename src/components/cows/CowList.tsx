
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
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pregnant': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleQRScanSuccess = (cowId: string) => {
    const cow = cows.find(c => c.id === cowId);
    if (cow) {
      setSelectedCow(cow);
    } else {
      // You might want to show an error message here
      console.error('Cow not found with ID:', cowId);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Cow Management</h2>
          <button onClick={onAddCow} className="vet-button-primary">
            Add New Cow
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsQRModalOpen(true)}
          className="vet-button-secondary p-2 flex items-center justify-center"
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
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <QRScanModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />
      
      <div className="grid gap-4 overflow-y-auto max-h-[60vh]">
        {filteredCows.map((cow) => (
          <div
            key={cow.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedCow(cow)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{cow.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cow.status)}`}>
                    {cow.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
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
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Notes:</span> {cow.healthNotes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {cow.reminders.length} active reminders
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCow && (
        <CowProfileModal
          cow={selectedCow}
          isOpen={!!selectedCow}
          onClose={() => setSelectedCow(null)}
          onSelectForProtocol={() => {
            onSelectCow(selectedCow);
            setSelectedCow(null);
          }}
        />
      )}
    </div>
  );
};

export default CowList;
