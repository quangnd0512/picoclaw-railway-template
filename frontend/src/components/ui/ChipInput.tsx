import { useState, type KeyboardEvent } from 'react';

export interface ChipInputProps {
  value: string[];
  onChange: (newValue: string[]) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  id?: string;
}

export function ChipInput({ value = [], onChange, placeholder = 'Add and press Enter', className = '', label, id }: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setInputValue('');
      }
    }
  };

  const removeChip = (indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {value.map((item, index) => (
          <div 
            key={item} 
            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm animate-scale-in motion-safe:duration-150"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => removeChip(index)}
              className="text-gray-400 hover:text-red-500 transition-colors motion-safe:duration-150"
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </div>
        ))}
        <input
          type="text"
          id={id}
          className="flex-1 min-w-[120px] bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors motion-safe:duration-150"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
