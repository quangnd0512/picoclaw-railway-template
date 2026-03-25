import type { AppConfig, HermesMcpServer } from '../../types/config';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export interface CustomProvider {
  name: string;
  base_url: string;
  api_key_env: string;
  models: string;
}

export type ExtendedAppConfig = AppConfig & {
  hermes: AppConfig['hermes'] & { custom_providers?: CustomProvider[] };
};

export interface HermesOptionsProps {
  backend: string;
  config: ExtendedAppConfig;
  onChange: (path: string, value: unknown) => void;
}

export function HermesOptions({ backend, config, onChange }: HermesOptionsProps) {
  if (backend !== 'hermes') return null;

  const h = config.hermes;

  const handleCustomProviderUpdate = (index: number, field: keyof CustomProvider, value: string) => {
    const list = [...(h.custom_providers || [])];
    list[index] = { ...list[index], [field]: value };
    onChange('hermes.custom_providers', list);
  };

  const handleMcpServerUpdate = <K extends keyof HermesMcpServer>(index: number, field: K, value: HermesMcpServer[K]) => {
    const list = [...(h.mcp_servers || [])];
    list[index][field] = value;
    onChange('hermes.mcp_servers', list);
  };

  return (
    <div className="space-y-8">
      {/* 1. Custom Providers */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Custom Providers</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
          <div className="space-y-4">
            {(h.custom_providers || []).map((provider, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{provider.name || 'New Provider'}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(h.custom_providers || [])];
                      list.splice(index, 1);
                      onChange('hermes.custom_providers', list);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <Input
                      type="text"
                      placeholder="Provider name"
                      value={provider.name}
                      onChange={(e) => handleCustomProviderUpdate(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Base URL</label>
                    <Input
                      type="text"
                      placeholder="http://localhost:8000/v1"
                      value={provider.base_url}
                      onChange={(e) => handleCustomProviderUpdate(index, 'base_url', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">API Key Env Var</label>
                    <Input
                      type="text"
                      placeholder="MY_PROVIDER_API_KEY"
                      value={provider.api_key_env}
                      onChange={(e) => handleCustomProviderUpdate(index, 'api_key_env', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Models (comma-separated)</label>
                    <Input
                      type="text"
                      placeholder="model-1, model-2"
                      value={provider.models}
                      onChange={(e) => handleCustomProviderUpdate(index, 'models', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const list = [...(h.custom_providers || [])];
                list.push({ name: '', base_url: '', api_key_env: '', models: '' });
                onChange('hermes.custom_providers', list);
              }}
              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 transition"
            >
              + Add Custom Provider
            </button>
          </div>
        </div>
      </section>

      {/* 2. Agent Configuration */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Agent Configuration</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Turns</label>
                <Input
                  type="number"
                  placeholder="90"
                  value={h.agent?.max_turns || 90}
                  onChange={(e) => onChange('hermes.agent.max_turns', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reasoning Effort</label>
                <Select
                  value={h.agent?.reasoning_effort || 'medium'}
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
                className="w-full bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                placeholder="Custom system prompt..."
                value={h.agent?.system_prompt || ''}
                onChange={(e) => onChange('hermes.agent.system_prompt', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Personalities</label>
              <Input
                type="text"
                placeholder="e.g. helpful, concise"
                value={h.agent?.personalities || ''}
                onChange={(e) => onChange('hermes.agent.personalities', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Auxiliary Models */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Auxiliary Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
            <h3 className="font-medium mb-3">Vision</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Provider</label>
                <Input
                  type="text"
                  placeholder="e.g., openrouter"
                  value={h.auxiliary?.vision?.provider || ''}
                  onChange={(e) => onChange('hermes.auxiliary.vision.provider', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Model</label>
                <Input
                  type="text"
                  placeholder="e.g., openai/gpt-4o"
                  value={h.auxiliary?.vision?.model || ''}
                  onChange={(e) => onChange('hermes.auxiliary.vision.model', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Base URL</label>
                <Input
                  type="text"
                  placeholder="Optional"
                  value={h.auxiliary?.vision?.base_url || ''}
                  onChange={(e) => onChange('hermes.auxiliary.vision.base_url', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">API Key</label>
                <Input
                  type="password"
                  placeholder="Enter API key"
                  value={h.auxiliary?.vision?.api_key || ''}
                  onChange={(e) => onChange('hermes.auxiliary.vision.api_key', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
            <h3 className="font-medium mb-3">Web Extract</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Provider</label>
                <Input
                  type="text"
                  placeholder="e.g., openrouter"
                  value={h.auxiliary?.web_extract?.provider || ''}
                  onChange={(e) => onChange('hermes.auxiliary.web_extract.provider', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Model</label>
                <Input
                  type="text"
                  placeholder="e.g., openai/gpt-4o"
                  value={h.auxiliary?.web_extract?.model || ''}
                  onChange={(e) => onChange('hermes.auxiliary.web_extract.model', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Base URL</label>
                <Input
                  type="text"
                  placeholder="Optional"
                  value={h.auxiliary?.web_extract?.base_url || ''}
                  onChange={(e) => onChange('hermes.auxiliary.web_extract.base_url', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">API Key</label>
                <Input
                  type="password"
                  placeholder="Enter API key"
                  value={h.auxiliary?.web_extract?.api_key || ''}
                  onChange={(e) => onChange('hermes.auxiliary.web_extract.api_key', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Terminal */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Terminal</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Backend</label>
              <Select
                value={h.terminal?.backend || 'native'}
                onChange={(e) => onChange('hermes.terminal.backend', e.target.value)}
              >
                <option value="native">Native</option>
                <option value="docker">Docker</option>
                <option value="ssh">SSH</option>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Working Directory (CWD)</label>
                <Input
                  type="text"
                  placeholder="e.g. /app"
                  value={h.terminal?.cwd || ''}
                  onChange={(e) => onChange('hermes.terminal.cwd', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Timeout (seconds)</label>
                <Input
                  type="number"
                  value={h.terminal?.timeout || 60}
                  onChange={(e) => onChange('hermes.terminal.timeout', Number(e.target.value))}
                />
              </div>
            </div>

            {h.terminal?.backend === 'docker' && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-medium text-sm">Docker Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Docker Image</label>
                    <Input
                      type="text"
                      placeholder="e.g. ubuntu:latest"
                      value={h.terminal?.docker_image || ''}
                      onChange={(e) => onChange('hermes.terminal.docker_image', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CPU Limit</label>
                    <Input
                      type="text"
                      placeholder="e.g. 1.0"
                      value={h.terminal?.container_cpu || ''}
                      onChange={(e) => onChange('hermes.terminal.container_cpu', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Memory Limit</label>
                    <Input
                      type="text"
                      placeholder="e.g. 512m"
                      value={h.terminal?.container_memory || ''}
                      onChange={(e) => onChange('hermes.terminal.container_memory', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Disk Limit</label>
                    <Input
                      type="text"
                      placeholder="e.g. 10g"
                      value={h.terminal?.container_disk || ''}
                      onChange={(e) => onChange('hermes.terminal.container_disk', e.target.value)}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                    checked={h.terminal?.container_persistent || false}
                    onChange={(e) => onChange('hermes.terminal.container_persistent', e.target.checked)}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Persistent Container</span>
                </label>
              </div>
            )}

            {h.terminal?.backend === 'ssh' && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-medium text-sm">SSH Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Host</label>
                    <Input
                      type="text"
                      placeholder="e.g. 192.168.1.10"
                      value={h.terminal?.ssh_host || ''}
                      onChange={(e) => onChange('hermes.terminal.ssh_host', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Port</label>
                    <Input
                      type="number"
                      value={h.terminal?.ssh_port || 22}
                      onChange={(e) => onChange('hermes.terminal.ssh_port', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">User</label>
                    <Input
                      type="text"
                      placeholder="e.g. root"
                      value={h.terminal?.ssh_user || ''}
                      onChange={(e) => onChange('hermes.terminal.ssh_user', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Key Path</label>
                    <Input
                      type="text"
                      placeholder="e.g. ~/.ssh/id_rsa"
                      value={h.terminal?.ssh_key_path || ''}
                      onChange={(e) => onChange('hermes.terminal.ssh_key_path', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Security */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Security</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={h.security?.redact_secrets || false}
                onChange={(e) => onChange('hermes.security.redact_secrets', e.target.checked)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Redact Secrets</span>
            </label>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Tirith Integration</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                    checked={h.security?.tirith_enabled || false}
                    onChange={(e) => onChange('hermes.security.tirith_enabled', e.target.checked)}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
                </label>
              </div>
              
              {h.security?.tirith_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tirith Path</label>
                    <Input
                      type="text"
                      placeholder="e.g. /usr/local/bin/tirith"
                      value={h.security?.tirith_path || ''}
                      onChange={(e) => onChange('hermes.security.tirith_path', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Timeout (seconds)</label>
                    <Input
                      type="number"
                      value={h.security?.tirith_timeout || 5}
                      onChange={(e) => onChange('hermes.security.tirith_timeout', Number(e.target.value))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                        checked={h.security?.tirith_fail_open || false}
                        onChange={(e) => onChange('hermes.security.tirith_fail_open', e.target.checked)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Fail Open (allow execution if Tirith fails)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Context Compression */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Context Compression</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={h.compression?.enabled || false}
                onChange={(e) => onChange('hermes.compression.enabled', e.target.checked)}
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">Enabled</label>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Threshold (0-1)</label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={h.compression?.threshold || 0}
                onChange={(e) => onChange('hermes.compression.threshold', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Summary Model</label>
              <Input
                type="text"
                placeholder="e.g. gpt-4o-mini"
                value={h.compression?.summary_model || ''}
                onChange={(e) => onChange('hermes.compression.summary_model', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Summary Provider</label>
              <Input
                type="text"
                placeholder="e.g. openai"
                value={h.compression?.summary_provider || ''}
                onChange={(e) => onChange('hermes.compression.summary_provider', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Display */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Display</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={h.display?.compact || false}
                onChange={(e) => onChange('hermes.display.compact', e.target.checked)}
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">Compact Mode</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={h.display?.bell_on_complete || false}
                onChange={(e) => onChange('hermes.display.bell_on_complete', e.target.checked)}
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">Bell on Complete</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={h.display?.show_reasoning || false}
                onChange={(e) => onChange('hermes.display.show_reasoning', e.target.checked)}
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">Show Reasoning</label>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Personality</label>
              <Input
                type="text"
                placeholder="kawaii"
                value={h.display?.personality || ''}
                onChange={(e) => onChange('hermes.display.personality', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Resume Display</label>
              <Select
                value={h.display?.resume_display || 'full'}
                onChange={(e) => onChange('hermes.display.resume_display', e.target.value)}
              >
                <option value="full">Full</option>
                <option value="compact">Compact</option>
                <option value="none">None</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Skin</label>
              <Input
                type="text"
                placeholder="e.g. default"
                value={h.display?.skin || ''}
                onChange={(e) => onChange('hermes.display.skin', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Provider Routing */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Provider Routing</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sort By</label>
              <Select
                value={h.provider_routing?.sort || 'price'}
                onChange={(e) => onChange('hermes.provider_routing.sort', e.target.value)}
              >
                <option value="price">Price</option>
                <option value="throughput">Throughput</option>
                <option value="latency">Latency</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data Collection</label>
              <Select
                value={h.provider_routing?.data_collection || 'deny'}
                onChange={(e) => onChange('hermes.provider_routing.data_collection', e.target.value)}
              >
                <option value="deny">Deny</option>
                <option value="allow">Allow</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Only (comma-separated)</label>
              <Input
                type="text"
                placeholder="e.g. openai,anthropic"
                value={h.provider_routing?.only || ''}
                onChange={(e) => onChange('hermes.provider_routing.only', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ignore (comma-separated)</label>
              <Input
                type="text"
                placeholder="e.g. google"
                value={h.provider_routing?.ignore || ''}
                onChange={(e) => onChange('hermes.provider_routing.ignore', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Order (comma-separated)</label>
              <Input
                type="text"
                placeholder="e.g. anthropic,openai"
                value={h.provider_routing?.order || ''}
                onChange={(e) => onChange('hermes.provider_routing.order', e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={h.provider_routing?.require_parameters || false}
                onChange={(e) => onChange('hermes.provider_routing.require_parameters', e.target.checked)}
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">Require Parameters</label>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Fallback Model */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Fallback Model</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Provider</label>
              <Input
                type="text"
                placeholder="e.g. openrouter"
                value={h.fallback_model?.provider || ''}
                onChange={(e) => onChange('hermes.fallback_model.provider', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Model</label>
              <Input
                type="text"
                placeholder="e.g. openai/gpt-4o-mini"
                value={h.fallback_model?.model || ''}
                onChange={(e) => onChange('hermes.fallback_model.model', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 10. MCP Servers */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">MCP Servers</h2>
          <button
            type="button"
            onClick={() => {
              const list = [...(h.mcp_servers || [])];
              list.push({ name: '', command: '', args: '', env: '', url: '', timeout: 60 });
              onChange('hermes.mcp_servers', list);
            }}
            className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition"
          >
            + Add Server
          </button>
        </div>
        <div className="space-y-4 mb-4">
          {(h.mcp_servers || []).map((server, index) => (
            <div key={index} className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 relative">
              <button
                type="button"
                onClick={() => {
                  const list = [...(h.mcp_servers || [])];
                  list.splice(index, 1);
                  onChange('hermes.mcp_servers', list);
                }}
                className="absolute top-4 right-4 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                title="Remove Server"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. filesystem"
                    value={server.name}
                    onChange={(e) => handleMcpServerUpdate(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Command</label>
                  <Input
                    type="text"
                    placeholder="e.g. npx"
                    value={server.command}
                    onChange={(e) => handleMcpServerUpdate(index, 'command', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Args (comma-separated)</label>
                  <Input
                    type="text"
                    placeholder="e.g. -y,@modelcontextprotocol/server-filesystem,/tmp"
                    value={server.args}
                    onChange={(e) => handleMcpServerUpdate(index, 'args', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Env (key=value, comma-separated)</label>
                  <Input
                    type="text"
                    placeholder="e.g. KEY1=value1,KEY2=value2"
                    value={server.env}
                    onChange={(e) => handleMcpServerUpdate(index, 'env', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">URL (for SSE/HTTP)</label>
                  <Input
                    type="text"
                    placeholder="e.g. http://localhost:8000/sse"
                    value={server.url || ''}
                    onChange={(e) => handleMcpServerUpdate(index, 'url', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Timeout (seconds)</label>
                  <Input
                    type="number"
                    value={server.timeout ?? 60}
                    onChange={(e) => handleMcpServerUpdate(index, 'timeout', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}
          {(!h.mcp_servers || h.mcp_servers.length === 0) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl">
              No MCP servers configured.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
