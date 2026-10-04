import React, { useState, useEffect } from 'react';
import { Check, Edit2, CreditCard, RotateCcw, Sliders } from 'lucide-react';
import { CurrencyCode, CURRENCIES, PersonShare } from '../types/bill';
import { formatCurrency } from '../utils/billCalculator';

interface PersonCardProps {
  share: PersonShare;
  currency: CurrencyCode;
  payerName: string;
  isUnevenMode: boolean;
  onNameChange: (index: number, newName: string) => void;
  onSetPayer: (index: number) => void;
  onManualAmountChange: (index: number, amount: number | null) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  share,
  currency,
  payerName,
  isUnevenMode,
  onNameChange,
  onSetPayer,
  onManualAmountChange,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(share.name);

  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [tempAmount, setTempAmount] = useState(share.totalAmount.toFixed(2));
  const [amountError, setAmountError] = useState<string | null>(null);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.USD;

  // Sync temp amount when share changes externally
  useEffect(() => {
    if (!isEditingAmount) {
      setTempAmount(share.totalAmount.toFixed(currencyConfig.decimals));
    }
  }, [share.totalAmount, currencyConfig.decimals, isEditingAmount]);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      onNameChange(share.index, trimmed);
    } else {
      setTempName(share.name);
    }
    setIsEditingName(false);
  };

  const handleSaveAmount = () => {
    const trimmed = tempAmount.trim();
    if (trimmed === '') {
      setAmountError('Amount cannot be empty');
      return;
    }
    const num = Number(trimmed);
    if (isNaN(num)) {
      setAmountError('Must be a number');
      return;
    }
    if (num < 0) {
      setAmountError('Cannot be negative');
      return;
    }
    setAmountError(null);
    onManualAmountChange(share.index, Math.round(num * 100) / 100);
    setIsEditingAmount(false);
  };

  const handleRevertToAuto = () => {
    onManualAmountChange(share.index, null);
    setIsEditingAmount(false);
    setAmountError(null);
  };

  const copyAmountToClipboard = () => {
    navigator.clipboard.writeText(formatCurrency(share.totalAmount, currency));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all shadow-xs ${
        share.isPayer
          ? 'border-neutral-900 dark:border-slate-700 bg-neutral-900 dark:bg-slate-800 text-white'
          : share.isManual
          ? 'border-amber-400/80 dark:border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20'
          : 'border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-neutral-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Name and Role */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                share.isPayer
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300'
              }`}
            >
              {share.index + 1}
            </div>

            {isEditingName ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  autoFocus
                  className="rounded-lg border border-neutral-400 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-0.5 text-sm font-semibold text-neutral-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="rounded p-1 text-emerald-600 hover:bg-neutral-100 dark:hover:bg-slate-700 cursor-pointer"
                  title="Save name"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <span
                  className={`text-sm font-bold truncate ${
                    share.isPayer ? 'text-white' : 'text-neutral-900 dark:text-white'
                  }`}
                >
                  {share.name}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer ${
                    share.isPayer
                      ? 'text-neutral-300 hover:text-white'
                      : 'text-neutral-400 dark:text-slate-500 hover:text-neutral-700 dark:hover:text-slate-300'
                  }`}
                  title="Rename friend"
                  aria-label={`Rename ${share.name}`}
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Share calculation status & role */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {share.isPayer ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                <CreditCard className="h-3 w-3" />
                Paid the full bill
              </span>
            ) : (
              <span className="text-neutral-500 dark:text-slate-400 font-medium">
                Owes <strong className="text-neutral-700 dark:text-slate-200">{payerName}</strong>
              </span>
            )}

            <span aria-hidden="true" className="text-neutral-300 dark:text-slate-600">·</span>

            {/* Clear differentiation between auto and manual */}
            {share.isManual ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                Manually Adjusted
              </span>
            ) : (
              <span className="text-[11px] font-medium text-neutral-400 dark:text-slate-500">
                Auto-calculated
              </span>
            )}
          </div>
        </div>

        {/* Share Amount & Inline Editing */}
        <div className="text-right">
          {isEditingAmount ? (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${share.isPayer ? 'text-white' : 'text-neutral-700 dark:text-slate-300'}`}>
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  step="any"
                  value={tempAmount}
                  onChange={(e) => setTempAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAmount();
                    if (e.key === 'Escape') setIsEditingAmount(false);
                  }}
                  autoFocus
                  className="w-24 rounded-lg border border-neutral-400 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-bold text-neutral-900 dark:text-white focus:outline-none tabular-nums text-right"
                />
                <button
                  type="button"
                  onClick={handleSaveAmount}
                  className="rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 p-1 hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Apply custom share"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
              {amountError && (
                <span className="text-[10px] text-red-500 dark:text-red-400 font-semibold">{amountError}</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={copyAmountToClipboard}
                title="Click to copy exact amount"
                className="cursor-pointer group text-right"
              >
                <span
                  className={`text-2xl font-extrabold tabular-nums tracking-tight block ${
                    share.isPayer ? 'text-white' : 'text-neutral-900 dark:text-white'
                  }`}
                >
                  {formatCurrency(share.totalAmount, currency)}
                </span>
                <span
                  className={`text-[10px] uppercase font-mono block transition-opacity ${
                    share.isPayer ? 'text-neutral-300' : 'text-neutral-400 dark:text-slate-500'
                  }`}
                >
                  {copiedAmount ? 'Copied!' : 'Click to copy'}
                </span>
              </button>

              {/* Adjust share button */}
              <div className="mt-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTempAmount(share.totalAmount.toFixed(currencyConfig.decimals));
                    setIsEditingAmount(true);
                  }}
                  className={`text-[11px] font-medium underline transition-colors cursor-pointer flex items-center gap-0.5 ${
                    share.isPayer ? 'text-neutral-300 hover:text-white' : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Sliders className="h-2.5 w-2.5" />
                  <span>Adjust</span>
                </button>

                {share.isManual && (
                  <>
                    <span className="text-neutral-300 dark:text-slate-600">·</span>
                    <button
                      type="button"
                      onClick={handleRevertToAuto}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-800 underline transition-colors cursor-pointer flex items-center gap-0.5"
                      title="Revert this person to automatic equal split"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      <span>Auto</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown footer */}
      <div
        className={`mt-4 pt-3 border-t text-xs flex flex-wrap items-center justify-between gap-2 ${
          share.isPayer
            ? 'border-neutral-800 text-neutral-300'
            : 'border-neutral-100 dark:border-slate-800 text-neutral-500 dark:text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>Meal: {formatCurrency(share.baseAmount, currency)}</span>
          <span aria-hidden="true">·</span>
          <span>Tip: {formatCurrency(share.tipAmount, currency)}</span>
          {share.taxAmount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>Tax: {formatCurrency(share.taxAmount, currency)}</span>
            </>
          )}
          {share.hasPennyAdjustment && (
            <>
              <span aria-hidden="true">·</span>
              <span
                className={`font-semibold ${
                  share.isPayer ? 'text-amber-300' : 'text-amber-600 dark:text-amber-400'
                }`}
                title="Balanced odd penny so receipt matches strictly"
              >
                +1¢ cent balance
              </span>
            </>
          )}
        </div>

        {!share.isPayer && (
          <button
            type="button"
            onClick={() => onSetPayer(share.index)}
            className="text-[11px] font-medium text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white underline transition-colors cursor-pointer"
          >
            Mark as payer
          </button>
        )}
      </div>
    </div>
  );
};
