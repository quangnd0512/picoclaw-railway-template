import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { PasswordInput } from '../ui/PasswordInput';
import { CopyButton } from '../ui/CopyButton';
import { FormField } from '../ui/FormField';
import { FormSection } from '../ui/FormSection';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function WebSearch({ config, onChange }: Props) {
  return (
    <section className="space-y-4">
      <FormSection title="Web Search Providers">
        <div className="space-y-4">
          <FormField label="Brave Search API Key" id="brave-api-key">
            <div className="relative">
              <PasswordInput
                value={config.tools.web.brave.api_key || ''}
                onChange={(e) => onChange('tools.web.brave.api_key', e.target.value)}
                placeholder="Enter Brave Search API key"
              />
              {config.tools.web.brave.api_key && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <CopyButton text={config.tools.web.brave.api_key} />
                </div>
              )}
            </div>
          </FormField>

          <FormField label="DuckDuckGo Search" id="duckduckgo-enabled">
            <Toggle
              id="duckduckgo-enabled"
              checked={config.tools.web.duckduckgo.enabled}
              onChange={(checked) => onChange('tools.web.duckduckgo.enabled', checked)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Perplexity Search">
        <div className="space-y-4">
          <FormField label="Enabled" id="perplexity-enabled">
            <Toggle
              id="perplexity-enabled"
              checked={config.tools.web.perplexity.enabled}
              onChange={(checked) => onChange('tools.web.perplexity.enabled', checked)}
            />
          </FormField>

          {config.tools.web.perplexity.enabled && (
            <>
              <FormField label="API Key" id="perplexity-api-key">
                <div className="relative">
                  <PasswordInput
                    value={config.tools.web.perplexity.api_key || ''}
                    onChange={(e) => onChange('tools.web.perplexity.api_key', e.target.value)}
                    placeholder="Enter API key"
                  />
                  {config.tools.web.perplexity.api_key && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <CopyButton text={config.tools.web.perplexity.api_key} />
                    </div>
                  )}
                </div>
              </FormField>

              <FormField label="Max Results" id="perplexity-max-results">
                <Input
                  type="number"
                  value={config.tools.web.perplexity.max_results}
                  onChange={(e) => onChange('tools.web.perplexity.max_results', Number(e.target.value))}
                />
              </FormField>
            </>
          )}
        </div>
      </FormSection>

      <FormSection title="Tavily Search">
        <div className="space-y-4">
          <FormField label="Enabled" id="tavily-enabled">
            <Toggle
              id="tavily-enabled"
              checked={config.tools.web.tavily.enabled}
              onChange={(checked) => onChange('tools.web.tavily.enabled', checked)}
            />
          </FormField>

          {config.tools.web.tavily.enabled && (
            <>
              <FormField label="API Key" id="tavily-api-key">
                <div className="relative">
                  <PasswordInput
                    value={config.tools.web.tavily.api_key || ''}
                    onChange={(e) => onChange('tools.web.tavily.api_key', e.target.value)}
                    placeholder="Enter API key"
                  />
                  {config.tools.web.tavily.api_key && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <CopyButton text={config.tools.web.tavily.api_key} />
                    </div>
                  )}
                </div>
              </FormField>

              <FormField label="Base URL" id="tavily-base-url">
                <Input
                  type="text"
                  value={config.tools.web.tavily.base_url || ''}
                  onChange={(e) => onChange('tools.web.tavily.base_url', e.target.value)}
                  placeholder="Optional"
                />
              </FormField>

              <FormField label="Max Results" id="tavily-max-results">
                <Input
                  type="number"
                  value={config.tools.web.tavily.max_results}
                  onChange={(e) => onChange('tools.web.tavily.max_results', Number(e.target.value))}
                />
              </FormField>
            </>
          )}
        </div>
      </FormSection>

      <FormSection title="Web Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Web Proxy" id="web-proxy">
            <Input
              type="text"
              value={config.tools.web.proxy || ''}
              onChange={(e) => onChange('tools.web.proxy', e.target.value)}
              placeholder="socks5://127.0.0.1:1080"
            />
          </FormField>

          <FormField label="Fetch Limit (bytes)" id="fetch-limit-bytes">
            <Input
              type="number"
              value={config.tools.web.fetch_limit_bytes}
              onChange={(e) => onChange('tools.web.fetch_limit_bytes', Number(e.target.value))}
            />
          </FormField>
        </div>
      </FormSection>
    </section>
  );
}
