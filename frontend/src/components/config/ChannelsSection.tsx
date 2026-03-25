import type { AppConfig } from '../../types/config';
import { PicoClawChannels } from './PicoClawChannels';
import { HermesChannels } from './HermesChannels';

export interface ChannelsSectionProps {
  backend: 'picoclaw' | 'hermes';
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

export function ChannelsSection({ backend, config, onChange }: ChannelsSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Channels</h2>
      {backend === 'picoclaw' ? (
        <PicoClawChannels 
          channels={config.channels} 
          onChange={(channels) => onChange({ ...config, channels })} 
        />
      ) : (
        <HermesChannels 
          channels={config.hermes.channels} 
          onChange={(channels) => onChange({ ...config, hermes: { ...config.hermes, channels } })} 
        />
      )}
    </section>
  );
}
