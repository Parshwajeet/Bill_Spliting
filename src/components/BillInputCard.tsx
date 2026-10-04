import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  Calendar,
  Sparkles,
  Plus,
  Minus,
  ArrowRight,
  Coins,
  Scale,
  Sliders,
  BookmarkPlus,
  FolderArchive,
  RotateCcw,
  Percent,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import {
  BillFormState,
  CurrencyCode,
  CURRENCIES,
  RoundingStrategy,
  SplitMode,
  ValidationResult,
} from '../types/bill';
import { SAMPLE_OCCASIONS } from '../utils/randomOccasions';

interface BillInputCardProps {
  formState: BillFormState;
  validation: ValidationResult;
  onChange: (updates: Partial<BillFormState>) => void;
  onSplit: () => void;
  onRandomize: () => void;
  onSaveSplit: () => void;
  onOpenSavedSplits: () => void;
  savedSplitsCount: number;
  canSave: boolean;
  billInputRef?: React.RefObject<HTMLInputElement | null>;
  peopleInputRef?: React.RefObject<HTMLInputElement | null>;
}

const TIP_PRESETS = [0, 10, 15, 18, 20, 25];
const PEOPLE_PRESETS = [2, 3, 4, 5, 6, 8];

export const BillInputCard: React.FC<BillInputCardProps> = ({
  formState,
  validation,
  onChange,
  onSplit,
  onRandomize,
  onSaveSplit,
  onOpenSavedSplits,
  savedSplitsCount,
  canSave,
  billInputRef,
  peopleInputRef,
}) => {
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [showOccasionPresets, setShowOccasionPresets] = useState(false);
  const [activeOptionsTab, setActiveOptionsTab] = useState<'tips' | 'strategy' | 'advanced'>('tips');

  const activeCurrency = CURRENCIES[formState.currency] || CURRENCIES.USD;
  const manualCount = Object.keys(formState.manualShareAmounts || {}).length;

  const handlePeopleStep = (delta: number) => {
    const current = parseInt(formState.rawNumPeople, 10);
    const nextVal = isNaN(current) ? (delta > 0 ? 2 : 1) : Math.max(1, current + delta);
    onChange({ rawNumPeople: String(nextVal) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSplit();
    }
  };

  return (
    <div
      id="calculator"
      className="rounded-3xl border border-neutral-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm backdrop-blur-md transition-colors"
    >
      <div className="flex flex-col gap-6" onKeyDown={handleKeyDown}>
        {/* Mode switcher & Saved Archive Access */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-slate-800 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => onChange({ splitMode: 'even' })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                formState.splitMode === 'even'
                  ? 'bg-white dark:bg-slate-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Scale className="h-3.5 w-3.5 text-neutral-600 dark:text-slate-300" />
              <span>Equal Split</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ splitMode: 'uneven' })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                formState.splitMode === 'uneven'
                  ? 'bg-white dark:bg-slate-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-neutral-600 dark:text-slate-300" />
              <span>Custom Shares</span>
              {manualCount > 0 && formState.splitMode === 'uneven' && (
                <span className="rounded-full bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-bold px-1.5">
                  {manualCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {manualCount > 0 && formState.splitMode === 'uneven' && (
              <button
                type="button"
                onClick={() => onChange({ manualShareAmounts: {} })}
                className="text-xs text-neutral-500 dark:text-slate-400 hover:text-neutral-800 dark:hover:text-slate-200 underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset auto</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSavedSplits}
              className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-white font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-750 bg-neutral-50 dark:bg-slate-800/80 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <FolderArchive className="h-3.5 w-3.5 text-neutral-500 dark:text-slate-400" />
              <span>Archives ({savedSplitsCount})</span>
            </button>
          </div>
        </div>

        {/* Occasion Section */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="occasion-input"
              className="text-xs font-semibold text-neutral-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-neutral-400 dark:text-slate-500" />
              Occasion / Dinner Name
            </label>
            <button
              type="button"
              onClick={() => setShowOccasionPresets(!showOccasionPresets)}
              className="text-xs text-neutral-500 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200 underline transition-colors cursor-pointer"
            >
              {showOccasionPresets ? 'Hide ideas' : 'Popular ideas'}
            </button>
          </div>

          <div className="relative mt-2">
            <input
              id="occasion-input"
              type="text"
              value={formState.occasion}
              onChange={(e) => onChange({ occasion: e.target.value })}
              placeholder="e.g. Sushi Friday with Friends 🍣"
              className="w-full rounded-2xl border border-neutral-300 dark:border-slate-700 bg-neutral-50/60 dark:bg-slate-800/50 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 focus:border-neutral-900 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all font-medium"
            />
          </div>

          {showOccasionPresets && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 pt-1">
              {SAMPLE_OCCASIONS.slice(0, 6).map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => {
                    onChange({ occasion: occ });
                    setShowOccasionPresets(false);
                  }}
                  className="rounded-xl border border-neutral-200 dark:border-slate-700 bg-neutral-100/70 dark:bg-slate-800/80 px-2.5 py-1 text-xs text-neutral-700 dark:text-slate-300 hover:bg-neutral-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {occ}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bill Amount & Number of People (Clean 2-Col Grid) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Bill Amount */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="bill-input"
                className="text-xs font-semibold text-neutral-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
              >
                <DollarSign className="h-3.5 w-3.5 text-neutral-400 dark:text-slate-500" />
                Bill Amount
              </label>
              <div className="flex items-center gap-1">
                <select
                  value={formState.currency}
                  onChange={(e) =>
                    onChange({ currency: e.target.value as CurrencyCode })
                  }
                  aria-label="Currency code"
                  className="rounded-md border-0 bg-transparent text-xs font-semibold text-neutral-700 dark:text-slate-300 focus:ring-0 cursor-pointer"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code} className="dark:bg-slate-900 dark:text-white">
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-base font-semibold text-neutral-500 dark:text-slate-400">
                {activeCurrency.symbol}
              </div>
              <input
                ref={billInputRef}
                id="bill-input"
                type="number"
                step="any"
                inputMode="decimal"
                value={formState.rawBillAmount}
                onChange={(e) => onChange({ rawBillAmount: e.target.value })}
                placeholder="0.00"
                className={`w-full rounded-2xl border pl-9 pr-4 py-3 text-lg font-bold tabular-nums text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 transition-all ${
                  validation.billError
                    ? 'border-red-400 bg-red-50/40 dark:border-red-500 dark:bg-red-950/20'
                    : 'border-neutral-300 dark:border-slate-700 bg-neutral-50/60 dark:bg-slate-800/50 focus:border-neutral-900 dark:focus:border-slate-400'
                }`}
              />
            </div>
            {validation.billError && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {validation.billError}
              </p>
            )}
          </div>

          {/* Number of People */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="people-input"
                className="text-xs font-semibold text-neutral-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5 text-neutral-400 dark:text-slate-500" />
                Friends Count
              </label>
              <span className="text-xs text-neutral-400 dark:text-slate-500">Min 1</span>
            </div>

            <div className="relative mt-2 flex items-center">
              <button
                type="button"
                onClick={() => handlePeopleStep(-1)}
                aria-label="Decrease people count"
                className="inline-flex h-12 w-12 items-center justify-center rounded-l-2xl border border-r-0 border-neutral-300 dark:border-slate-700 bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-200 dark:hover:bg-slate-700 active:bg-neutral-300 transition-colors cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>

              <input
                ref={peopleInputRef}
                id="people-input"
                type="number"
                min="1"
                step="1"
                value={formState.rawNumPeople}
                onChange={(e) => onChange({ rawNumPeople: e.target.value })}
                placeholder="1"
                className={`h-12 w-full text-center border-y text-lg font-bold tabular-nums text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all ${
                  validation.peopleError
                    ? 'border-red-400 bg-red-50/40 dark:border-red-500 dark:bg-red-950/20'
                    : 'border-neutral-300 dark:border-slate-700 bg-neutral-50/60 dark:bg-slate-800/50'
                }`}
              />

              <button
                type="button"
                onClick={() => handlePeopleStep(1)}
                aria-label="Increase people count"
                className="inline-flex h-12 w-12 items-center justify-center rounded-r-2xl border border-l-0 border-neutral-300 dark:border-slate-700 bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-200 dark:hover:bg-slate-700 active:bg-neutral-300 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {validation.peopleError && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {validation.peopleError}
              </p>
            )}

            {/* Quick People Count Presets */}
            <div className="mt-2 flex items-center justify-between gap-1">
              {PEOPLE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ rawNumPeople: String(p) })}
                  className={`rounded-lg py-1 px-2 text-[11px] font-semibold transition-colors cursor-pointer ${
                    Number(formState.rawNumPeople) === p
                      ? 'bg-neutral-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                      : 'bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}p
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Segmented Options Panel - Categorized & Non-Congested */}
        <div className="rounded-2xl border border-neutral-200 dark:border-slate-800 bg-neutral-50/50 dark:bg-slate-800/40 p-4 transition-colors">
          {/* Options Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-slate-750 pb-3 mb-3">
            <span className="text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
              Split Options
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveOptionsTab('tips')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  activeOptionsTab === 'tips'
                    ? 'bg-neutral-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Tip & Tax
              </button>
              <button
                type="button"
                onClick={() => setActiveOptionsTab('strategy')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  activeOptionsTab === 'strategy'
                    ? 'bg-neutral-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Rounding
              </button>
              <button
                type="button"
                onClick={() => setActiveOptionsTab('advanced')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  activeOptionsTab === 'advanced'
                    ? 'bg-neutral-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Discounts
              </button>
            </div>
          </div>

          {/* Option Tab 1: Tip & Tax */}
          {activeOptionsTab === 'tips' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-neutral-500 dark:text-slate-400" />
                  Tip Percentage
                </span>
                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                  {formState.tipPercentage}%
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {TIP_PRESETS.map((preset) => {
                  const isSelected = !showCustomTip && formState.tipPercentage === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setShowCustomTip(false);
                        onChange({ tipPercentage: preset });
                      }}
                      className={`rounded-xl py-2 px-2 text-xs font-semibold tabular-nums transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                          : 'border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset}%
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowCustomTip(!showCustomTip)}
                  className={`rounded-xl py-2 px-2 text-xs font-semibold transition-all cursor-pointer ${
                    showCustomTip
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                      : 'border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Custom
                </button>
              </div>

              {showCustomTip && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative w-32">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formState.tipPercentage}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                        onChange({ tipPercentage: val });
                      }}
                      placeholder="e.g. 18"
                      className="w-full rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold tabular-nums text-neutral-900 dark:text-white focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-xs text-neutral-400 font-bold">%</span>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-slate-400">
                    Custom tip percentage
                  </span>
                </div>
              )}

              {/* Optional Sales Tax */}
              <div className="pt-2 border-t border-neutral-200/60 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-slate-400 flex items-center gap-1">
                  <Percent className="h-3 w-3 text-neutral-400" />
                  Optional Tax %
                </span>
                <div className="relative w-28">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.1"
                    value={formState.taxPercentage || ''}
                    onChange={(e) => onChange({ taxPercentage: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full rounded-lg border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold tabular-nums text-neutral-900 dark:text-white text-right pr-6 focus:outline-none"
                  />
                  <span className="absolute right-2 top-1 text-xs text-neutral-400">%</span>
                </div>
              </div>
            </div>
          )}

          {/* Option Tab 2: Strategy & Rounding */}
          {activeOptionsTab === 'strategy' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-neutral-700 dark:text-slate-300 block">
                  Penny Balancing Strategy
                </span>
                <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                  Eliminates rounding loss so the total sum matches the printed bill.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ roundingStrategy: 'exact_cents' })}
                  className={`rounded-xl p-2.5 text-xs font-medium text-left transition-all cursor-pointer ${
                    formState.roundingStrategy === 'exact_cents'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                      : 'border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100'
                  }`}
                >
                  <span className="font-bold block">Exact Cents</span>
                  <span className="text-[10px] opacity-80">Down to $0.01 precision</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ roundingStrategy: 'round_dollar_up' })}
                  className={`rounded-xl p-2.5 text-xs font-medium text-left transition-all cursor-pointer ${
                    formState.roundingStrategy === 'round_dollar_up'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                      : 'border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100'
                  }`}
                >
                  <span className="font-bold block">Round Up ($1)</span>
                  <span className="text-[10px] opacity-80">Clean whole dollar bills</span>
                </button>
              </div>
            </div>
          )}

          {/* Option Tab 3: Discounts & Voucher Deductions */}
          {activeOptionsTab === 'advanced' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-neutral-700 dark:text-slate-300 block flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-emerald-600" />
                  Bill Discount / Coupon Voucher
                </span>
                <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                  If the restaurant offered a discount or promotional deduction, enter it here.
                </p>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-neutral-400">
                  {activeCurrency.symbol}
                </div>
                <input
                  type="number"
                  step="any"
                  value={formState.discountAmount || ''}
                  onChange={(e) => onChange({ discountAmount: e.target.value })}
                  placeholder="0.00 discount"
                  className="w-full rounded-xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-4 py-2 text-xs font-bold tabular-nums text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSplit}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 dark:bg-white px-6 py-3.5 text-sm font-bold text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-slate-100 active:scale-98 transition-all shadow-sm cursor-pointer"
          >
            <span>Split Bill Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {canSave && (
            <button
              type="button"
              onClick={onSaveSplit}
              title="Save current split calculation"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-sm font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <BookmarkPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Save</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRandomize}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-sm font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Random</span>
          </button>
        </div>
      </div>
    </div>
  );
};
