import { useState, type KeyboardEvent } from 'react';

export interface ChipInputProps {
  value: string[];
  onChange: (newValue: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ChipInput({ value = [], onChange, placeholder = 'Add and press Enter', className = '' }: ChipInputProps) {
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
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {value.map((item, index) => (
        <div key={item} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
          <span>{item}</span>
          <button
            type="button"
            onClick={() => removeChip(index)}
            className="text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
      ))}
      <input
        type="text"
        className="flex-1 min-w-[120px] bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
