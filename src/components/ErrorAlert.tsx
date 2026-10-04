import React from 'react';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { ValidationResult } from '../types/bill';

interface ErrorAlertProps {
  validation: ValidationResult;
  onFixBillClick?: () => void;
  onFixPeopleClick?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  validation,
  onFixBillClick,
  onFixPeopleClick,
}) => {
  if (validation.isValid) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-2xl border border-red-200 dark:border-red-800/80 bg-red-50/90 dark:bg-red-950/40 p-5 shadow-xs"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-red-100 dark:bg-red-900/60 p-2 text-red-700 dark:text-red-300 shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
            Cannot Calculate Split Shares
          </h3>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            Per the calculation rules, bill results are withheld until valid positive values are provided.
          </p>

          <ul className="mt-3 space-y-1.5 text-xs text-red-800 dark:text-red-300">
            {validation.billError && (
              <li className="flex items-center justify-between gap-2 rounded-xl bg-red-100/60 dark:bg-red-900/40 px-3 py-1.5">
                <span className="font-medium">• {validation.billError}</span>
                {onFixBillClick && (
                  <button
                    type="button"
                    onClick={onFixBillClick}
                    className="inline-flex items-center gap-1 font-semibold text-red-900 dark:text-red-200 underline hover:text-red-950 dark:hover:text-white cursor-pointer"
                  >
                    Edit Bill <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
              </li>
            )}
            {validation.peopleError && (
              <li className="flex items-center justify-between gap-2 rounded-xl bg-red-100/60 dark:bg-red-900/40 px-3 py-1.5">
                <span className="font-medium">• {validation.peopleError}</span>
                {onFixPeopleClick && (
                  <button
                    type="button"
                    onClick={onFixPeopleClick}
                    className="inline-flex items-center gap-1 font-semibold text-red-900 dark:text-red-200 underline hover:text-red-950 dark:hover:text-white cursor-pointer"
                  >
                    Edit People <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
