import React from 'react';
import {
  Sparkles,
  RotateCcw,
  Share2,
  ShieldCheck,
  Check,
  FolderArchive,
  QrCode,
  Printer,
  Dices,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { ThemeMode } from '../types/bill';

interface TopNavProps {
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  savedSplitsCount: number;
  onOpenSavedSplits: () => void;
  onOpenQRCode: () => void;
  onOpenReceiptPreview: () => void;
  onOpenCardRoulette: () => void;
  onPrintBill: () => void;
  onSaveCurrentSplit: () => void;
  onRandomize: () => void;
  onReset: () => void;
  onOpenStressTests: () => void;
  onShare: () => void;
  copiedShareLink: boolean;
  canSave: boolean;
  canScanQR: boolean;
  hasCalculated: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  themeMode,
  onThemeModeChange,
  savedSplitsCount,
  onOpenSavedSplits,
  onOpenQRCode,
  onOpenReceiptPreview,
  onOpenCardRoulette,
  onPrintBill,
  onSaveCurrentSplit,
  onRandomize,
  onReset,
  onOpenStressTests,
  onShare,
  copiedShareLink,
  canSave,
  canScanQR,
  hasCalculated,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-base shadow-sm">
            TF
          </div>
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white hover:text-neutral-700 dark:hover:text-slate-200 transition-colors"
          >
            TabFast
          </a>
          <span className="hidden sm:inline-block text-xs font-medium text-neutral-500 dark:text-slate-400 border-l border-neutral-300 dark:border-slate-700 pl-3">
            Instant Bill Splitter
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-slate-300">
          <a
            href="#calculator"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Calculator
          </a>
          <a
            href="#results"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Split Ledger
          </a>
          <button
            type="button"
            onClick={onOpenCardRoulette}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium"
          >
            <Dices className="h-4 w-4 text-amber-500" />
            <span>Roulette</span>
          </button>
          <button
            type="button"
            onClick={onOpenSavedSplits}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium"
          >
            <FolderArchive className="h-4 w-4 text-neutral-500 dark:text-slate-400" />
            <span>Archives</span>
            {savedSplitsCount > 0 && (
              <span className="rounded-full bg-neutral-200 dark:bg-slate-750 px-1.5 py-0.2 text-[10px] font-bold text-neutral-800 dark:text-slate-200">
                {savedSplitsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenStressTests}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tests</span>
          </button>
        </nav>

        {/* Zone 3: Quick Actions + Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Theme Mode Toggle (Default, Light, Dark) */}
          <div className="flex items-center gap-0.5 rounded-xl border border-neutral-200 dark:border-slate-850 bg-neutral-100/90 dark:bg-slate-800/80 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onThemeModeChange('system')}
              title="System Default Theme"
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                themeMode === 'system'
                  ? 'bg-white dark:bg-slate-700 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              aria-label="System default theme"
            >
              <Laptop className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onThemeModeChange('light')}
              title="Light Mode"
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-2xs'
                  : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              aria-label="Light mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onThemeModeChange('dark')}
              title="Dark Mode"
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-2xs'
                  : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              aria-label="Dark mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          {hasCalculated && (
            <button
              type="button"
              onClick={onPrintBill}
              title="Print clean receipt voucher (printer-friendly)"
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-white px-3 py-1.5 text-xs font-bold text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-amber-300 dark:text-amber-500" />
              <span className="hidden sm:inline">Print Bill</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRandomize}
            title="Randomize occasion, bill, and friends"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-700 active:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden sm:inline">Random</span>
          </button>

          <button
            type="button"
            onClick={onShare}
            title="Copy shareable link"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            {copiedShareLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400 hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-neutral-500 dark:text-slate-400" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Reset all inputs"
            className="inline-flex items-center justify-center rounded-xl p-2 text-neutral-500 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Reset bill"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
