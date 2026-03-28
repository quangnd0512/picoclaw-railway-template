import React from 'react';

interface ToggleProps {
  id?: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  id = 'toggle',
  label,
  checked,
  onChange,
  disabled = false,
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
        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed transition-colors motion-safe:duration-200" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-200 rounded-full shadow transition-transform motion-safe:duration-200 peer-checked:translate-x-5 pointer-events-none" />
      </div>
      {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
};
