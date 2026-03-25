import type { SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
