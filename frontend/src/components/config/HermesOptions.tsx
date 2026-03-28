import type { AppConfig } from '../../types/config';
import { CopyButton } from '../ui/CopyButton';
import { FormField } from '../ui/FormField';
import { FormSection } from '../ui/FormSection';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';

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
      <FormSection title="Custom Providers" description="Configure additional model providers for Hermes.">
        <div className="space-y-4">
          {(h.custom_providers || []).map((provider, index) => {
            const providerKey = [provider.name, provider.base_url, provider.api_key_env, provider.models]
              .filter(Boolean)
              .join('::') || `custom-provider-${index}`;

            return (
              <div key={providerKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{provider.name || 'New Provider'}</h4>
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
                  <FormField label="Name">
                    <Input
                      type="text"
                      placeholder="Provider name"
                      value={provider.name}
                      onChange={(e) => handleCustomProviderUpdate(index, 'name', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Base URL">
                    <Input
                      type="text"
                      placeholder="http://localhost:8000/v1"
                      value={provider.base_url}
                      onChange={(e) => handleCustomProviderUpdate(index, 'base_url', e.target.value)}
                    />
                  </FormField>

                  <FormField label="API Key Env Var">
                    <Input
                      type="text"
                      placeholder="MY_PROVIDER_API_KEY"
                      value={provider.api_key_env}
                      onChange={(e) => handleCustomProviderUpdate(index, 'api_key_env', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Models (comma-separated)">
                    <Input
                      type="text"
                      placeholder="model-1, model-2"
                      value={provider.models}
                      onChange={(e) => handleCustomProviderUpdate(index, 'models', e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const list = [...(h.custom_providers || [])];
              list.push({ name: '', base_url: '', api_key_env: '', models: '' });
              onChange('hermes.custom_providers', list);
            }}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 motion-safe:transition-colors motion-safe:duration-150"
          >
            + Add Custom Provider
          </button>
        </div>
      </FormSection>

      <FormSection title="Auxiliary Models" description="Dedicated models for vision and web extraction.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Vision</h3>

            <FormField label="Provider">
              <Input
                type="text"
                placeholder="e.g., openrouter"
                value={h.auxiliary?.vision?.provider || ''}
                onChange={(e) => onChange('hermes.auxiliary.vision.provider', e.target.value)}
              />
            </FormField>

            <FormField label="Model">
              <Input
                type="text"
                placeholder="e.g., openai/gpt-4o"
                value={h.auxiliary?.vision?.model || ''}
                onChange={(e) => onChange('hermes.auxiliary.vision.model', e.target.value)}
              />
            </FormField>

            <FormField label="Base URL">
              <Input
                type="text"
                placeholder="Optional"
                value={h.auxiliary?.vision?.base_url || ''}
                onChange={(e) => onChange('hermes.auxiliary.vision.base_url', e.target.value)}
              />
            </FormField>

            <FormField label="API Key">
              <div className="flex items-center gap-2">
                <PasswordInput
                  value={h.auxiliary?.vision?.api_key || ''}
                  onChange={(e) => onChange('hermes.auxiliary.vision.api_key', e.target.value)}
                  placeholder="Enter API key"
                  className="flex-1"
                />
                <CopyButton text={h.auxiliary?.vision?.api_key || ''} />
              </div>
            </FormField>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Web Extract</h3>

            <FormField label="Provider">
              <Input
                type="text"
                placeholder="e.g., openrouter"
                value={h.auxiliary?.web_extract?.provider || ''}
                onChange={(e) => onChange('hermes.auxiliary.web_extract.provider', e.target.value)}
              />
            </FormField>

            <FormField label="Model">
              <Input
                type="text"
                placeholder="e.g., openai/gpt-4o"
                value={h.auxiliary?.web_extract?.model || ''}
                onChange={(e) => onChange('hermes.auxiliary.web_extract.model', e.target.value)}
              />
            </FormField>

            <FormField label="Base URL">
              <Input
                type="text"
                placeholder="Optional"
                value={h.auxiliary?.web_extract?.base_url || ''}
                onChange={(e) => onChange('hermes.auxiliary.web_extract.base_url', e.target.value)}
              />
            </FormField>

            <FormField label="API Key">
              <div className="flex items-center gap-2">
                <PasswordInput
                  value={h.auxiliary?.web_extract?.api_key || ''}
                  onChange={(e) => onChange('hermes.auxiliary.web_extract.api_key', e.target.value)}
                  placeholder="Enter API key"
                  className="flex-1"
                />
                <CopyButton text={h.auxiliary?.web_extract?.api_key || ''} />
              </div>
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection title="Context Compression" description="Tune summarization behavior when context grows.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Enabled">
            <Toggle
              checked={h.compression?.enabled || false}
              onChange={(checked) => onChange('hermes.compression.enabled', checked)}
            />
          </FormField>

          <FormField label="Threshold (0-1)">
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={h.compression?.threshold || 0}
              onChange={(e) => onChange('hermes.compression.threshold', Number(e.target.value))}
            />
          </FormField>

          <FormField label="Summary Model">
            <Input
              type="text"
              placeholder="e.g. gpt-4o-mini"
              value={h.compression?.summary_model || ''}
              onChange={(e) => onChange('hermes.compression.summary_model', e.target.value)}
            />
          </FormField>

          <FormField label="Summary Provider">
            <Input
              type="text"
              placeholder="e.g. openai"
              value={h.compression?.summary_provider || ''}
              onChange={(e) => onChange('hermes.compression.summary_provider', e.target.value)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Provider Routing" description="Control provider ordering and parameter requirements.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Sort By">
            <Select
              value={h.provider_routing?.sort || 'price'}
              onChange={(e) => onChange('hermes.provider_routing.sort', e.target.value)}
            >
              <option value="price">Price</option>
              <option value="throughput">Throughput</option>
              <option value="latency">Latency</option>
            </Select>
          </FormField>

          <FormField label="Data Collection">
            <Select
              value={h.provider_routing?.data_collection || 'deny'}
              onChange={(e) => onChange('hermes.provider_routing.data_collection', e.target.value)}
            >
              <option value="deny">Deny</option>
              <option value="allow">Allow</option>
            </Select>
          </FormField>

          <FormField label="Only (comma-separated)">
            <Input
              type="text"
              placeholder="e.g. openai,anthropic"
              value={h.provider_routing?.only || ''}
              onChange={(e) => onChange('hermes.provider_routing.only', e.target.value)}
            />
          </FormField>

          <FormField label="Ignore (comma-separated)">
            <Input
              type="text"
              placeholder="e.g. google"
              value={h.provider_routing?.ignore || ''}
              onChange={(e) => onChange('hermes.provider_routing.ignore', e.target.value)}
            />
          </FormField>

          <FormField label="Order (comma-separated)">
            <Input
              type="text"
              placeholder="e.g. anthropic,openai"
              value={h.provider_routing?.order || ''}
              onChange={(e) => onChange('hermes.provider_routing.order', e.target.value)}
            />
          </FormField>

          <FormField label="Require Parameters">
            <Toggle
              checked={h.provider_routing?.require_parameters || false}
              onChange={(checked) => onChange('hermes.provider_routing.require_parameters', checked)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Fallback Model" description="Model used when routing cannot satisfy a request.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Provider">
            <Input
              type="text"
              placeholder="e.g. openrouter"
              value={h.fallback_model?.provider || ''}
              onChange={(e) => onChange('hermes.fallback_model.provider', e.target.value)}
            />
          </FormField>

          <FormField label="Model">
            <Input
              type="text"
              placeholder="e.g. openai/gpt-4o-mini"
              value={h.fallback_model?.model || ''}
              onChange={(e) => onChange('hermes.fallback_model.model', e.target.value)}
            />
          </FormField>
        </div>
      </FormSection>
    </div>
  );
}
