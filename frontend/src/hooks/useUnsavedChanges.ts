import { useMemo } from 'react';
import type { AppConfig } from '../types/config';

export interface UseUnsavedChangesResult {
  isDirty: boolean;
  dirtySections: string[];
  changeCount: number;
}

export function useUnsavedChanges(
  localConfig: AppConfig | null,
  serverConfig: AppConfig | null
): UseUnsavedChangesResult {
  return useMemo(() => {
    if (!localConfig || !serverConfig) {
      return {
        isDirty: false,
        dirtySections: [],
        changeCount: 0,
      };
    }

    const dirtySections: string[] = [];
    const sections = [
      'providers',
      'channels',
      'agents',
      'hermes',
      'gateway',
      'tools',
      'heartbeat',
      'devices',
    ] as const;

    for (const section of sections) {
      const localValue = localConfig[section as keyof AppConfig];
      const serverValue = serverConfig[section as keyof AppConfig];

      if (JSON.stringify(localValue) !== JSON.stringify(serverValue)) {
        dirtySections.push(section);
      }
    }

    return {
      isDirty: dirtySections.length > 0,
      dirtySections,
      changeCount: dirtySections.length,
    };
  }, [localConfig, serverConfig]);
}
