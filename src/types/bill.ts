export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
};

export type RoundingStrategy = 'exact_cents' | 'round_dollar_up' | 'round_50c';

export type SplitMode = 'even' | 'uneven';

export type ThemeMode = 'system' | 'light' | 'dark';

export type ViewMode = 'cards' | 'table';

export interface PersonShare {
  id: string;
  index: number;
  name: string;
  baseAmount: number;
  tipAmount: number;
  taxAmount: number;
  roundingSurplus: number;
  totalAmount: number;
  hasPennyAdjustment: boolean;
  isManual: boolean;
  isPayer: boolean;
  amountOwedToPayer: number;
}

export interface SplitResult {
  subtotal: number;
  discountAmount: number;
  tipPercentage: number;
  tipAmount: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  effectivePerPerson: number;
  peopleCount: number;
  roundingStrategy: RoundingStrategy;
  roundingTotalSurplus: number;
  pennyAdjustmentCount: number;
  shares: PersonShare[];
  payerIndex: number;
  totalSumOfShares: number;
  isExactMatch: boolean;
  unassignedAmount: number;
  splitMode: SplitMode;
  manualCount: number;
  autoCount: number;
  calculatedAt: string;
}

export interface BillFormState {
  occasion: string;
  rawBillAmount: string;
  rawNumPeople: string;
  discountAmount?: string;
  tipPercentage: number;
  customTipPercent: string;
  taxPercentage: number;
  currency: CurrencyCode;
  roundingStrategy: RoundingStrategy;
  splitMode: SplitMode;
  manualShareAmounts: Record<number, number>; // maps person index to manual amount
  payerIndex: number;
  customNames: string[];
}

export interface SavedSplit {
  id: string;
  createdAt: number;
  occasion: string;
  rawBillAmount: string;
  rawNumPeople: string;
  tipPercentage: number;
  taxPercentage: number;
  currency: CurrencyCode;
  roundingStrategy: RoundingStrategy;
  splitMode: SplitMode;
  manualShareAmounts: Record<number, number>;
  payerIndex: number;
  customNames: string[];
  grandTotal: number;
  sharesSummary: { name: string; amount: number; isManual: boolean }[];
}

export interface ValidationResult {
  isValid: boolean;
  billError: string | null;
  peopleError: string | null;
  occasionError: string | null;
  generalErrors: string[];
}

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'Edge Case' | 'Validation' | 'Precision Math' | 'Stress Test';
  input: {
    occasion: string;
    bill: number | string;
    people: number | string;
    tip?: number;
    tax?: number;
  };
  expectedBehavior: 'success' | 'error';
  passed: boolean;
  details: string;
  durationMs: number;
}
