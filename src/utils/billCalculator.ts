import {
  BillFormState,
  CurrencyCode,
  CURRENCIES,
  PersonShare,
  RoundingStrategy,
  SplitResult,
  ValidationResult,
} from '../types/bill';

/**
 * Validates the bill inputs strictly according to core requirements:
 * Show a message and NO results if the bill or the number of people is empty, zero or negative.
 */
export function validateBillInputs(
  rawBill: string,
  rawPeople: string,
  _occasion: string
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    billError: null,
    peopleError: null,
    occasionError: null,
    generalErrors: [],
  };

  const trimmedBill = rawBill.trim();
  const trimmedPeople = rawPeople.trim();

  // Validate bill amount
  if (trimmedBill === '') {
    result.isValid = false;
    result.billError = 'Bill amount cannot be empty. Please enter the amount.';
  } else {
    const numBill = Number(trimmedBill);
    if (isNaN(numBill)) {
      result.isValid = false;
      result.billError = 'Bill amount must be a valid number (e.g., 85.50).';
    } else if (numBill === 0) {
      result.isValid = false;
      result.billError = 'Bill amount cannot be zero ($0.00). Must be greater than zero.';
    } else if (numBill < 0) {
      result.isValid = false;
      result.billError = `Negative bill amount (${trimmedBill}) is not allowed. Must be positive.`;
    } else if (numBill > 10000000) {
      result.isValid = false;
      result.billError = 'Bill amount exceeds the maximum allowable limit of $10,000,000.';
    }
  }

  // Validate number of people
  if (trimmedPeople === '') {
    result.isValid = false;
    result.peopleError = 'Number of people cannot be empty. Please enter how many friends split.';
  } else {
    const numPeople = Number(trimmedPeople);
    if (isNaN(numPeople)) {
      result.isValid = false;
      result.peopleError = 'Number of people must be a whole number (e.g., 4).';
    } else if (numPeople === 0) {
      result.isValid = false;
      result.peopleError = 'Number of people cannot be zero (0). Must be at least 1 person.';
    } else if (numPeople < 0) {
      result.isValid = false;
      result.peopleError = `Negative number of people (${trimmedPeople}) is invalid. Must be at least 1.`;
    } else if (!Number.isInteger(numPeople)) {
      result.isValid = false;
      result.peopleError = 'Number of people must be a whole integer without decimals.';
    } else if (numPeople > 1000) {
      result.isValid = false;
      result.peopleError = 'Number of people cannot exceed 1,000 friends for one split.';
    }
  }

  if (result.billError) result.generalErrors.push(result.billError);
  if (result.peopleError) result.generalErrors.push(result.peopleError);

  return result;
}

/**
 * Calculates the split down to the exact cent, supporting both even splits and uneven/manual adjustments.
 * Clearly differentiates between automatically calculated shares and manually adjusted ones.
 */
