import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { CurrencyCode, SplitResult } from '../types/bill';
import { formatCurrency } from '../utils/billCalculator';
import { Printer, X, Download, Share2 } from 'lucide-react';

interface PrintableReceiptProps {
  result: SplitResult;
  occasion: string;
  currency: CurrencyCode;
  shareUrl: string;
  isOpen?: boolean;
  onClose?: () => void;
  isPrintOnly?: boolean;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  result,
  occasion,
  currency,
  shareUrl,
  isOpen = false,
  onClose,
  isPrintOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printCanvasRef = useRef<HTMLCanvasElement>(null);

  const payerShare = result.shares[result.payerIndex] || result.shares[0];
  const payerName = payerShare ? payerShare.name : 'Table Payer';

  const receiptNumber = `TF-${Math.abs(
    (occasion || 'DINNER').split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000) * 17
  ) % 90000 + 10000}`;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Render QR code onto canvas
  useEffect(() => {
    if (!shareUrl) return;

    const renderQR = (targetCanvas: HTMLCanvasElement | null) => {
      if (!targetCanvas) return;
      QRCode.toCanvas(
        targetCanvas,
        shareUrl,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#111827',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        },
        (err) => {
          if (err) console.error('Error drawing receipt QR', err);
        }
      );
    };

    renderQR(canvasRef.current);
    renderQR(printCanvasRef.current);
  }, [shareUrl, isOpen, isPrintOnly]);

  const handlePrint = () => {
    window.print();
  };

