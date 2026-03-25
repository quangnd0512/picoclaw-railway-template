import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function AgentDefaults({ config, backend, onChange }: Props) {
  if (backend === 'hermes') {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Agent Configuration</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Turns</label>
                <Input
                  type="number"
                  value={config.hermes.agent.max_turns}
                  onChange={(e) => onChange('hermes.agent.max_turns', Number(e.target.value))}
                  placeholder="90"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reasoning Effort</label>
                <Select
                  value={config.hermes.agent.reasoning_effort}
                  onChange={(e) => onChange('hermes.agent.reasoning_effort', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">System Prompt</label>
              <textarea
                className="w-full bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                rows={4}
                value={config.hermes.agent.system_prompt || ''}
                onChange={(e) => onChange('hermes.agent.system_prompt', e.target.value)}
                placeholder="Custom system prompt..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Personalities</label>
              <Input
                type="text"
                value={config.hermes.agent.personalities || ''}
                onChange={(e) => onChange('hermes.agent.personalities', e.target.value)}
                placeholder="e.g. helpful, concise"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Agent Defaults</h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Provider</label>
            <Input
              type="text"
              value={config.agents.defaults.provider || ''}
              onChange={(e) => onChange('agents.defaults.provider', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Model</label>
            <Input
              type="text"
              value={config.agents.defaults.model || ''}
              onChange={(e) => onChange('agents.defaults.model', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Workspace Directory</label>
            <Input
              type="text"
              value={config.agents.defaults.workspace || ''}
              onChange={(e) => onChange('agents.defaults.workspace', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Tokens</label>
            <Input
              type="number"
              value={config.agents.defaults.max_tokens}
              onChange={(e) => onChange('agents.defaults.max_tokens', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Temperature</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={config.agents.defaults.temperature}
              onChange={(e) => onChange('agents.defaults.temperature', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Tool Iterations</label>
            <Input
              type="number"
              value={config.agents.defaults.max_tool_iterations}
              onChange={(e) => onChange('agents.defaults.max_tool_iterations', Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              checked={config.agents.defaults.restrict_to_workspace}
              onChange={(e) => onChange('agents.defaults.restrict_to_workspace', e.target.checked)}
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">Restrict to Workspace</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              checked={config.agents.defaults.allow_read_outside_workspace}
              onChange={(e) => onChange('agents.defaults.allow_read_outside_workspace', e.target.checked)}
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">Allow Read Outside Workspace</label>
          </div>
        </div>
      </div>
    </section>
  );
}
