import { useState, useRef, useEffect } from 'react';
import type { ReactElement } from 'react';
import { useSwitchBackend } from '../hooks/useBackend';

export interface FloatingBackendSwitchProps {
  backend?: 'picoclaw' | 'hermes';
}

export function FloatingBackendSwitch({
  backend,
}: FloatingBackendSwitchProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const switchBackendMutation = useSwitchBackend();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newBackend: 'picoclaw' | 'hermes') => {
    if (newBackend !== backend) {
      switchBackendMutation.mutate(newBackend);
    }
    setIsOpen(false);
  };

  const isHermes = backend === 'hermes';

  return (
    <div ref={dropdownRef} className="fixed left-6 bottom-6 z-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={switchBackendMutation.isPending}
        className={`
          flex items-center gap-2
          ${isHermes
            ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
            : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
          }
          text-white font-medium px-4 py-2.5 rounded-full shadow-lg
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-wait
        `}
      >
        <span className="text-lg" aria-hidden="true">{isHermes ? '🔮' : '🦐'}</span>
        <span>{isHermes ? 'Hermes' : 'PicoClaw'}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            type="button"
            onClick={() => handleSelect('picoclaw')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
              backend === 'picoclaw'
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <span className="text-lg">🦐</span>
            <span className="font-medium">PicoClaw</span>
            {backend === 'picoclaw' && (
              <svg className="w-4 h-4 ml-auto text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSelect('hermes')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
              backend === 'hermes'
                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <span className="text-lg">🔮</span>
            <span className="font-medium">Hermes</span>
            {backend === 'hermes' && (
              <svg className="w-4 h-4 ml-auto text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
