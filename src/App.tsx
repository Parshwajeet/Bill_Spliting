import React, { useState, useEffect, useRef } from 'react';
import {
  BillFormState,
  SavedSplit,
  SplitResult,
  ThemeMode,
  ValidationResult,
} from './types/bill';
import { calculateSplit, formatCurrency, validateBillInputs } from './utils/billCalculator';
import { generateRandomScenario } from './utils/randomOccasions';
import {
  loadPersistedState,
  persistState,
  getShareableUrl,
  getSavedSplits,
  saveSplit,
  deleteSavedSplit,
  DEFAULT_BILL_STATE,
} from './utils/storage';
import { getInitialTheme, applyTheme } from './utils/theme';
import { TopNav } from './components/TopNav';
import { BillInputCard } from './components/BillInputCard';
import { ErrorAlert } from './components/ErrorAlert';
import { SplitResults } from './components/SplitResults';
import { SavedSplitsModal } from './components/SavedSplitsModal';
import { StressTestSuite } from './components/StressTestSuite';
import { QRCodeModal } from './components/QRCodeModal';
import { PrintableReceipt } from './components/PrintableReceipt';
import { CardRouletteModal } from './components/CardRouletteModal';
import { PaymentLinksModal } from './components/PaymentLinksModal';
import { InteractiveBackground, AmbientTheme } from './components/InteractiveBackground';
import { Sparkles, ShieldCheck, FolderArchive, QrCode, Printer, Dices, ArrowRight, CheckCircle2 } from 'lucide-react';

const AMBIENT_THEME_STORAGE_KEY = 'tabfast_ambient_theme';

