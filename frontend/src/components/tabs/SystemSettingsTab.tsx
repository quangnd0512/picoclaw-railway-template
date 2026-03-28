import type { AppConfig } from '../../types/config';
import { SystemSettings } from '../config/SystemSettings';

interface SystemSettingsTabProps {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function SystemSettingsTab({ config, backend, onChange }: SystemSettingsTabProps) {
  return (
    <SystemSettings
      config={config}
      backend={backend}
      onChange={onChange}
    />
  );
}
