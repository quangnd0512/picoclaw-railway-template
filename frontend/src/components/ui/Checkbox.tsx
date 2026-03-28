import React from 'react';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  id = `checkbox-${Math.random().toString(36).substr(2, 9)}`,
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed transition-colors motion-safe:duration-150">
          <svg
            className="w-full h-full text-white scale-0 peer-checked:scale-100 transition-transform motion-safe:duration-150"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      {label && (
        <span className={`text-sm ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
          {label}
        </span>
      )}
    </label>
  );
};
