import type { AppConfig } from '../../types/config';
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

      {/* 2. Auxiliary Models */}
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

      {/* 3. Context Compression */}
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

      {/* 4. Provider Routing */}
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

      {/* 5. Fallback Model */}
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
    </div>
  );
}
