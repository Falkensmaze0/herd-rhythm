// QRScanModal Block – Modal dialog for scanning cow QR codes.
// Only available to roles with in-field or management permissions.
// Modernized with detailed documentation and UI tokens.
//
// Props:
//   isOpen: boolean
//   onClose: () => void
//   onScanSuccess: (cowId: string) => void
//   className?: string
//
// Dependence: Expects global Html5Qrcode to be loaded. Consider dynamic feature detection and fallback.

import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface QRScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (cowId: string) => void;
  className?: string;
}

/**
 * QRScanModal: Modal dialog for scanning and returning a cowId by QR code.
 */
export const QRScanModal: React.FC<QRScanModalProps> = ({
  isOpen, onClose, onScanSuccess, className
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let html5QrCode: any;
    if (isOpen && scannerRef.current) {
      setError(null);
      setActive(true);
      // @ts-ignore
      if (window.Html5Qrcode) {
        html5QrCode = new window.Html5Qrcode(scannerRef.current.id);
        html5QrCode
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: 250 },
            (decodedText: string) => {
              setActive(false);
              html5QrCode && html5QrCode.stop();
              onScanSuccess(decodedText);
              onClose();
            },
            (err: string) => {}
          )
          .catch((e: any) => {
            setError('Failed to access camera or initialize scanner.');
            setActive(false);
          });
      } else {
        setError('QR scanner script not loaded.');
        setActive(false);
      }
    }
    return () => {
      if (html5QrCode) html5QrCode.stop().catch(() => {});
      setActive(false);
    };
    // eslint-disable-next-line
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={b => !b && onClose()}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>Scan Cow QR Code</DialogTitle>
        </DialogHeader>
        <div className="h-64 w-full flex items-center justify-center bg-blue-50 rounded mb-2">
          <div id="qr-scan-view" ref={scannerRef} style={{ width: 300, height: 240 }} />
        </div>
        {error && <div className="text-red-600 text-xs">{error}</div>}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={active}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};