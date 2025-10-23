import React from 'react';
import { Cow, SyncMethod } from '../../types';
import CowList from '../cows/CowList';
import { QrCode } from 'lucide-react';

interface CowSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCowSelect: (cow: Cow, syncMethod: SyncMethod) => void;
  syncMethod: SyncMethod;
  cows: Cow[];
}

const CowSelectDialog: React.FC<CowSelectDialogProps> = ({
  isOpen,
  onClose,
  onCowSelect,
  syncMethod,
  cows
}) => {
  const handleCowSelect = (cow: Cow) => {
    onCowSelect(cow, syncMethod);
    onClose();
  };

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full p-6 shadow-xl">
        <div className="flex items-center mb-4 gap-2 px-2" style={{ minHeight: 64 }}>
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="bg-primary text-white flex items-center justify-center"
            style={{ borderRadius: '32px', height: 48, width: 48, fontSize: 28, marginRight: 8, minWidth: 48 }}
            aria-label="Scan QR Code"
          >
            <QrCode size={28} />
          </button>
          <input
            type="text"
            placeholder="Search cows by name, ID, or breed..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-5 py-3 border border-input focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            style={{ borderRadius: '32px', minHeight: 48, marginLeft: 0, marginRight: 8 }}
          />
          <button
            onClick={onClose}
            className="bg-muted text-muted-foreground flex items-center justify-center"
            style={{ borderRadius: '32px', height: 48, width: 48, fontSize: 28, marginLeft: 0, minWidth: 48 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          <CowList
            cows={cows.filter(cow => {
              const query = searchQuery.toLowerCase();
              return (
                cow.name.toLowerCase().includes(query) ||
                cow.id.toLowerCase().includes(query) ||
                cow.breed.toLowerCase().includes(query)
              );
            })}
            onSelectCow={handleCowSelect}
            onAddCow={() => {/* Implement if needed */}}
            showControls={false}
          />
        </div>
        {/* QR Modal logic (connect to scanner) */}
        {/* Implement QRScanModal here if needed, or connect to protocol registration logic */}
      </div>
    </div>
  );
};

export default CowSelectDialog;