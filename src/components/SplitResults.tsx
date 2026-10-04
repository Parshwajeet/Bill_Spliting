import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  CreditCard,
  MessageCircle,
  AlertTriangle,
  RotateCcw,
  Sliders,
  BookmarkPlus,
  QrCode,
  Receipt,
  Send,
  Dices,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { CurrencyCode, SplitResult, ViewMode } from '../types/bill';
import { formatCurrency } from '../utils/billCalculator';
import { PersonCard } from './PersonCard';

interface SplitResultsProps {
  result: SplitResult;
  occasion: string;
  currency: CurrencyCode;
  onUpdateName: (index: number, newName: string) => void;
  onSetPayer: (index: number) => void;
  onManualAmountChange: (index: number, amount: number | null) => void;
  onResetAllManual: () => void;
  onSaveSplit: () => void;
  onOpenQRCode: () => void;
  onOpenReceiptPreview: () => void;
  onOpenPayLinks: () => void;
  onOpenCardRoulette: () => void;
  onPrintBill: () => void;
  onDistributeRemaining: () => void;
}

export const SplitResults: React.FC<SplitResultsProps> = ({
  result,
  occasion,
  currency,
  onUpdateName,
  onSetPayer,
  onManualAmountChange,
  onResetAllManual,
  onSaveSplit,
  onOpenQRCode,
  onOpenReceiptPreview,
  onOpenPayLinks,
  onOpenCardRoulette,
  onPrintBill,
  onDistributeRemaining,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const payerShare = result.shares[result.payerIndex] || result.shares[0];
  const payerName = payerShare ? payerShare.name : 'Payer';

  // Construct WhatsApp / text summary
  const generateTextSummary = () => {
    const lines = [
      `🧾 Bill Split: ${occasion}`,
      `Total: ${formatCurrency(result.grandTotal, currency)} (${result.peopleCount} people)`,
      result.splitMode === 'uneven'
        ? `Mode: Uneven Split (${result.manualCount} manual, ${result.autoCount} auto)`
        : `Mode: Equal Split`,
      result.tipAmount > 0
        ? `Tip included: ${result.tipPercentage}% (${formatCurrency(result.tipAmount, currency)})`
        : null,
      result.discountAmount > 0
        ? `Discount deducted: -${formatCurrency(result.discountAmount, currency)}`
        : null,
      ``,
      `💳 Paid by: ${payerName}`,
      ``,
      `Individual Shares:`,
      ...result.shares.map((s) => {
        const tag = s.isManual ? ' [custom]' : '';
        if (s.isPayer) {
          return `• ${s.name}: ${formatCurrency(s.totalAmount, currency)}${tag} (PAID THE BILL)`;
        }
        return `• ${s.name}: owes ${payerName} ${formatCurrency(s.totalAmount, currency)}${tag}`;
      }),
      ``,
      `Calculated with TabFast ⚡`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  const copyToClipboard = (type: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const isOverAllocated = result.unassignedAmount < 0;
  const isUnderAllocated = result.unassignedAmount > 0 && result.autoCount === 0;

  return (
    <section id="results" aria-label="Split results" className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm backdrop-blur-md transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
                Settlement Result
              </span>
              <span className="text-xs font-mono font-medium text-neutral-400 dark:text-slate-600">·</span>
              <span className="text-xs font-medium text-neutral-600 dark:text-slate-300">
                {result.splitMode === 'uneven' ? 'Custom Uneven Split' : 'Even Split'}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {occasion || 'Dinner Split'}
            </h2>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onPrintBill}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-white px-3.5 py-2 text-xs font-bold text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-slate-100 active:scale-98 transition-all shadow-xs cursor-pointer"
              title="Print clean receipt summary (printer-friendly format)"
            >
              <Printer className="h-3.5 w-3.5 text-amber-300 dark:text-amber-500" />
              <span>Print Bill</span>
            </button>

            <button
              type="button"
              onClick={onOpenReceiptPreview}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer"
              title="Preview authentic restaurant thermal receipt"
            >
              <Receipt className="h-3.5 w-3.5 text-neutral-600 dark:text-slate-400" />
              <span>Receipt View</span>
            </button>

            <button
              type="button"
              onClick={onOpenPayLinks}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer"
              title="Send Venmo/CashApp 1-click pay links to friends"
            >
              <Send className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Pay Links</span>
            </button>

            <button
              type="button"
              onClick={onOpenCardRoulette}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer"
              title="Play Credit Card Roulette to pick who pays"
            >
              <Dices className="h-3.5 w-3.5 text-amber-500" />
              <span>Roulette</span>
            </button>

            <button
              type="button"
              onClick={onOpenQRCode}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer"
              title="Show QR Code for friends to scan with camera"
            >
              <QrCode className="h-3.5 w-3.5 text-neutral-900 dark:text-slate-200" />
              <span>QR</span>
            </button>

            <button
              type="button"
              onClick={onSaveSplit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer"
            >
              <BookmarkPlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Save</span>
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard('whatsapp', generateTextSummary())}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer"
            >
              {copiedType === 'whatsapp' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Chat Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Top 3 High-Impact Figures */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-100 dark:border-slate-800 bg-neutral-50/70 dark:bg-slate-800/60 p-4 transition-colors">
            <span className="text-xs font-medium text-neutral-500 dark:text-slate-400">
              {result.manualCount > 0 ? 'Average Per Person' : 'Each Person Pays'}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
                {formatCurrency(result.effectivePerPerson, currency)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-slate-400 font-mono">avg</span>
            </div>
            <span className="mt-1 block text-[11px] text-neutral-500 dark:text-slate-400">
              {result.manualCount > 0
                ? `${result.manualCount} manual, ${result.autoCount} auto shares`
                : `Split evenly across ${result.peopleCount} friends`}
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-100 dark:border-slate-800 bg-neutral-50/70 dark:bg-slate-800/60 p-4 transition-colors">
            <span className="text-xs font-medium text-neutral-500 dark:text-slate-400">Grand Total with Tip</span>
            <div className="mt-1">
              <span className="text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
                {formatCurrency(result.grandTotal, currency)}
              </span>
            </div>
            <span className="mt-1 block text-[11px] text-neutral-500 dark:text-slate-400">
              Base: {formatCurrency(result.subtotal, currency)}
              {result.discountAmount > 0 && ` - Disc: ${formatCurrency(result.discountAmount, currency)}`}
              {` + Tip: ${formatCurrency(result.tipAmount, currency)}`}
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-100 dark:border-slate-800 bg-neutral-50/70 dark:bg-slate-800/60 p-4 transition-colors">
            <span className="text-xs font-medium text-neutral-500 dark:text-slate-400">Table Payer</span>
            <div className="mt-1">
              <span className="text-2xl font-extrabold text-neutral-900 dark:text-white truncate block">
                {payerName}
              </span>
            </div>
            <span className="mt-1 block text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              Collects {formatCurrency(result.grandTotal - payerShare.totalAmount, currency)} from {result.peopleCount - 1} friends
            </span>
          </div>
        </div>

        {/* Allocation Balance or Penny Verification Banner */}
        {isOverAllocated ? (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Over-Allocated:</strong> The sum of individual shares ({formatCurrency(result.totalSumOfShares, currency)}) exceeds the bill total by{' '}
                <strong className="font-mono">{formatCurrency(Math.abs(result.unassignedAmount), currency)}</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={onResetAllManual}
              className="font-semibold underline hover:text-amber-950 dark:hover:text-white cursor-pointer self-start sm:self-auto"
            >
              Reset to equal split
            </button>
          </div>
        ) : isUnderAllocated ? (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-4 py-3 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                <strong>Under-Allocated:</strong> All shares are manual, leaving{' '}
                <strong className="font-mono">{formatCurrency(result.unassignedAmount, currency)}</strong> unassigned.
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-neutral-100/80 dark:bg-slate-800/80 px-4 py-3 text-xs text-neutral-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Accurate Balance:</strong> Sum of all {result.peopleCount} shares equals{' '}
                <strong className="font-mono">{formatCurrency(result.totalSumOfShares, currency)}</strong>, perfectly matching the total.
              </span>
            </div>
            {result.manualCount > 0 ? (
              <span className="font-mono text-neutral-500 dark:text-slate-400 text-[11px]">
                {result.manualCount} manual · {result.autoCount} auto
              </span>
            ) : result.pennyAdjustmentCount > 0 ? (
              <span className="hidden sm:inline-block font-mono text-neutral-500 dark:text-slate-400 text-[11px]">
                {result.pennyAdjustmentCount} share{result.pennyAdjustmentCount > 1 ? 's' : ''} adjusted by +1¢
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Guest Shares Section - With View Mode Switcher (Cards vs Ledger Table) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Guest Shares ({result.shares.length} People)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              Click <strong className="text-neutral-700 dark:text-slate-300">Adjust</strong> on any friend to set a custom share.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`rounded-lg p-1.5 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-neutral-900 dark:bg-slate-700 text-white shadow-2xs'
                    : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Card View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="text-[11px] hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-lg p-1.5 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-neutral-900 dark:bg-slate-700 text-white shadow-2xs'
                    : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Compact Table Ledger View"
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span className="text-[11px] hidden sm:inline">Table</span>
              </button>
            </div>

            {result.manualCount > 0 && (
              <button
                type="button"
                onClick={onResetAllManual}
                className="text-xs text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset all</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode 1: Cards View */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {result.shares.map((share) => (
              <PersonCard
                key={share.id}
                share={share}
                currency={currency}
                payerName={payerName}
                isUnevenMode={result.splitMode === 'uneven'}
                onNameChange={onUpdateName}
                onSetPayer={onSetPayer}
                onManualAmountChange={onManualAmountChange}
              />
            ))}
          </div>
        ) : (
          /* View Mode 2: Compact Ledger Table View */
          <div className="rounded-2xl border border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-slate-800/80 border-b border-neutral-200 dark:border-slate-750 text-neutral-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Friend</th>
                    <th className="py-3 px-4">Status / Role</th>
                    <th className="py-3 px-4 text-right">Meal</th>
                    <th className="py-3 px-4 text-right">Tip</th>
                    <th className="py-3 px-4 text-right">Total Share</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800 font-medium">
                  {result.shares.map((share) => (
                    <tr
                      key={share.id}
                      className={`hover:bg-neutral-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        share.isPayer
                          ? 'bg-neutral-900/5 dark:bg-slate-800/60 font-semibold'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-neutral-400 dark:text-slate-500 font-mono">
                        {share.index + 1}
                      </td>
                      <td className="py-3 px-4 text-neutral-900 dark:text-white font-bold">
                        {share.name}
                      </td>
                      <td className="py-3 px-4">
                        {share.isPayer ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            Paid Table Bill
                          </span>
                        ) : (
                          <span className="text-neutral-500 dark:text-slate-400">
                            Owes {payerName}
                          </span>
                        )}
                        {share.isManual && (
                          <span className="ml-2 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded font-semibold">
                            manual
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-neutral-600 dark:text-slate-300 font-mono">
                        {formatCurrency(share.baseAmount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-neutral-600 dark:text-slate-300 font-mono">
                        {formatCurrency(share.tipAmount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-sm font-extrabold text-neutral-900 dark:text-white font-mono">
                        {formatCurrency(share.totalAmount, currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!share.isPayer && (
                          <button
                            type="button"
                            onClick={() => onSetPayer(share.index)}
                            className="text-[11px] text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
                          >
                            Mark payer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Settlement Debt Instructions Card */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm backdrop-blur-md transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-neutral-600 dark:text-slate-400" />
            Who Sends What to Settle Up
          </h3>

          <button
            type="button"
            onClick={onOpenPayLinks}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Send className="h-3 w-3" />
            <span>1-Click Pay Links (Venmo / CashApp)</span>
          </button>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-slate-800">
          {result.shares
            .filter((s) => !s.isPayer)
            .map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-neutral-900 dark:text-white">{s.name}</span>
                  {s.isManual && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded font-medium">
                      custom
                    </span>
                  )}
                  <span className="text-neutral-500 dark:text-slate-400">sends</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{payerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-neutral-900 dark:text-white text-base">
                    {formatCurrency(s.totalAmount, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `req-${s.id}`,
                        `Hey ${s.name}, your share for ${occasion} is ${formatCurrency(
                          s.totalAmount,
                          currency
                        )} to ${payerName}.`
                      )
                    }
                    className="rounded-lg border border-neutral-200 dark:border-slate-700 p-1.5 text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Copy request text"
                    aria-label={`Copy request text for ${s.name}`}
                  >
                    {copiedType === `req-${s.id}` ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};
