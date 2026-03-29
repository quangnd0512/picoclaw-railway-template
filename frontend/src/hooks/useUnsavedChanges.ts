import { useMemo, useEffect, useState } from 'react';
import type { AppConfig } from '../types/config';
import { stableStringify } from '../utils/stableStringify';

export interface UseUnsavedChangesResult {
  isDirty: boolean;
  dirtySections: string[];
  changeCount: number;
}

export function useUnsavedChanges(
  localConfig: AppConfig | null,
  serverConfig: AppConfig | null,
  debounceMs: number = 300
): UseUnsavedChangesResult {
  const [debouncedConfig, setDebouncedConfig] = useState(localConfig);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedConfig(localConfig);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localConfig, debounceMs]);

  return useMemo(() => {
    if (!debouncedConfig || !serverConfig) {
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
      'heartbeat',
      'devices',
    ] as const;

    for (const section of sections) {
      const localValue = debouncedConfig[section as keyof AppConfig];
      const serverValue = serverConfig[section as keyof AppConfig];

      if (stableStringify(localValue) !== stableStringify(serverValue)) {
        dirtySections.push(section);
      }
    }

    const toolSubsections = ['web', 'mcp', 'exec', 'cron', 'skills'] as const;
    for (const subsection of toolSubsections) {
      const localValue = debouncedConfig.tools[subsection as keyof typeof debouncedConfig.tools];
      const serverValue = serverConfig.tools[subsection as keyof typeof serverConfig.tools];

      if (stableStringify(localValue) !== stableStringify(serverValue)) {
        dirtySections.push(`tools.${subsection}`);
      }
    }

    return {
      isDirty: dirtySections.length > 0,
      dirtySections,
      changeCount: dirtySections.length,
    };
  }, [debouncedConfig, serverConfig]);
}
