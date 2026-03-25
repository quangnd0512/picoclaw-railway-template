import { useState } from 'react';
import type { McpServer, McpServersConfig, McpServerType } from '../../types/config';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export interface PicoClawMcpProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  servers: McpServersConfig;
  onServersChange: (servers: McpServersConfig) => void;
}

export function PicoClawMcp({ enabled, onEnabledChange, servers, onServersChange }: PicoClawMcpProps) {
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({});

  const toggleExpand = (name: string) => {
    setExpandedServers(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const updateServer = (name: string, updates: Partial<McpServer>) => {
    onServersChange({
      ...servers,
      [name]: { ...servers[name], ...updates }
    });
  };

  const deleteServer = (name: string) => {
    if (window.confirm(`Delete server ${name}?`)) {
      const newServers = { ...servers };
      delete newServers[name];
      onServersChange(newServers);
      
      const newExpanded = { ...expandedServers };
      delete newExpanded[name];
      setExpandedServers(newExpanded);
    }
  };

  const addServer = () => {
    const name = window.prompt('Enter new server name (slug):');
    if (name && !servers[name]) {
      onServersChange({
        ...servers,
        [name]: { enabled: true, command: '', args: [], type: 'stdio' }
      });
      setExpandedServers(prev => ({ ...prev, [name]: true }));
    }
  };

  const EnvEditor = ({ env = {}, onChange }: { env?: Record<string, string>, onChange: (env: Record<string, string>) => void }) => {
    const entries = Object.entries(env);
    
    const updateEntry = (index: number, key: string, value: string) => {
      const newEntries = [...entries];
      newEntries[index] = [key, value];
      onChange(Object.fromEntries(newEntries));
    };

    const addEntry = () => {
      const newEntries = [...entries, ['', '']];
      onChange(Object.fromEntries(newEntries));
    };

    const removeEntry = (index: number) => {
      const newEntries = [...entries];
      newEntries.splice(index, 1);
      onChange(Object.fromEntries(newEntries));
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="block text-xs text-gray-500">Environment Variables</span>
          <button type="button" onClick={addEntry} className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            + Add Env
          </button>
        </div>
        <div className="space-y-2">
          {entries.map(([k, v], index) => (
            <div key={`env-${index}`} className="flex gap-2">
              <Input 
                className="w-1/3" 
                placeholder="Key" 
                value={k} 
                onChange={e => updateEntry(index, e.target.value, v)} 
              />
              <Input 
                className="flex-1" 
                type="password" 
                placeholder="Value" 
                value={v} 
                onChange={e => updateEntry(index, k, e.target.value)} 
              />
              <button 
                type="button" 
                onClick={() => removeEntry(index)}
                className="px-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <title>Remove</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const HeadersEditor = ({ headers = {}, onChange }: { headers?: Record<string, string>, onChange: (headers: Record<string, string>) => void }) => {
    const entries = Object.entries(headers);
    
    const updateEntry = (index: number, key: string, value: string) => {
      const newEntries = [...entries];
      newEntries[index] = [key, value];
      onChange(Object.fromEntries(newEntries));
    };

    const addEntry = () => {
      const newEntries = [...entries, ['', '']];
      onChange(Object.fromEntries(newEntries));
    };

    const removeEntry = (index: number) => {
      const newEntries = [...entries];
      newEntries.splice(index, 1);
      onChange(Object.fromEntries(newEntries));
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="block text-xs text-gray-500">Headers</span>
          <button type="button" onClick={addEntry} className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            + Add Header
          </button>
        </div>
        <div className="space-y-2">
          {entries.map(([k, v], index) => (
            <div key={`header-${index}`} className="flex gap-2">
              <Input 
                className="w-1/3" 
                placeholder="Key" 
                value={k} 
                onChange={e => updateEntry(index, e.target.value, v)} 
              />
              <Input 
                className="flex-1" 
                type="password" 
                placeholder="Value" 
                value={v} 
                onChange={e => updateEntry(index, k, e.target.value)} 
              />
              <button 
                type="button" 
                onClick={() => removeEntry(index)}
                className="px-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <title>Remove</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">MCP Servers</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600" 
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)} 
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
        </label>
      </div>

      {enabled && (
        <div className="space-y-4">
          {Object.entries(servers).map(([name, server]) => {
            const isHttp = server.type === 'http' || server.type === 'sse';
            const expanded = expandedServers[name] || false;

            return (
              <div key={name} className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => toggleExpand(name)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {isHttp ? 'HTTP/SSE' : 'stdio'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Enter') e.stopPropagation(); }}>
                      <input 
                        type="checkbox" 
                        className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600" 
                        checked={server.enabled ?? false}
                        onChange={(e) => updateServer(name, { enabled: e.target.checked })} 
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
                    </label>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <title>Toggle details</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                    {!isHttp ? (
                      <div className="space-y-4">
                        <div>
                          <span className="block text-xs text-gray-500 mb-1">Command</span>
                          <Input 
                            value={server.command || ''} 
                            onChange={e => updateServer(name, { command: e.target.value })} 
                          />
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 mb-1">Args (one per line)</span>
                          <textarea 
                            className="w-full bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                            rows={3} 
                            value={(server.args || []).join('\n')} 
                            onChange={e => updateServer(name, { args: e.target.value.split('\n').filter(Boolean) })}
                          />
                        </div>
                        <EnvEditor env={server.env} onChange={(newEnv) => updateServer(name, { env: newEnv })} />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <span className="block text-xs text-gray-500 mb-1">Type</span>
                          <Select 
                            value={server.type || 'http'} 
                            onChange={e => updateServer(name, { type: e.target.value as McpServerType })}
                          >
                            <option value="http">HTTP</option>
                            <option value="sse">SSE</option>
                          </Select>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 mb-1">URL</span>
                          <Input 
                            value={server.url || ''} 
                            onChange={e => updateServer(name, { url: e.target.value })} 
                          />
                        </div>
                        <HeadersEditor 
                          headers={(server as unknown as { headers?: Record<string, string> }).headers} 
                          onChange={headers => updateServer(name, { headers } as unknown as Partial<McpServer>)} 
                        />
                      </div>
                    )}
                    
                    <div className="pt-4 flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => deleteServer(name)} 
                        className="text-sm px-3 py-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        Delete Server
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="flex justify-center">
            <button 
              type="button" 
              onClick={addServer} 
              className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition font-medium"
            >
              + Add Server
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
