'use client';

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  containerClassName?: string;
  children?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, helper, className = '', containerClassName = '', required, children, ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        required={required}
        className={`
          w-full rounded-xl border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm
          text-gray-900 dark:text-gray-100 transition-all duration-200 outline-none cursor-pointer
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:opacity-60 disabled:cursor-not-allowed
          ${error
            ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${className}
        `}
        {...props}
      >
        {children}
      </select>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">⚠ {error}</p>
      )}

      {helper && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
      )}
    </div>
  );
});

export default Select;