export function calculateSplit(
  state: BillFormState,
  names?: string[]
): SplitResult | null {
  const validation = validateBillInputs(
    state.rawBillAmount,
    state.rawNumPeople,
    state.occasion
  );

  if (!validation.isValid) {
    return null;
  }

  const subtotal = Math.round(Number(state.rawBillAmount) * 100) / 100;
  const peopleCount = Math.floor(Number(state.rawNumPeople));

  const tipPercent = Math.max(0, state.tipPercentage || 0);
  const taxPercent = Math.max(0, state.taxPercentage || 0);

  // Exact subtotal, optional discount, tip, and tax in integer cents
  const subtotalCents = Math.round(subtotal * 100);
  const discountVal = Number(state.discountAmount) || 0;
  const discountCents = Math.min(subtotalCents, Math.max(0, Math.round(discountVal * 100)));
  const effectiveSubtotalCents = Math.max(0, subtotalCents - discountCents);

  const tipCents = Math.round(effectiveSubtotalCents * (tipPercent / 100));
  const taxCents = Math.round(effectiveSubtotalCents * (taxPercent / 100));
  const grandTotalCents = effectiveSubtotalCents + tipCents + taxCents;

  const tipAmount = tipCents / 100;
  const taxAmount = taxCents / 100;
  const grandTotal = grandTotalCents / 100;

  const isUneven = state.splitMode === 'uneven';
  const manualMap = isUneven ? state.manualShareAmounts || {} : {};

  // Count manual vs auto
  const manualIndices = new Set<number>();
  let totalManualCents = 0;

  if (isUneven) {
    for (let i = 0; i < peopleCount; i++) {
      if (manualMap[i] !== undefined && !isNaN(manualMap[i]) && manualMap[i] >= 0) {
        manualIndices.add(i);
        totalManualCents += Math.round(manualMap[i] * 100);
      }
    }
  }

  const manualCount = manualIndices.size;
  const autoCount = peopleCount - manualCount;

  // Calculate remaining balance to distribute among auto members
  const remainingAutoCents = Math.max(0, grandTotalCents - totalManualCents);

  let baseAutoCents = 0;
  let autoRemainderCents = 0;

  if (autoCount > 0 && remainingAutoCents > 0) {
    baseAutoCents = Math.floor(remainingAutoCents / autoCount);
    autoRemainderCents = remainingAutoCents % autoCount;
  }

  let roundingTotalSurplus = 0;
  const shares: PersonShare[] = [];
  const safePayerIndex = Math.min(Math.max(0, state.payerIndex), peopleCount - 1);

  let autoSeenIndex = 0;

  for (let i = 0; i < peopleCount; i++) {
    const isManual = manualIndices.has(i);
    let personTotalCents = 0;
    let hasPennyAdjustment = false;
    let personSurplus = 0;

    if (isManual) {
      personTotalCents = Math.round(manualMap[i] * 100);
    } else {
      hasPennyAdjustment = autoSeenIndex < autoRemainderCents;
      personTotalCents = baseAutoCents + (hasPennyAdjustment ? 1 : 0);
      autoSeenIndex++;
    }

    // Handle rounding strategies if applicable (only applied to auto-split shares)
    if (!isManual) {
      if (state.roundingStrategy === 'round_dollar_up') {
        const nextDollarCents = Math.ceil(personTotalCents / 100) * 100;
        if (nextDollarCents > personTotalCents) {
          personSurplus = (nextDollarCents - personTotalCents) / 100;
          personTotalCents = nextDollarCents;
          roundingTotalSurplus += personSurplus;
        }
      } else if (state.roundingStrategy === 'round_50c') {
        const nextHalfDollarCents = Math.ceil(personTotalCents / 50) * 50;
        if (nextHalfDollarCents > personTotalCents) {
          personSurplus = (nextHalfDollarCents - personTotalCents) / 50;
          personTotalCents = nextHalfDollarCents;
          roundingTotalSurplus += personSurplus;
        }
      }
    }

    const defaultName = `Friend ${i + 1}`;
    const personName =
      names && names[i] && names[i].trim()
        ? names[i].trim()
        : state.customNames && state.customNames[i] && state.customNames[i].trim()
        ? state.customNames[i].trim()
        : defaultName;

    const isPayer = i === safePayerIndex;
    const finalAmount = personTotalCents / 100;

    // Approximate component breakdown for display
    const shareRatio = grandTotalCents > 0 ? personTotalCents / grandTotalCents : 1 / peopleCount;
    const estimatedBase = Math.round(subtotalCents * shareRatio) / 100;
    const estimatedTip = Math.round(tipCents * shareRatio) / 100;
    const estimatedTax = Math.round(taxCents * shareRatio) / 100;

    shares.push({
      id: `person-${i}`,
      index: i,
      name: personName,
      baseAmount: estimatedBase,
      tipAmount: estimatedTip,
      taxAmount: estimatedTax,
      roundingSurplus: personSurplus,
      totalAmount: finalAmount,
      hasPennyAdjustment,
      isManual,
      isPayer,
      amountOwedToPayer: isPayer ? 0 : finalAmount,
    });
  }

  // Sum of all shares
  const totalSumOfSharesCents = shares.reduce((acc, curr) => acc + Math.round(curr.totalAmount * 100), 0);
  const totalSumOfShares = Math.round(totalSumOfSharesCents) / 100;

  const expectedTotalWithSurplus = Math.round((grandTotal + roundingTotalSurplus) * 100) / 100;
  const isExactMatch = totalSumOfShares === expectedTotalWithSurplus;
  const unassignedAmount = Math.round((grandTotalCents - totalSumOfSharesCents)) / 100;

  return {
    subtotal,
    discountAmount: discountCents / 100,
    tipPercentage: tipPercent,
    tipAmount,
    taxPercentage: taxPercent,
    taxAmount,
    grandTotal,
    effectivePerPerson: grandTotal / peopleCount,
    peopleCount,
    roundingStrategy: state.roundingStrategy,
    roundingTotalSurplus: Math.round(roundingTotalSurplus * 100) / 100,
    pennyAdjustmentCount: isUneven ? 0 : grandTotalCents % peopleCount,
    shares,
    payerIndex: safePayerIndex,
    totalSumOfShares,
    isExactMatch,
    unassignedAmount,
    splitMode: state.splitMode,
    manualCount,
    autoCount,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Format currency with proper symbol and precision
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'USD'
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formattedNum = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });

  return `${isNegative ? '-' : ''}${currency.symbol}${formattedNum}`;
}
