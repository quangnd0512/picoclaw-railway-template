import type { ReactElement } from 'react';

export interface FloatingApplyButtonProps {
  isDirty: boolean;
  changeCount: number;
  onClick: () => void;
}

export function FloatingApplyButton({
  isDirty,
  changeCount,
  onClick,
}: FloatingApplyButtonProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        fixed right-6 bottom-6 z-50 flex items-center gap-2
        bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
        text-white font-medium px-6 py-3 rounded-full shadow-lg
        transition-all duration-300
        ${isDirty ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      aria-hidden={!isDirty}
    >
      <span>Apply Changes ({changeCount})</span>
      <span className="text-lg" aria-hidden="true">↗</span>
    </button>
  );
}
