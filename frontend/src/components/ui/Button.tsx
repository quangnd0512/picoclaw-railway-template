import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'default' | 'sm';
}

export function Button({ 
  variant = 'primary', 
  size = 'default', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-blue-600 hover:bg-blue-500 text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100';
      break;
    case 'danger':
      variantClasses = 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-600/20 dark:text-red-400 dark:hover:bg-red-600/30';
      break;
    case 'success':
      variantClasses = 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-600/20 dark:text-emerald-400 dark:hover:bg-emerald-600/30';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'default':
      sizeClasses = 'px-5 py-2 text-sm';
      break;
    case 'sm':
      sizeClasses = 'px-3 py-1.5 text-xs';
      break;
  }

  return (
    <button
      className={`disabled:opacity-50 rounded-lg font-medium transition flex items-center justify-center gap-2 ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
