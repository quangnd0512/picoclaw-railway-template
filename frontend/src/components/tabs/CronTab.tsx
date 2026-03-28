import type { AppConfig } from '../../types/config';
import { Cron } from '../config/Cron';

interface CronTabProps {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function CronTab({ config, backend, onChange }: CronTabProps) {
  return (
    <Cron
      config={config}
      backend={backend}
      onChange={onChange}
    />
  );
}
