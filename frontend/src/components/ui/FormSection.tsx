import { useState, type ReactNode } from 'react';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  collapsible = false, 
  defaultOpen = true 
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <button 
        type="button"
        className={`sticky top-0 z-10 w-full bg-white dark:bg-gray-950 px-4 py-3 border-b border-gray-200 dark:border-gray-800 text-left ${
          collapsible ? 'hover:bg-gray-50 dark:hover:bg-gray-900/50' : 'cursor-default'
        }`}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
        aria-expanded={collapsible ? isOpen : undefined}
        disabled={!collapsible}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {collapsible && (
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform motion-safe:duration-200 flex-shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>
      <div 
        className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
