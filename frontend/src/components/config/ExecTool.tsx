import type { AppConfig } from '../../types/config';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function ExecTool({ config, onChange }: Props) {
  const getExecPatterns = (field: 'custom_deny_patterns' | 'custom_allow_patterns') => {
    return (config.tools.exec?.[field] || []).join('\n');
  };

  const setExecPatterns = (field: 'custom_deny_patterns' | 'custom_allow_patterns', text: string) => {
    const patterns = text.split('\n').map(s => s.trim()).filter(Boolean);
    onChange(`tools.exec.${field}`, patterns);
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Exec Tool</h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Default Deny Patterns</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              checked={config.tools.exec?.enable_deny_patterns || false}
              onChange={(e) => onChange('tools.exec.enable_deny_patterns', e.target.checked)}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Deny patterns block matching commands. Allow patterns override deny for specific commands. Patterns are regular expressions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Custom Deny Patterns (one per line)</label>
            <textarea
              className="w-full bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              rows={4}
              value={getExecPatterns('custom_deny_patterns')}
              onChange={(e) => setExecPatterns('custom_deny_patterns', e.target.value)}
              placeholder="^rm -rf&#10;^mkfs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Custom Allow Patterns (one per line)</label>
            <textarea
              className="w-full bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              rows={4}
              value={getExecPatterns('custom_allow_patterns')}
              onChange={(e) => setExecPatterns('custom_allow_patterns', e.target.value)}
              placeholder="^rm -rf /tmp/&#10;^docker"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
