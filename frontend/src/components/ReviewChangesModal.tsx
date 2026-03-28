import { useEffect, useRef } from 'react';
import { Button } from './ui/Button';

interface ReviewChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  dirtySections: string[];
  onApply: () => void;
}

const SECTION_NAMES: Record<string, string> = {
  'providers': 'Providers',
  'channels': 'Channels',
  'agents': 'Agent Defaults',
  'tools': 'Tools Configuration',
  'hermes': 'Hermes Settings',
  'gateway': 'Gateway Settings',
  'heartbeat': 'Heartbeat',
  'devices': 'Devices'
};

export function ReviewChangesModal({ isOpen, onClose, dirtySections, onApply }: ReviewChangesModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 relative flex flex-col z-10"
        role="dialog"
        aria-modal="true"
      >
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Close modal</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Review Changes
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            The following sections have modified settings:
          </p>
          
          <ul className="list-disc list-inside mb-6 space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-2">
            {dirtySections.map((sectionId) => (
              <li key={sectionId}>
                {SECTION_NAMES[sectionId] || sectionId}
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onApply}>
              Apply Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
