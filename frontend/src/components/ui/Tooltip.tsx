import {
  useState,
  useRef,
  useEffect,
  cloneElement,
  isValidElement,
  type ReactElement,
} from 'react';

export interface TooltipProps {
  content: string;
  children: ReactElement;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVisible(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const trigger = isValidElement(children)
    ? cloneElement(children, {
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
        onFocus: () => setIsVisible(true),
        onBlur: () => setIsVisible(false),
        'aria-describedby': isVisible ? tooltipId : undefined,
      } as React.HTMLAttributes<HTMLElement>)
    : children;

  return (
    <div className="relative inline-block">
      {trigger}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap motion-safe:animate-fade-in"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
}
