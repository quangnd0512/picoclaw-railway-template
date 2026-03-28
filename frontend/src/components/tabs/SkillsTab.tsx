import type { AppConfig } from '../../types/config';
import { Skills } from '../config/Skills';

interface SkillsTabProps {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function SkillsTab({ config, backend, onChange }: SkillsTabProps) {
  return (
    <Skills
      config={config}
      backend={backend}
      onChange={onChange}
    />
  );
}
