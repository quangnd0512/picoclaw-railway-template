import type { AppConfig } from '../../types/config';
import { ExecTool } from '../config/ExecTool';

interface ExecToolTabProps {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function ExecToolTab({ config, backend, onChange }: ExecToolTabProps) {
  if (backend !== 'picoclaw') {
    return null;
  }

  return (
    <ExecTool
      config={config}
      backend={backend}
      onChange={onChange}
    />
  );
}
