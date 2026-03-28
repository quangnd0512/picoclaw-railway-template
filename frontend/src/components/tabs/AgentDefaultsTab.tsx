import type { AppConfig } from '../../types/config';
import { AgentDefaults } from '../config/AgentDefaults';

interface AgentDefaultsTabProps {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function AgentDefaultsTab({ config, backend, onChange }: AgentDefaultsTabProps) {
  return (
    <AgentDefaults
      config={config}
      backend={backend}
      onChange={onChange}
    />
  );
}
