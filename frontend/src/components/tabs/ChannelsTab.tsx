import type { AppConfig } from '../../types/config';
import { ChannelsSection } from '../config/ChannelsSection';

interface ChannelsTabProps {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (newConfig: AppConfig) => void;
}

export function ChannelsTab({ config, backend, onChange }: ChannelsTabProps) {
  return (
    <ChannelsSection
      config={config}
      backend={backend}
      onChange={onChange}
    />
  );
}
