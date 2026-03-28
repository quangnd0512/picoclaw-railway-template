import type { AppConfig } from '../../types/config';
import { WebSearch } from '../config/WebSearch';

interface WebSearchTabProps {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function WebSearchTab({ config, backend, onChange }: WebSearchTabProps) {
  return (
    <WebSearch
      config={config}
      backend={backend}
      onChange={onChange}
    />
  );
}
