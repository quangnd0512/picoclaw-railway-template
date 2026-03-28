import type { SelectHTMLAttributes, ReactNode } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: ReactNode;
}

export function Select({ className = '', icon, children, ...props }: SelectProps) {
  const baseClasses = 'w-full bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors motion-safe:duration-150 appearance-none';
  const paddingClasses = icon ? 'pl-10 pr-8' : 'pl-3 pr-8';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
          {icon}
        </div>
      )}
      <select
        className={`${baseClasses} ${paddingClasses} ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
