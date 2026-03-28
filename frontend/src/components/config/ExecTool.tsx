import type { AppConfig } from '../../types/config';
import { Toggle } from '../ui/Toggle';
import { Textarea } from '../ui/Textarea';
import { FormField } from '../ui/FormField';

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
          <FormField label="Enabled" id="enable-deny-patterns">
            <Toggle 
              checked={config.tools.exec?.enable_deny_patterns || false}
              onChange={(checked) => onChange('tools.exec.enable_deny_patterns', checked)}
            />
          </FormField>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Deny patterns block matching commands. Allow patterns override deny for specific commands. Patterns are regular expressions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Custom Deny Patterns" id="deny-patterns" helpText="One pattern per line">
            <Textarea
              rows={4}
              value={getExecPatterns('custom_deny_patterns')}
              onChange={(e) => setExecPatterns('custom_deny_patterns', e.target.value)}
              placeholder="^rm -rf&#10;^mkfs"
            />
          </FormField>
          <FormField label="Custom Allow Patterns" id="allow-patterns" helpText="One pattern per line">
            <Textarea
              rows={4}
              value={getExecPatterns('custom_allow_patterns')}
              onChange={(e) => setExecPatterns('custom_allow_patterns', e.target.value)}
              placeholder="^rm -rf /tmp/&#10;^docker"
            />
          </FormField>
        </div>
      </div>
    </section>
  );
}
