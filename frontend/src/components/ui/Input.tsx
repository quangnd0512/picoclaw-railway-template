import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: boolean;
}

export function Input({ className = '', icon, error, ...props }: InputProps) {
  const baseClasses = 'w-full bg-gray-100 dark:bg-gray-800 border rounded-lg py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors motion-safe:duration-150';
  const borderClasses = error
    ? 'border-red-500 dark:border-red-400'
    : 'border-gray-300 dark:border-gray-700';
  const paddingClasses = icon ? 'pl-10 pr-3' : 'px-3';

  if (icon) {
    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
          {icon}
        </div>
        <input
          className={`${baseClasses} ${borderClasses} ${paddingClasses} ${className}`}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={`${baseClasses} ${borderClasses} ${paddingClasses} ${className}`}
      {...props}
    />
  );
}
