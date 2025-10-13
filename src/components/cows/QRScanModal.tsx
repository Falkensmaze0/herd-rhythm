import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (cowId: string) => void;
}

const QRScanModal: React.FC<QRScanModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string>("");

  const handleSuccess = useCallback((result: string) => {
    if (qrRef.current) {
      qrRef.current.stop()
        .then(() => {
          onScanSuccess(result);
          onClose();
        })
        .catch((err) => {
          console.error('Error stopping QR scanner after scan:', err);
          onScanSuccess(result);
          onClose();
        });
    }
  }, [onScanSuccess, onClose]);

  useEffect(() => {
    let mounted = true;

    const initializeScanner = async () => {
      if (!isOpen || !containerRef.current) return;

      try {
        setError("");
        
        // Cleanup previous instance
        if (qrRef.current) {
          await qrRef.current.stop();
          qrRef.current = null;
        }

        if (!mounted) return;

        // Initialize new scanner
        qrRef.current = new Html5Qrcode('qr-reader');
        
        await qrRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (mounted) {
              handleSuccess(decodedText);
            }
          },
          () => {} // Ignore errors during scanning
        );
      } catch (err) {
        console.error('Error initializing QR scanner:', err);
        setError("Could not access camera. Please ensure you've granted camera permissions.");
      }
    };

    initializeScanner();

    return () => {
      mounted = false;
      if (qrRef.current) {
        qrRef.current.stop().catch(() => {});
        qrRef.current = null;
      }
    };
  }, [isOpen, handleSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan Cow QR Code</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="relative mb-4">
          {error ? (
            <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-4 text-center text-red-500">
              {error}
            </div>
          ) : (
            <>
              <div 
                id="qr-reader" 
                ref={containerRef} 
                className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-white opacity-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-white opacity-50" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          <Camera size={16} className="mr-2 text-blue-500" />
          <p>Position the QR code within the frame to scan</p>
        </div>
      </div>
    </div>
  );
};

export default QRScanModal;