  // Dedicated Print-Only element that is always in the DOM for @media print
  if (isPrintOnly) {
    return (
      <div id="thermal-receipt-print" className="hidden print:block font-mono text-black p-4 max-w-sm mx-auto bg-white">
        <div className="text-center pb-3 border-b-2 border-dashed border-black">
          <h1 className="text-lg font-black tracking-widest uppercase">
            *** TABFAST DINING ***
          </h1>
          <p className="text-xs uppercase mt-1 font-bold">
            {occasion || 'GROUP DINNER SETTLEMENT'}
          </p>
          <div className="text-[11px] mt-1 space-y-0.5">
            <p>DATE: {formattedDate} {formattedTime}</p>
            <p>RCPT: #{receiptNumber} · TABLE: 04</p>
            <p>PAYER: {payerName.toUpperCase()}</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="py-3 border-b-2 border-dashed border-black text-xs space-y-1">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span className="font-bold">{formatCurrency(result.subtotal, currency)}</span>
          </div>
          {result.tipAmount > 0 && (
            <div className="flex justify-between">
              <span>TIP ({result.tipPercentage}%):</span>
              <span>{formatCurrency(result.tipAmount, currency)}</span>
            </div>
          )}
          {result.taxAmount > 0 && (
            <div className="flex justify-between">
              <span>TAX ({result.taxPercentage}%):</span>
              <span>{formatCurrency(result.taxAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black pt-1 border-t border-dotted border-black">
            <span>TOTAL BILLED:</span>
            <span>{formatCurrency(result.grandTotal, currency)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-600">
            <span>GUEST COUNT:</span>
            <span>{result.peopleCount} PERSONS</span>
          </div>
        </div>

        {/* Individual Guest Shares Breakdown */}
        <div className="py-3 border-b-2 border-dashed border-black">
          <p className="text-[11px] font-black uppercase tracking-wider mb-2">
            ITEMIZED GUEST SETTLEMENT:
          </p>
          <div className="space-y-1.5 text-xs">
            {result.shares.map((share) => (
              <div key={share.id} className="flex justify-between items-start">
                <div>
                  <span className="font-bold">{share.name}</span>
                  {share.isPayer ? (
                    <span className="block text-[10px] uppercase font-black tracking-tighter">
                      [PAID FOR TABLE]
                    </span>
                  ) : (
                    <span className="block text-[10px] text-neutral-600">
                      owes {payerName}
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-right">
                  {formatCurrency(share.totalAmount, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code and verification */}
        <div className="pt-3 pb-2 text-center flex flex-col items-center">
          <canvas ref={printCanvasRef} className="mx-auto" />
          <p className="text-[9px] uppercase tracking-wider mt-1 font-bold">
            SCAN QR TO VIEW DIGITAL BILL & SETTLE UP
          </p>
          <p className="text-[8px] text-neutral-500 font-mono mt-0.5">
            {receiptNumber} · PENNY-ACCURATE SPLIT
          </p>

          {/* Barcode Graphic simulation */}
          <div className="mt-3 flex justify-center items-center gap-[2px] h-9 w-44 mx-auto overflow-hidden">
            {[4, 2, 5, 1, 3, 2, 4, 1, 5, 2, 3, 1, 4, 2, 5, 3, 2, 4, 1, 3, 2, 5, 1, 4].map((h, i) => (
              <div
                key={i}
                className="bg-black w-1"
                style={{ height: `${h * 7}px` }}
              />
            ))}
          </div>
          <p className="text-[8px] font-mono tracking-widest mt-1">
            * 9 8 4 2 1 0 7 3 5 *
          </p>

          <p className="text-[10px] font-black uppercase mt-2">
            *** THANK YOU FOR DINING TOGETHER ***
          </p>
        </div>
      </div>
    );
  }

  // Interactive Modal Preview
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-md"
    >
      <div className="flex max-h-[94vh] w-full max-w-md flex-col rounded-3xl bg-neutral-900 text-white shadow-2xl overflow-hidden border border-neutral-800">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-neutral-950 font-black text-xs">
              TF
            </div>
            <div>
              <h2 id="receipt-preview-title" className="text-sm font-bold text-white">
                Restaurant Receipt Voucher
              </h2>
              <p className="text-[11px] text-neutral-400">
                Print-ready authentic diner layout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-neutral-900 hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Bill</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                aria-label="Close receipt modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Receipt Body with Skeuomorphic Paper Texture */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950/60 flex justify-center">
          <div className="w-full max-w-sm rounded-lg bg-[#fffdfa] text-neutral-900 p-6 shadow-2xl border border-neutral-200 font-mono relative overflow-hidden">
            {/* Top serrated paper effect */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-neutral-200/50 to-transparent" />

            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-dashed border-neutral-300">
              <h3 className="text-base font-black tracking-widest uppercase">
                *** TABFAST DINING ***
              </h3>
              <p className="text-xs uppercase mt-0.5 font-bold text-neutral-800">
                {occasion || 'GROUP DINNER SETTLEMENT'}
              </p>
              <div className="text-[10px] text-neutral-600 mt-1 space-y-0.5">
                <p>DATE: {formattedDate} {formattedTime}</p>
                <p>RECEIPT: #{receiptNumber} · TABLE: 04</p>
                <p>PAID BY: <strong className="text-neutral-900">{payerName.toUpperCase()}</strong></p>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="py-3 border-b-2 border-dashed border-neutral-300 text-xs space-y-1">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="font-bold">{formatCurrency(result.subtotal, currency)}</span>
              </div>
              {result.tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>TIP ({result.tipPercentage}%):</span>
                  <span>{formatCurrency(result.tipAmount, currency)}</span>
                </div>
              )}
              {result.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>TAX ({result.taxPercentage}%):</span>
                  <span>{formatCurrency(result.taxAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1.5 border-t border-dotted border-neutral-300 text-neutral-900">
                <span>TOTAL BILLED:</span>
                <span>{formatCurrency(result.grandTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>SPLIT ACROSS:</span>
                <span>{result.peopleCount} GUESTS</span>
              </div>
            </div>

            {/* Individual Guest Shares */}
            <div className="py-3 border-b-2 border-dashed border-neutral-300">
              <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-neutral-700">
                INDIVIDUAL GUEST SETTLEMENT:
              </p>
              <div className="space-y-1.5 text-xs">
                {result.shares.map((share) => (
                  <div key={share.id} className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-neutral-900">{share.name}</span>
                      {share.isPayer ? (
                        <span className="block text-[9px] uppercase font-bold text-emerald-700">
                          [PAID FOR TABLE]
                        </span>
                      ) : (
                        <span className="block text-[9px] text-neutral-500">
                          sends {payerName}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-right">
                      {formatCurrency(share.totalAmount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scannable QR Code */}
            <div className="pt-4 pb-2 text-center flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl shadow-xs border border-neutral-200 inline-block">
                <canvas ref={canvasRef} className="mx-auto" />
              </div>
              <p className="text-[9px] uppercase tracking-wider mt-2 font-bold text-neutral-800">
                SCAN QR TO VIEW DIGITAL BILL & SETTLE UP
              </p>
              <p className="text-[8px] text-neutral-400 font-mono mt-0.5">
                VERIFIED PENNY-ACCURATE SPLIT
              </p>

              {/* Barcode Graphic */}
              <div className="mt-3 flex justify-center items-center gap-[2px] h-8 w-44 mx-auto overflow-hidden opacity-85">
                {[4, 2, 5, 1, 3, 2, 4, 1, 5, 2, 3, 1, 4, 2, 5, 3, 2, 4, 1, 3, 2, 5, 1, 4].map((h, i) => (
                  <div
                    key={i}
                    className="bg-neutral-900 w-1"
                    style={{ height: `${h * 6}px` }}
                  />
                ))}
              </div>
              <p className="text-[8px] font-mono tracking-widest mt-1 text-neutral-500">
                * {receiptNumber} *
              </p>

              <p className="text-[10px] font-black uppercase mt-2 tracking-widest text-neutral-800">
                *** THANK YOU FOR DINING TOGETHER ***
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="border-t border-neutral-800 px-6 py-3.5 bg-neutral-950 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Pressing <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-200">Cmd+P</kbd> or clicking Print formats automatically.
          </span>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-neutral-100 transition-colors shadow-md cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Thermal Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
