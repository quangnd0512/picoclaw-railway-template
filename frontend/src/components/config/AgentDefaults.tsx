import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { FormField } from '../ui/FormField';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

const ServerIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2m0 0a2 2 0 002-2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2m14-4V6a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ThermometerIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CogIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UnlockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RepeatIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const BrainIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 4.364l-.707.707M9 12a3 3 0 11 6 0 3 3 0 01-6 0z" />
  </svg>
);

const SmileIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function AgentDefaults({ config, backend, onChange }: Props) {
  if (backend === 'hermes') {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Agent Configuration</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Max Turns"
                id="hermes-max-turns"
                helpText="Maximum number of turns for agent reasoning"
              >
                <Input
                  type="number"
                  icon={<RepeatIcon />}
                  value={config.hermes.agent.max_turns}
                  onChange={(e) => onChange('hermes.agent.max_turns', Number(e.target.value))}
                  placeholder="90"
                />
              </FormField>
              <FormField
                label="Reasoning Effort"
                id="hermes-reasoning-effort"
                helpText="Higher effort enables deeper reasoning"
              >
                <Select
                  icon={<BrainIcon />}
                  value={config.hermes.agent.reasoning_effort}
                  onChange={(e) => onChange('hermes.agent.reasoning_effort', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormField>
            </div>
            <FormField
              label="System Prompt"
              id="hermes-system-prompt"
              helpText="Custom instructions for agent behavior"
            >
              <textarea
                id="hermes-system-prompt"
                className="w-full bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                rows={4}
                value={config.hermes.agent.system_prompt || ''}
                onChange={(e) => onChange('hermes.agent.system_prompt', e.target.value)}
                placeholder="Custom system prompt..."
              />
            </FormField>
            <FormField
              label="Personalities"
              id="hermes-personalities"
              helpText="Agent personality traits (comma-separated)"
            >
              <Input
                type="text"
                icon={<SmileIcon />}
                value={config.hermes.agent.personalities || ''}
                onChange={(e) => onChange('hermes.agent.personalities', e.target.value)}
                placeholder="e.g. helpful, concise"
              />
            </FormField>
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
          <FormField
            label="Provider"
            id="provider"
            helpText="LLM provider name (e.g., openai, anthropic)"
          >
            <Input
              type="text"
              icon={<ServerIcon />}
              value={config.agents.defaults.provider || ''}
              onChange={(e) => onChange('agents.defaults.provider', e.target.value)}
            />
          </FormField>
          <FormField
            label="Model"
            id="model"
            helpText="Model identifier (e.g., gpt-4, claude-opus)"
          >
            <Input
              type="text"
              icon={<SparkleIcon />}
              value={config.agents.defaults.model || ''}
              onChange={(e) => onChange('agents.defaults.model', e.target.value)}
            />
          </FormField>
          <FormField
            label="Workspace Directory"
            id="workspace"
            helpText="Base directory for agent workspace and tools"
          >
            <Input
              type="text"
              icon={<FolderIcon />}
              value={config.agents.defaults.workspace || ''}
              onChange={(e) => onChange('agents.defaults.workspace', e.target.value)}
            />
          </FormField>
          <FormField
            label="Max Tokens"
            id="max-tokens"
            helpText="Maximum completion tokens per request"
          >
            <Input
              type="number"
              icon={<ZapIcon />}
              value={config.agents.defaults.max_tokens}
              onChange={(e) => onChange('agents.defaults.max_tokens', Number(e.target.value))}
            />
          </FormField>
          <FormField
            label="Temperature"
            id="temperature"
            helpText="Sampling temperature (0-2). Higher = more creative"
          >
            <Input
              type="number"
              step="0.1"
              min="0"
              max="2"
              icon={<ThermometerIcon />}
              value={config.agents.defaults.temperature}
              onChange={(e) => onChange('agents.defaults.temperature', Number(e.target.value))}
            />
          </FormField>
          <FormField
            label="Max Tool Iterations"
            id="max-tool-iterations"
            helpText="Maximum tool use attempts per task"
          >
            <Input
              type="number"
              icon={<CogIcon />}
              value={config.agents.defaults.max_tool_iterations}
              onChange={(e) => onChange('agents.defaults.max_tool_iterations', Number(e.target.value))}
            />
          </FormField>
          <div className="flex items-center gap-2">
            <input
              id="restrict-workspace"
              type="checkbox"
              className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              checked={config.agents.defaults.restrict_to_workspace}
              onChange={(e) => onChange('agents.defaults.restrict_to_workspace', e.target.checked)}
            />
            <label htmlFor="restrict-workspace" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer" title="Prevent agent from accessing files outside workspace">
              <LockIcon />
              Restrict to Workspace
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="allow-read-outside"
              type="checkbox"
              className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              checked={config.agents.defaults.allow_read_outside_workspace}
              onChange={(e) => onChange('agents.defaults.allow_read_outside_workspace', e.target.checked)}
            />
            <label htmlFor="allow-read-outside" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer" title="Allow read-only access to files outside workspace">
              <UnlockIcon />
              Allow Read Outside Workspace
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
