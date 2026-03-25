import { useState } from 'react';
import type { AppConfig } from '../../types/config';
import { Button } from '../ui/Button';

export interface SaveBarProps {
  config: AppConfig;
  onSave: (restartAfterSave: boolean) => void;
  saving: boolean;
}

export function SaveBar({ onSave, saving }: SaveBarProps) {
  const [restartAfterSave, setRestartAfterSave] = useState(true);

  return (
    <div className="sticky bottom-6 z-10 flex items-center justify-between bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 shadow-lg">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={restartAfterSave}
          onChange={(e) => setRestartAfterSave(e.target.checked)}
          className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Restart gateway after save
        </span>
      </label>
      <Button
        type="button"
        variant="primary"
        onClick={() => onSave(restartAfterSave)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
}
