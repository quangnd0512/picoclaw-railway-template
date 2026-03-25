import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function Skills({ config, onChange }: Props) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Skills</h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">ClawHub Registry</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              checked={config.tools.skills.registries.clawhub.enabled}
              onChange={(e) => onChange('tools.skills.registries.clawhub.enabled', e.target.checked)}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
          </label>
        </div>
        {config.tools.skills.registries.clawhub.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Base URL</label>
              <Input
                type="text"
                value={config.tools.skills.registries.clawhub.base_url || ''}
                onChange={(e) => onChange('tools.skills.registries.clawhub.base_url', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Search Path</label>
              <Input
                type="text"
                value={config.tools.skills.registries.clawhub.search_path || ''}
                onChange={(e) => onChange('tools.skills.registries.clawhub.search_path', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Skills Path</label>
              <Input
                type="text"
                value={config.tools.skills.registries.clawhub.skills_path || ''}
                onChange={(e) => onChange('tools.skills.registries.clawhub.skills_path', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Download Path</label>
              <Input
                type="text"
                value={config.tools.skills.registries.clawhub.download_path || ''}
                onChange={(e) => onChange('tools.skills.registries.clawhub.download_path', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
