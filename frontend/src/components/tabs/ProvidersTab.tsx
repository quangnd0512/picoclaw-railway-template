import type { AppConfig } from '../../types/config';
import { ProvidersSection } from '../config/ProvidersSection';
import { HermesOptions, type ExtendedAppConfig } from '../config/HermesOptions';

interface ProvidersTabProps {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function ProvidersTab({ config, backend, onChange }: ProvidersTabProps) {
  return (
    <div className="space-y-8">
      <ProvidersSection
        config={config}
        backend={backend}
        onChange={onChange}
      />
      
      {backend === 'hermes' && (
        <HermesOptions
          config={config as ExtendedAppConfig}
          backend={backend}
          onChange={onChange}
        />
      )}
    </div>
  );
}
