import {
  BillFormState,
  CurrencyCode,
  RoundingStrategy,
  SavedSplit,
  SplitMode,
} from '../types/bill';

const STORAGE_KEY = 'tabfast_bill_state_v1';
const SAVED_SPLITS_KEY = 'tabfast_saved_splits_v1';

export const DEFAULT_BILL_STATE: BillFormState = {
  occasion: 'Dinner with Friends 🍽️',
  rawBillAmount: '96.50',
  rawNumPeople: '4',
  discountAmount: '',
  tipPercentage: 18,
  customTipPercent: '',
  taxPercentage: 0,
  currency: 'USD',
  roundingStrategy: 'exact_cents',
  splitMode: 'even',
  manualShareAmounts: {},
  payerIndex: 0,
  customNames: ['Alex', 'Taylor', 'Jordan', 'Sam'],
};

/**
 * Loads the initial state from URL query parameters (highest priority) or localStorage.
 */
export function loadPersistedState(): { state: BillFormState; shouldCalculate: boolean } {
  // 1. Try URL parameters first
  if (typeof window !== 'undefined' && window.location.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const billParam = params.get('bill');
      const peopleParam = params.get('people');
      const occasionParam = params.get('occasion');
      const tipParam = params.get('tip');
      const taxParam = params.get('tax');
      const currParam = params.get('curr') as CurrencyCode | null;
      const roundingParam = params.get('rounding') as RoundingStrategy | null;
      const splitModeParam = params.get('mode') as SplitMode | null;
      const manualParam = params.get('manual');
      const namesParam = params.get('names');
      const payerParam = params.get('payer');

      if (billParam !== null || peopleParam !== null || occasionParam !== null) {
        const customNames = namesParam ? namesParam.split(',') : DEFAULT_BILL_STATE.customNames;
        let manualShares: Record<number, number> = {};
        if (manualParam) {
          try {
            manualShares = JSON.parse(decodeURIComponent(manualParam));
          } catch {
            manualShares = {};
          }
        }

        const loadedState: BillFormState = {
          occasion: occasionParam ?? 'Dinner with Friends 🍽️',
          rawBillAmount: billParam ?? '',
          rawNumPeople: peopleParam ?? '',
          tipPercentage: tipParam !== null ? Number(tipParam) : 18,
          customTipPercent: '',
          taxPercentage: taxParam !== null ? Number(taxParam) : 0,
          currency: (currParam && ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'].includes(currParam))
            ? currParam
            : 'USD',
          roundingStrategy: roundingParam ?? 'exact_cents',
          splitMode: splitModeParam === 'uneven' ? 'uneven' : 'even',
          manualShareAmounts: manualShares,
          payerIndex: payerParam !== null ? Number(payerParam) : 0,
          customNames: customNames.length > 0 ? customNames : ['Friend 1', 'Friend 2'],
        };
        return { state: loadedState, shouldCalculate: true };
      }
    } catch (e) {
      console.error('Failed to parse URL query params', e);
    }
  }

  // 2. Try localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.state === 'object') {
          return {
            state: {
              ...DEFAULT_BILL_STATE,
              ...parsed.state,
              manualShareAmounts: parsed.state.manualShareAmounts || {},
              splitMode: parsed.state.splitMode || 'even',
            },
            shouldCalculate: parsed.hasCalculated ?? true,
          };
        }
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
  }

  // 3. Fallback default
  return { state: DEFAULT_BILL_STATE, shouldCalculate: true };
}

/**
 * Persists the current state to localStorage and updates URL query params smoothly.
 */
export function persistState(state: BillFormState, hasCalculated: boolean): void {
  if (typeof window === 'undefined') return;

  // Save to localStorage
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state,
        hasCalculated,
        updatedAt: Date.now(),
      })
    );
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }

  // Update URL without reloading page
  try {
    const url = new URL(window.location.href);
    if (state.rawBillAmount !== '') {
      url.searchParams.set('bill', state.rawBillAmount);
    } else {
      url.searchParams.delete('bill');
    }

    if (state.rawNumPeople !== '') {
      url.searchParams.set('people', state.rawNumPeople);
    } else {
      url.searchParams.delete('people');
    }

    if (state.occasion) {
      url.searchParams.set('occasion', state.occasion);
    }

    url.searchParams.set('tip', String(state.tipPercentage));
    url.searchParams.set('tax', String(state.taxPercentage));
    url.searchParams.set('curr', state.currency);
    url.searchParams.set('rounding', state.roundingStrategy);
    url.searchParams.set('mode', state.splitMode);
    url.searchParams.set('payer', String(state.payerIndex));

    if (state.splitMode === 'uneven' && Object.keys(state.manualShareAmounts).length > 0) {
      url.searchParams.set('manual', encodeURIComponent(JSON.stringify(state.manualShareAmounts)));
    } else {
      url.searchParams.delete('manual');
    }

    if (state.customNames && state.customNames.length > 0) {
      url.searchParams.set('names', state.customNames.slice(0, Number(state.rawNumPeople) || 4).join(','));
    }

    window.history.replaceState({}, '', url.toString());
  } catch (e) {
    console.error('Failed to update URL search params', e);
  }
}

/**
 * Generates a full shareable URL link for friends.
 */
export function getShareableUrl(state: BillFormState): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('bill', state.rawBillAmount);
  url.searchParams.set('people', state.rawNumPeople);
  url.searchParams.set('occasion', state.occasion);
  url.searchParams.set('tip', String(state.tipPercentage));
  url.searchParams.set('tax', String(state.taxPercentage));
  url.searchParams.set('curr', state.currency);
  url.searchParams.set('rounding', state.roundingStrategy);
  url.searchParams.set('mode', state.splitMode);
  url.searchParams.set('payer', String(state.payerIndex));

  if (state.splitMode === 'uneven' && Object.keys(state.manualShareAmounts).length > 0) {
    url.searchParams.set('manual', encodeURIComponent(JSON.stringify(state.manualShareAmounts)));
  }

  if (state.customNames && state.customNames.length > 0) {
    url.searchParams.set('names', state.customNames.slice(0, Number(state.rawNumPeople) || 4).join(','));
  }
  return url.toString();
}

/**
 * Retrieves all saved splits from localStorage
 */
export function getSavedSplits(): SavedSplit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_SPLITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read saved splits', e);
    return [];
  }
}

/**
 * Saves a new split or updates existing split in localStorage
 */
export function saveSplit(split: SavedSplit): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedSplits();
    // Prepend new split or update existing by id
    const filtered = current.filter((s) => s.id !== split.id);
    const updated = [split, ...filtered];
    window.localStorage.setItem(SAVED_SPLITS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save split', e);
  }
}

/**
 * Deletes a split by ID from localStorage
 */
export function deleteSavedSplit(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedSplits();
    const updated = current.filter((s) => s.id !== id);
    window.localStorage.setItem(SAVED_SPLITS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete saved split', e);
  }
}

/**
 * Clears all saved splits
 */
export function clearAllSavedSplits(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SAVED_SPLITS_KEY);
  } catch (e) {
    console.error('Failed to clear saved splits', e);
  }
}
