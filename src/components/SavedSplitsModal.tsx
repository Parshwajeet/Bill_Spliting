import React, { useState } from 'react';
import {
  FolderArchive,
  Download,
  Trash2,
  X,
  Clock,
  Users,
  Check,
} from 'lucide-react';
import { SavedSplit } from '../types/bill';
import { formatCurrency } from '../utils/billCalculator';

interface SavedSplitsModalProps {
  isOpen: boolean;
  savedSplits: SavedSplit[];
  onClose: () => void;
  onLoadSplit: (split: SavedSplit) => void;
  onDeleteSplit: (id: string) => void;
}

export const SavedSplitsModal: React.FC<SavedSplitsModalProps> = ({
  isOpen,
  savedSplits,
  onClose,
  onLoadSplit,
  onDeleteSplit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSplits = savedSplits.filter((s) =>
    s.occasion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sharesSummary.some((sh) => sh.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedSplits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tabfast_saved_splits_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-splits-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-neutral-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-slate-800 text-neutral-800 dark:text-slate-200">
              <FolderArchive className="h-5 w-5" />
            </div>
            <div>
              <h2 id="saved-splits-title" className="text-base font-bold text-neutral-900 dark:text-white">
                Saved Splits & History
              </h2>
              <p className="text-xs text-neutral-500 dark:text-slate-400">
                {savedSplits.length} {savedSplits.length === 1 ? 'split' : 'splits'} saved in local system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedSplits.length > 0 && (
              <button
                type="button"
                onClick={handleExportJSON}
                title="Export all saved splits as JSON file"
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export JSON</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-800 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close saved splits modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search bar when multiple splits */}
        {savedSplits.length > 2 && (
          <div className="px-6 py-2.5 bg-neutral-50 dark:bg-slate-800/60 border-b border-neutral-200 dark:border-slate-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by occasion or friend name..."
              className="w-full rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {savedSplits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-slate-800 text-neutral-400 dark:text-slate-500 mb-4">
                <FolderArchive className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                No Saved Splits Yet
              </h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-slate-400 max-w-sm">
                Split your dinner bill, then click <strong className="text-neutral-800 dark:text-slate-200">"Save"</strong> to archive the occasion, totals, and individual shares for instant retrieval anytime.
              </p>
            </div>
          ) : filteredSplits.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500 dark:text-slate-400">
              No saved splits found matching "{searchQuery}".
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSplits.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-5 transition-all hover:border-neutral-300 dark:hover:border-slate-700 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                          {item.occasion || 'Untitled Dinner'}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-500 dark:text-slate-400">
                          {item.splitMode === 'uneven' ? 'Custom Uneven Split' : 'Even Split'}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-neutral-400" />
                          {formatDate(item.createdAt)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-neutral-800 dark:text-slate-200">
                          <Users className="h-3.5 w-3.5 text-neutral-400" />
                          {item.rawNumPeople} people
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          Total: {formatCurrency(item.grandTotal, item.currency)}
                        </span>
                        {item.tipPercentage > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.tipPercentage}% tip</span>
                          </>
                        )}
                      </div>

                      {/* Shares summary */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-neutral-600 dark:text-slate-300 bg-neutral-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-neutral-100 dark:border-slate-750">
                        {item.sharesSummary.map((share, idx) => (
                          <span key={idx} className="font-mono text-[11px]">
                            <strong className="font-sans font-semibold text-neutral-800 dark:text-slate-200">{share.name}</strong>:{' '}
                            {formatCurrency(share.amount, item.currency)}
                            {share.isManual ? ' (manual)' : ''}
                            {idx < item.sharesSummary.length - 1 ? ' · ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadSplit(item);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-white px-3.5 py-1.5 text-xs font-bold text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Load Split</span>
                      </button>

                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteSplit(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-neutral-300 dark:border-slate-700 p-1.5 text-xs text-neutral-600 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="rounded-lg border border-neutral-200 dark:border-slate-700 p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete saved split"
                          aria-label={`Delete ${item.occasion}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-slate-800 px-6 py-3.5 bg-neutral-50 dark:bg-slate-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-slate-400">
          <span>Saved splits persist across browser reloads.</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-neutral-900 dark:bg-white px-4 py-1.5 font-bold text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
