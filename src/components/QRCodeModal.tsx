import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Smartphone,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { CurrencyCode } from '../types/bill';
import { formatCurrency } from '../utils/billCalculator';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  occasion: string;
  grandTotal: number;
  currency: CurrencyCode;
  peopleCount: number;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  occasion,
  grandTotal,
  currency,
  peopleCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (!isOpen || !shareUrl) return;

    // Generate QR code onto canvas
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          shareUrl,
          {
            width: 240,
            margin: 2,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          },
          (error) => {
            if (error) {
              console.error('QR code generation error:', error);
            } else {
              setQrGenerated(true);
            }
          }
        );
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `tabfast-qr-${(occasion || 'bill').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-code-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm"
    >
      <div className="flex max-h-[92vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 id="qr-code-modal-title" className="text-base font-bold text-neutral-900">
                Scan to Settle Up
              </h2>
              <p className="text-xs text-neutral-500">
                Friends can scan with their phone camera
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
            aria-label="Close QR code modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Bill summary context */}
          <div className="w-full rounded-2xl bg-neutral-50 border border-neutral-200/80 p-3.5 mb-5">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              {occasion || 'Dinner Bill'}
            </span>
            <div className="mt-0.5 flex items-center justify-center gap-2">
              <span className="text-2xl font-extrabold text-neutral-900 tabular-nums">
                {formatCurrency(grandTotal, currency)}
              </span>
              <span className="text-xs font-medium text-neutral-500">
                · {peopleCount} friends
              </span>
            </div>
          </div>

          {/* QR Code Canvas Container */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-neutral-900/10 bg-white p-4 shadow-md">
            <canvas ref={canvasRef} className="rounded-xl shadow-xs" />
            {!qrGenerated && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                <span className="text-xs font-medium text-neutral-500 animate-pulse">
                  Rendering QR code...
                </span>
              </div>
            )}
          </div>

          {/* Camera Scan Guidance */}
          <div className="mt-4 flex items-center gap-2 text-xs text-neutral-600 bg-amber-50/80 border border-amber-200/60 rounded-xl px-3.5 py-2">
            <Smartphone className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Open your phone's Camera app and point it at this QR code to load your share instantly!</span>
          </div>

          {/* Link box */}
          <div className="mt-5 w-full flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
            <span className="truncate text-neutral-600 font-mono text-[11px] flex-1 text-left">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 font-semibold text-white hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-neutral-100 bg-neutral-50/80 px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Image</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
