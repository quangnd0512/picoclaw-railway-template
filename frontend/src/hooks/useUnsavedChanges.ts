import { useMemo } from 'react';
import type { AppConfig } from '../types/config';
import { stableStringify } from '../utils/stableStringify';

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
      'heartbeat',
      'devices',
    ] as const;

    // Compare top-level sections
    for (const section of sections) {
      const localValue = localConfig[section as keyof AppConfig];
      const serverValue = serverConfig[section as keyof AppConfig];

      if (stableStringify(localValue) !== stableStringify(serverValue)) {
        dirtySections.push(section);
      }
    }

    // Compare tools subsections independently (web, mcp, exec, cron, skills)
    const toolSubsections = ['web', 'mcp', 'exec', 'cron', 'skills'] as const;
    for (const subsection of toolSubsections) {
      const localValue = localConfig.tools[subsection as keyof typeof localConfig.tools];
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
  }, [localConfig, serverConfig]);
}
