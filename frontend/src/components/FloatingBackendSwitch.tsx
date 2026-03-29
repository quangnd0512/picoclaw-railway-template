import { useState, useRef, useEffect } from 'react';
import type { ReactElement } from 'react';
import { Button } from './ui/Button';

export interface FloatingBackendSwitchProps {
  backend?: 'picoclaw' | 'hermes';
  isDirty?: boolean;
  dirtySections?: string[];
  onApplyAndSwitch: (backend: 'picoclaw' | 'hermes') => void;
  onDiscardAndSwitch: (backend: 'picoclaw' | 'hermes') => void;
}

export function FloatingBackendSwitch({
  backend,
  isDirty = false,
  dirtySections = [],
  onApplyAndSwitch,
  onDiscardAndSwitch,
}: FloatingBackendSwitchProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [showDirtyModal, setShowDirtyModal] = useState(false);
  const [pendingBackend, setPendingBackend] = useState<'picoclaw' | 'hermes' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setIsOpen(false);
    if (newBackend === backend) return;

    if (isDirty) {
      setPendingBackend(newBackend);
      setShowDirtyModal(true);
    } else {
      onApplyAndSwitch(newBackend);
    }
  };

  const handleApplyAndSwitch = () => {
    if (pendingBackend) {
      onApplyAndSwitch(pendingBackend);
    }
    setShowDirtyModal(false);
    setPendingBackend(null);
  };

  const handleDiscardAndSwitch = () => {
    if (pendingBackend) {
      onDiscardAndSwitch(pendingBackend);
    }
    setShowDirtyModal(false);
    setPendingBackend(null);
  };

  const handleCancel = () => {
    setShowDirtyModal(false);
    setPendingBackend(null);
  };

  const isHermes = backend === 'hermes';

  return (
    <>
      <div ref={dropdownRef} className="fixed left-6 bottom-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2
            ${isHermes
              ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
              : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
            }
            text-white font-medium px-4 py-2.5 rounded-full shadow-lg
            transition-opacity transition-transform motion-safe:duration-200
          `}
        >
          <span className="text-lg" aria-hidden="true">{isHermes ? '🔮' : '🦐'}</span>
          <span>{isHermes ? 'Hermes' : 'PicoClaw'}</span>
          <svg
            className={`w-4 h-4 transition-transform motion-safe:duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors motion-safe:duration-150 ${
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
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors motion-safe:duration-150 ${
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

      {showDirtyModal && pendingBackend && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={handleCancel} />
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 relative flex flex-col z-10 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unsaved Changes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You have unsaved changes in: <span className="font-medium">{dirtySections.length} section{dirtySections.length !== 1 ? 's' : ''}</span>.
              What would you like to do?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Switching backends without saving will discard your changes.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={handleApplyAndSwitch}>
                Apply & Switch to {pendingBackend === 'hermes' ? 'Hermes' : 'PicoClaw'}
              </Button>
              <Button variant="secondary" onClick={handleDiscardAndSwitch}>
                Discard & Switch to {pendingBackend === 'hermes' ? 'Hermes' : 'PicoClaw'}
              </Button>
              <Button variant="danger" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
