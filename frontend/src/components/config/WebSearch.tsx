import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function WebSearch({ config, onChange }: Props) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Web Search</h2>
      
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Brave Search API Key</label>
            <Input
              type="password"
              value={config.tools.web.brave.api_key || ''}
              onChange={(e) => onChange('tools.web.brave.api_key', e.target.value)}
              placeholder="Enter Brave Search API key"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              checked={config.tools.web.duckduckgo.enabled}
              onChange={(e) => onChange('tools.web.duckduckgo.enabled', e.target.checked)}
            />
            <label className="text-sm text-gray-500 dark:text-gray-400">DuckDuckGo Search</label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Perplexity Search</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={config.tools.web.perplexity.enabled}
                onChange={(e) => onChange('tools.web.perplexity.enabled', e.target.checked)}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {config.tools.web.perplexity.enabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">API Key</label>
                <Input
                  type="password"
                  value={config.tools.web.perplexity.api_key || ''}
                  onChange={(e) => onChange('tools.web.perplexity.api_key', e.target.value)}
                  placeholder="Enter API key"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Results</label>
                <Input
                  type="number"
                  value={config.tools.web.perplexity.max_results}
                  onChange={(e) => onChange('tools.web.perplexity.max_results', Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Tavily Search</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={config.tools.web.tavily.enabled}
                onChange={(e) => onChange('tools.web.tavily.enabled', e.target.checked)}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {config.tools.web.tavily.enabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">API Key</label>
                <Input
                  type="password"
                  value={config.tools.web.tavily.api_key || ''}
                  onChange={(e) => onChange('tools.web.tavily.api_key', e.target.value)}
                  placeholder="Enter API key"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Base URL</label>
                <Input
                  type="text"
                  value={config.tools.web.tavily.base_url || ''}
                  onChange={(e) => onChange('tools.web.tavily.base_url', e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Results</label>
                <Input
                  type="number"
                  value={config.tools.web.tavily.max_results}
                  onChange={(e) => onChange('tools.web.tavily.max_results', Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-md font-semibold mb-3">Web Settings</h3>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Web Proxy</label>
            <Input
              type="text"
              value={config.tools.web.proxy || ''}
              onChange={(e) => onChange('tools.web.proxy', e.target.value)}
              placeholder="socks5://127.0.0.1:1080"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fetch Limit (bytes)</label>
            <Input
              type="number"
              value={config.tools.web.fetch_limit_bytes}
              onChange={(e) => onChange('tools.web.fetch_limit_bytes', Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
