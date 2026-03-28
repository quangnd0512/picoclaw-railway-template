import { useState } from 'react';
import type { HermesMcpServer } from '../../types/config';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';

export interface HermesMcpProps {
  servers: HermesMcpServer[];
  onServersChange: (servers: HermesMcpServer[]) => void;
}

export function HermesMcp({ servers, onServersChange }: HermesMcpProps) {
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [addingServer, setAddingServer] = useState(false);

  const updateServer = (index: number, updates: Partial<HermesMcpServer>) => {
    const newServers = [...servers];
    newServers[index] = { ...newServers[index], ...updates };
    onServersChange(newServers);
  };

  const removeServer = (index: number) => {
    setRemovingIndex(index);
    setTimeout(() => {
      const newServers = [...servers];
      newServers.splice(index, 1);
      onServersChange(newServers);
      setRemovingIndex(null);
    }, 200); // Match animation duration
  };

  const addServer = () => {
    setAddingServer(true);
    onServersChange([
      ...servers,
      { name: '', command: '', args: '', env: '', url: '', timeout: 60 }
    ]);
    setTimeout(() => setAddingServer(false), 200);
  };

  return (
    <div className="space-y-4">
      {servers.map((server, index) => (
        <div
          key={server.name || `hermes-mcp-${index}`}
          className={`bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 relative overflow-hidden motion-safe:transition-opacity motion-safe:duration-200 ${
            removingIndex === index ? 'opacity-50' : 'opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={() => removeServer(index)}
            className="absolute top-4 right-4 p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 motion-safe:transition-colors motion-safe:duration-150 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            aria-label="Remove Server"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
            <FormField label="Name" required>
              <Input
                value={server.name || ''}
                onChange={(e) => updateServer(index, { name: e.target.value })}
                placeholder="e.g. filesystem"
              />
            </FormField>
            <FormField label="Command" required>
              <Input
                value={server.command || ''}
                onChange={(e) => updateServer(index, { command: e.target.value })}
                placeholder="e.g. npx"
              />
            </FormField>
            <FormField
              label="Args (comma-separated)"
              helpText="Arguments for the command"
            >
              <Input
                value={server.args || ''}
                onChange={(e) => updateServer(index, { args: e.target.value })}
                placeholder="e.g. -y,@modelcontextprotocol/server-filesystem,/tmp"
              />
            </FormField>
            <FormField
              label="Env (key=value, comma-separated)"
              helpText="Environment variables"
            >
              <Input
                value={server.env || ''}
                onChange={(e) => updateServer(index, { env: e.target.value })}
                placeholder="e.g. KEY1=value1,KEY2=value2"
              />
            </FormField>
            <FormField label="URL (for SSE/HTTP)">
              <Input
                value={server.url || ''}
                onChange={(e) => updateServer(index, { url: e.target.value })}
                placeholder="e.g. http://localhost:8000/sse"
              />
            </FormField>
            <FormField label="Timeout (seconds)">
              <Input
                type="number"
                value={server.timeout || 60}
                onChange={(e) => updateServer(index, { timeout: parseInt(e.target.value, 10) || 0 })}
              />
            </FormField>
          </div>
        </div>
      ))}

      {servers.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="font-medium">No MCP servers configured</p>
          <p className="text-sm mt-1">Add a server to get started</p>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <Button
          type="button"
          onClick={addServer}
          variant="secondary"
          className={`motion-safe:transition-opacity motion-safe:duration-200 ${
            addingServer ? 'opacity-75' : 'opacity-100'
          }`}
        >
          + Add Server
        </Button>
      </div>
    </div>
  );
}