export default function App() {
  // Theme state: 'system' | 'light' | 'dark'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialTheme());

  // Apply theme on mount and when changed
  useEffect(() => {
    applyTheme(themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  const handleThemeModeChange = (newMode: ThemeMode) => {
    setThemeMode(newMode);
    applyTheme(newMode);
  };

  // Load initial state with URL params / localStorage persistence
  const [formState, setFormState] = useState<BillFormState>(() => {
    return loadPersistedState().state;
  });

  const [hasUserSplit, setHasUserSplit] = useState<boolean>(() => {
    return loadPersistedState().shouldCalculate;
  });

  const [result, setResult] = useState<SplitResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    billError: null,
    peopleError: null,
    occasionError: null,
    generalErrors: [],
  });

  const [savedSplits, setSavedSplits] = useState<SavedSplit[]>([]);
  const [isSavedSplitsOpen, setIsSavedSplitsOpen] = useState(false);
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [isCardRouletteOpen, setIsCardRouletteOpen] = useState(false);
  const [isPayLinksOpen, setIsPayLinksOpen] = useState(false);

  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Eye-catching interactive ambient theme
  const [ambientTheme, setAmbientTheme] = useState<AmbientTheme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(AMBIENT_THEME_STORAGE_KEY) as AmbientTheme;
      if (stored && ['bistro', 'emerald', 'sunset', 'midnight', 'neon'].includes(stored)) {
        return stored;
      }
    }
    return 'bistro';
  });

  const billInputRef = useRef<HTMLInputElement>(null);
  const peopleInputRef = useRef<HTMLInputElement>(null);

  // Load saved splits from storage on mount
  useEffect(() => {
    setSavedSplits(getSavedSplits());
  }, []);

  const handleAmbientThemeChange = (newTheme: AmbientTheme) => {
    setAmbientTheme(newTheme);
    try {
      window.localStorage.setItem(AMBIENT_THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  // Perform split calculation
  const executeSplit = (stateToCalculate: BillFormState) => {
    const val = validateBillInputs(
      stateToCalculate.rawBillAmount,
      stateToCalculate.rawNumPeople,
      stateToCalculate.occasion
    );
    setValidation(val);

    if (!val.isValid) {
      setResult(null);
      persistState(stateToCalculate, false);
      return;
    }

    const calcResult = calculateSplit(stateToCalculate, stateToCalculate.customNames);
    setResult(calcResult);
    persistState(stateToCalculate, true);
  };

  // Initial load effect (handles reload persistence)
  useEffect(() => {
    if (hasUserSplit) {
      executeSplit(formState);
    }
  }, []);

  // Update form state handler
  const handleFormChange = (updates: Partial<BillFormState>) => {
    const nextState = { ...formState, ...updates };

    // Synchronize customNames array size when people count changes
    if (updates.rawNumPeople !== undefined) {
      const newCount = parseInt(updates.rawNumPeople, 10);
      if (!isNaN(newCount) && newCount > 0 && newCount <= 500) {
        const updatedNames = [...nextState.customNames];
        while (updatedNames.length < newCount) {
          updatedNames.push(`Friend ${updatedNames.length + 1}`);
        }
        nextState.customNames = updatedNames;
      }
    }

    setFormState(nextState);

    // Live validate if previously calculated or had errors
    if (hasUserSplit || !validation.isValid) {
      const val = validateBillInputs(
        nextState.rawBillAmount,
        nextState.rawNumPeople,
        nextState.occasion
      );
      setValidation(val);

      if (val.isValid) {
        const calcResult = calculateSplit(nextState, nextState.customNames);
        setResult(calcResult);
        persistState(nextState, true);
      } else {
        setResult(null);
        persistState(nextState, false);
      }
    } else {
      persistState(nextState, false);
    }
  };

  // Primary "Split Bill Now" action
  const handleSplitClick = () => {
    setHasUserSplit(true);
    executeSplit(formState);

    const val = validateBillInputs(
      formState.rawBillAmount,
      formState.rawNumPeople,
      formState.occasion
    );
    if (val.isValid) {
      setTimeout(() => {
        const resultsEl = document.getElementById('results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  // Print Bill Action
  const handlePrintBill = () => {
    if (!result || !validation.isValid) {
      showToast('Please enter a valid bill amount before printing.');
      return;
    }
    window.print();
  };

  // "Randomize Scenario" action
  const handleRandomize = () => {
    const scenario = generateRandomScenario();
    const nextState: BillFormState = {
      ...formState,
      occasion: scenario.occasion,
      rawBillAmount: scenario.billAmount.toFixed(2),
      rawNumPeople: String(scenario.peopleCount),
      discountAmount: '',
      tipPercentage: scenario.tipPercentage,
      taxPercentage: scenario.taxPercentage,
      splitMode: 'even',
      manualShareAmounts: {},
      payerIndex: 0,
      customNames: scenario.sampleNames,
    };

    setFormState(nextState);
    setHasUserSplit(true);
    executeSplit(nextState);

    showToast(`Loaded "${scenario.occasion}" with ${scenario.peopleCount} friends!`);
  };

  // Reset all fields
  const handleReset = () => {
    const emptyState: BillFormState = {
      ...DEFAULT_BILL_STATE,
      occasion: '',
      rawBillAmount: '',
      rawNumPeople: '2',
      discountAmount: '',
      tipPercentage: 18,
      splitMode: 'even',
      manualShareAmounts: {},
      payerIndex: 0,
      customNames: ['Friend 1', 'Friend 2'],
    };
    setFormState(emptyState);
    setHasUserSplit(false);
    setResult(null);
    setValidation({
      isValid: true,
      billError: null,
      peopleError: null,
      occasionError: null,
      generalErrors: [],
    });
    persistState(emptyState, false);
    showToast('Reset calculator form.');
  };

  // Share URL handler
  const handleShare = () => {
    const url = getShareableUrl(formState);
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    showToast('Copied shareable bill link to clipboard!');
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  // Rename friend handler
  const handleUpdateName = (index: number, newName: string) => {
    const updatedNames = [...formState.customNames];
    updatedNames[index] = newName;
    const nextState = { ...formState, customNames: updatedNames };
    setFormState(nextState);
    if (result) {
      const updatedResult = calculateSplit(nextState, updatedNames);
      setResult(updatedResult);
    }
    persistState(nextState, true);
  };

  // Set who paid handler
  const handleSetPayer = (index: number) => {
    const nextState = { ...formState, payerIndex: index };
    setFormState(nextState);
    if (result) {
      const updatedResult = calculateSplit(nextState, nextState.customNames);
      setResult(updatedResult);
    }
    persistState(nextState, true);
    const payerName = formState.customNames[index] || `Friend ${index + 1}`;
    showToast(`Marked ${payerName} as the table payer.`);
  };

  // Manual amount adjustment handler
  const handleManualAmountChange = (index: number, amount: number | null) => {
    const nextManual = { ...formState.manualShareAmounts };
    if (amount === null) {
      delete nextManual[index];
    } else {
      nextManual[index] = amount;
    }

    const nextState: BillFormState = {
      ...formState,
      splitMode: Object.keys(nextManual).length > 0 ? 'uneven' : 'even',
      manualShareAmounts: nextManual,
    };

    setFormState(nextState);
    const updatedResult = calculateSplit(nextState, nextState.customNames);
    setResult(updatedResult);
    persistState(nextState, true);

    const personName = formState.customNames[index] || `Friend ${index + 1}`;
    if (amount !== null) {
      showToast(`Set ${personName}'s share to ${formatCurrency(amount, formState.currency)}.`);
    } else {
      showToast(`Reverted ${personName}'s share to auto-split.`);
    }
  };

  // Reset all manual overrides back to even split
  const handleResetAllManual = () => {
    const nextState: BillFormState = {
      ...formState,
      splitMode: 'even',
      manualShareAmounts: {},
    };
    setFormState(nextState);
    const updatedResult = calculateSplit(nextState, nextState.customNames);
    setResult(updatedResult);
    persistState(nextState, true);
    showToast('Reset all shares to equal split.');
  };

  // Save Split feature implementation
  const handleSaveCurrentSplit = () => {
    if (!result || !validation.isValid) {
      showToast('Cannot save an empty or invalid bill.');
      return;
    }

    const occasionTitle = formState.occasion.trim() || 'Dinner Split';
    const newSavedSplit: SavedSplit = {
      id: `split-${Date.now()}`,
      createdAt: Date.now(),
      occasion: occasionTitle,
      rawBillAmount: formState.rawBillAmount,
      rawNumPeople: formState.rawNumPeople,
      tipPercentage: formState.tipPercentage,
      taxPercentage: formState.taxPercentage,
      currency: formState.currency,
      roundingStrategy: formState.roundingStrategy,
      splitMode: formState.splitMode,
      manualShareAmounts: { ...formState.manualShareAmounts },
      payerIndex: formState.payerIndex,
      customNames: [...formState.customNames],
      grandTotal: result.grandTotal,
      sharesSummary: result.shares.map((s) => ({
        name: s.name,
        amount: s.totalAmount,
        isManual: s.isManual,
      })),
    };

    saveSplit(newSavedSplit);
    setSavedSplits(getSavedSplits());
    showToast(`✓ Saved "${occasionTitle}" to your split history!`);
  };

  // Load Split feature implementation
  const handleLoadSplit = (saved: SavedSplit) => {
    const loadedState: BillFormState = {
      occasion: saved.occasion,
      rawBillAmount: saved.rawBillAmount,
      rawNumPeople: saved.rawNumPeople,
      discountAmount: '',
      tipPercentage: saved.tipPercentage,
      customTipPercent: '',
      taxPercentage: saved.taxPercentage,
      currency: saved.currency,
      roundingStrategy: saved.roundingStrategy,
      splitMode: saved.splitMode,
      manualShareAmounts: { ...(saved.manualShareAmounts || {}) },
      payerIndex: saved.payerIndex,
      customNames: [...saved.customNames],
    };

    setFormState(loadedState);
    setHasUserSplit(true);
    executeSplit(loadedState);
    showToast(`✓ Loaded "${saved.occasion}" (${saved.rawNumPeople} friends, ${formatCurrency(saved.grandTotal, saved.currency)})`);
  };

  // Delete saved split
  const handleDeleteSplit = (id: string) => {
    deleteSavedSplit(id);
    const updated = getSavedSplits();
    setSavedSplits(updated);
    showToast('Deleted split from history.');
  };

  // Load a test case from the stress suite
  const handleLoadTestCase = (testCase: Partial<BillFormState>) => {
    const nextState = { ...formState, ...testCase };
    setFormState(nextState);
    setHasUserSplit(true);
    executeSplit(nextState);
    showToast(`Loaded test case: ${testCase.occasion || 'Test Scenario'}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const canSaveCurrent = Boolean(result && validation.isValid);
  const canScanQR = Boolean(result && validation.isValid);
  const hasCalculated = Boolean(result && validation.isValid);
  const currentShareUrl = getShareableUrl(formState);

  return (
    <div className="relative min-h-screen text-neutral-900 dark:text-slate-100 bg-neutral-50/50 dark:bg-slate-950 selection:bg-neutral-900 selection:text-white transition-colors duration-300">
      {/* Dynamic Interactive Mesh Background */}
      <InteractiveBackground
        currentTheme={ambientTheme}
        onThemeChange={handleAmbientThemeChange}
      />

      {/* Dedicated Print-Only Thermal Receipt: Mounted directly for @media print */}
      {result && (
        <PrintableReceipt
          result={result}
          occasion={formState.occasion}
          currency={formState.currency}
          shareUrl={currentShareUrl}
          isPrintOnly={true}
        />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 no-print flex flex-col min-h-screen">
        {/* Top 3-Zone Navigation with Theme Switcher */}
        <TopNav
          themeMode={themeMode}
          onThemeModeChange={handleThemeModeChange}
          savedSplitsCount={savedSplits.length}
          onOpenSavedSplits={() => setIsSavedSplitsOpen(true)}
          onOpenQRCode={() => setIsQRCodeOpen(true)}
          onOpenReceiptPreview={() => setIsReceiptPreviewOpen(true)}
          onOpenCardRoulette={() => setIsCardRouletteOpen(true)}
          onPrintBill={handlePrintBill}
          onSaveCurrentSplit={handleSaveCurrentSplit}
          onRandomize={handleRandomize}
          onReset={handleReset}
          onOpenStressTests={() => setIsStressTestOpen(true)}
          onShare={handleShare}
          copiedShareLink={copiedShareLink}
          canSave={canSaveCurrent}
          canScanQR={canScanQR}
          hasCalculated={hasCalculated}
        />

        {/* Spacious, Multi-Column Main Content Container (No Congestion!) */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
          {/* Header Hero Area */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                  Split the Bill Instantly.
                </h1>
                <p className="mt-2 text-sm text-neutral-600 dark:text-slate-400 max-w-2xl">
                  Fast group dining settlement with penny-accurate cent distribution, custom uneven shares, receipt printing, and 1-click pay links.
                </p>
              </div>

              {/* Quick Hero Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-white active:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Random Dinner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCardRouletteOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-white active:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
                >
                  <Dices className="h-3.5 w-3.5 text-amber-500" />
                  <span>Card Roulette</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSavedSplitsOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-white active:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
                >
                  <FolderArchive className="h-3.5 w-3.5 text-neutral-500 dark:text-slate-400" />
                  <span>Archives ({savedSplits.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsStressTestOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-slate-200 hover:bg-white active:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Stress Tests</span>
                </button>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN EXPANDED LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* COLUMN 1: Inputs & Config Options (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <BillInputCard
                formState={formState}
                validation={validation}
                onChange={handleFormChange}
                onSplit={handleSplitClick}
                onRandomize={handleRandomize}
                onSaveSplit={handleSaveCurrentSplit}
                onOpenSavedSplits={() => setIsSavedSplitsOpen(true)}
                savedSplitsCount={savedSplits.length}
                canSave={canSaveCurrent}
                billInputRef={billInputRef}
                peopleInputRef={peopleInputRef}
              />

              {/* Error Alert Display: Rendered when bill or people is empty, zero or negative */}
              {!validation.isValid && (
                <ErrorAlert
                  validation={validation}
                  onFixBillClick={() => billInputRef.current?.focus()}
                  onFixPeopleClick={() => peopleInputRef.current?.focus()}
                />
              )}
            </div>

            {/* COLUMN 2: Live Results & Guest Ledger (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {validation.isValid && result ? (
                <SplitResults
                  result={result}
                  occasion={formState.occasion}
                  currency={formState.currency}
                  onUpdateName={handleUpdateName}
                  onSetPayer={handleSetPayer}
                  onManualAmountChange={handleManualAmountChange}
                  onResetAllManual={handleResetAllManual}
                  onSaveSplit={handleSaveCurrentSplit}
                  onOpenQRCode={() => setIsQRCodeOpen(true)}
                  onOpenReceiptPreview={() => setIsReceiptPreviewOpen(true)}
                  onOpenPayLinks={() => setIsPayLinksOpen(true)}
                  onOpenCardRoulette={() => setIsCardRouletteOpen(true)}
                  onPrintBill={handlePrintBill}
                  onDistributeRemaining={() => {}}
                />
              ) : (
                /* Uncongested Ready State When No Results Yet */
                <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-10 text-center backdrop-blur-xs flex flex-col items-center justify-center min-h-[380px]">
                  <div className="h-14 w-14 rounded-2xl bg-neutral-100 dark:bg-slate-800 text-neutral-400 dark:text-slate-500 flex items-center justify-center mb-4">
                    <Sparkles className="h-7 w-7 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Enter Bill Details to Split
                  </h3>
                  <p className="mt-1.5 text-xs text-neutral-500 dark:text-slate-400 max-w-sm">
                    Enter the total amount and guest count on the left, then click <strong>"Split Bill Now"</strong> or try a random dinner scenario!
                  </p>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-900 dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-neutral-950 hover:bg-neutral-800 transition-all cursor-pointer shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Generate Random Dinner</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Photorealistic Thermal Receipt Preview Modal */}
        {result && (
          <PrintableReceipt
            result={result}
            occasion={formState.occasion}
            currency={formState.currency}
            shareUrl={currentShareUrl}
            isOpen={isReceiptPreviewOpen}
            onClose={() => setIsReceiptPreviewOpen(false)}
          />
        )}

        {/* Credit Card Roulette Game Modal */}
        <CardRouletteModal
          isOpen={isCardRouletteOpen}
          onClose={() => setIsCardRouletteOpen(false)}
          friends={result ? result.shares.map((s) => s.name) : formState.customNames}
          onSelectPayer={handleSetPayer}
        />

        {/* 1-Click Pay Links Modal */}
        {result && (
          <PaymentLinksModal
            isOpen={isPayLinksOpen}
            onClose={() => setIsPayLinksOpen(false)}
            result={result}
            occasion={formState.occasion}
            currency={formState.currency}
          />
        )}

        {/* QR Code Scanner Modal */}
        <QRCodeModal
          isOpen={isQRCodeOpen}
          onClose={() => setIsQRCodeOpen(false)}
          shareUrl={currentShareUrl}
          occasion={formState.occasion}
          grandTotal={result ? result.grandTotal : Number(formState.rawBillAmount) || 0}
          currency={formState.currency}
          peopleCount={result ? result.peopleCount : Number(formState.rawNumPeople) || 4}
        />

        {/* Saved Splits Modal Drawer */}
        <SavedSplitsModal
          isOpen={isSavedSplitsOpen}
          savedSplits={savedSplits}
          onClose={() => setIsSavedSplitsOpen(false)}
          onLoadSplit={handleLoadSplit}
          onDeleteSplit={handleDeleteSplit}
        />

        {/* Stress Test Suite Modal */}
        <StressTestSuite
          isOpen={isStressTestOpen}
          onClose={() => setIsStressTestOpen(false)}
          onLoadTestCase={handleLoadTestCase}
        />

        {/* Ephemeral Toast Alert */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 rounded-2xl bg-neutral-900 dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-neutral-950 shadow-xl transition-all animate-bounce"
          >
            {toastMessage}
          </div>
        )}

        {/* Accessible Footer with Theme indicator */}
        <footer role="contentinfo" className="mt-16 border-t border-neutral-200/80 dark:border-slate-800 py-8 text-center text-xs text-neutral-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>TabFast Bill Engine · Multi-Column Responsive Layout · System / Light / Dark</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handlePrintBill}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Print Bill
              </button>
              <button
                type="button"
                onClick={() => setIsCardRouletteOpen(true)}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Credit Card Roulette
              </button>
              <button
                type="button"
                onClick={() => setIsSavedSplitsOpen(true)}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Saved Splits ({savedSplits.length})
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
