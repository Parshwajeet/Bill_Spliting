import React, { useState } from 'react';
import {
  CreditCard,
  X,
  ExternalLink,
  Copy,
  Check,
  Send,
  Smartphone,
} from 'lucide-react';
import { CurrencyCode, SplitResult } from '../types/bill';
import { formatCurrency } from '../utils/billCalculator';

interface PaymentLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SplitResult;
  occasion: string;
  currency: CurrencyCode;
}

export const PaymentLinksModal: React.FC<PaymentLinksModalProps> = ({
  isOpen,
  onClose,
  result,
  occasion,
  currency,
}) => {
  const [payerHandle, setPayerHandle] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const payerShare = result.shares[result.payerIndex] || result.shares[0];
  const payerName = payerShare ? payerShare.name : 'Table Payer';

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pay-links-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm"
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 id="pay-links-title" className="text-base font-bold text-neutral-900">
                1-Click Settle Up Links
              </h2>
              <p className="text-xs text-neutral-500">
                Send pre-filled payment requests to friends
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
            aria-label="Close pay links modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Optional: Payer's Payment Tag / Handle input */}
          <div className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-4">
            <label
              htmlFor="payer-handle-input"
              className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block"
            >
              Optional: Enter {payerName}'s Payment Handle
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-neutral-400 text-sm font-mono">@</span>
              <input
                id="payer-handle-input"
                type="text"
                value={payerHandle}
                onChange={(e) => setPayerHandle(e.target.value.replace(/^@/, ''))}
                placeholder="e.g. alex-smith (Venmo / CashApp handle)"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 font-mono focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              When provided, buttons below generate direct payment deep links!
            </p>
          </div>

          {/* List of Friends' Quick Request Actions */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              Friends' Shares to Collect ({result.shares.filter((s) => !s.isPayer).length} Friends)
            </span>

            {result.shares
              .filter((s) => !s.isPayer)
              .map((share) => {
                const note = encodeURIComponent(`Dinner: ${occasion || 'Bill Split'}`);
                const amount = share.totalAmount.toFixed(2);
                const handle = payerHandle.trim();

                const venmoUrl = handle
                  ? `venmo://paycharge?txn=pay&recipients=${handle}&amount=${amount}&note=${note}`
                  : `https://venmo.com/?txn=pay&amount=${amount}&note=${note}`;

                const cashAppUrl = handle
                  ? `https://cash.app/$${handle}/${amount}`
                  : `https://cash.app`;

                const payPalUrl = handle
                  ? `https://paypal.me/${handle}/${amount}`
                  : `https://paypal.me`;

                return (
                  <div
                    key={share.id}
                    className="rounded-xl border border-neutral-200 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">{share.name}</span>
                        {share.isManual && (
                          <span className="text-[10px] text-amber-700 bg-amber-100 font-semibold px-1.5 py-0.2 rounded">
                            custom
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500">
                        Owes {payerName} <strong className="text-neutral-900">{formatCurrency(share.totalAmount, currency)}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <a
                        href={venmoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#008CFF] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#0077db] transition-colors shadow-2xs"
                      >
                        <span>Venmo</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>

                      <a
                        href={cashAppUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#00D632] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#00b92b] transition-colors shadow-2xs"
                      >
                        <span>Cash App</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            share.id,
                            `Hey ${share.name}, your share for ${occasion || 'dinner'} is ${formatCurrency(
                              share.totalAmount,
                              currency
                            )}. Send to ${payerName}${handle ? ` (@${handle})` : ''}!`
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Copy message prompt"
                      >
                        {copiedLink === share.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-3.5 flex items-center justify-between text-xs text-neutral-500">
          <span>Tap any button to open your payment app pre-filled.</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-1.5 font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
