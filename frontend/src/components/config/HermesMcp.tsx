import type { HermesMcpServer } from '../../types/config';
import { Input } from '../ui/Input';

export interface HermesMcpProps {
  servers: HermesMcpServer[];
  onServersChange: (servers: HermesMcpServer[]) => void;
}

export function HermesMcp({ servers, onServersChange }: HermesMcpProps) {
  const updateServer = (index: number, updates: Partial<HermesMcpServer>) => {
    const newServers = [...servers];
    newServers[index] = { ...newServers[index], ...updates };
    onServersChange(newServers);
  };

  const removeServer = (index: number) => {
    const newServers = [...servers];
    newServers.splice(index, 1);
    onServersChange(newServers);
  };

  const addServer = () => {
    onServersChange([
      ...servers,
      { name: '', command: '', args: '', env: '', url: '', timeout: 60 }
    ]);
  };

  return (
    <div className="space-y-4">
      {servers.map((server, index) => (
        <div key={`hermes-mcp-${index}`} className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 relative">
          <button 
            type="button" 
            onClick={() => removeServer(index)} 
            className="absolute top-4 right-4 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>Remove Server</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
            <div>
              <span className="block text-xs text-gray-500 mb-1">Name</span>
              <Input 
                value={server.name || ''} 
                onChange={e => updateServer(index, { name: e.target.value })} 
                placeholder="e.g. filesystem" 
              />
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Command</span>
              <Input 
                value={server.command || ''} 
                onChange={e => updateServer(index, { command: e.target.value })} 
                placeholder="e.g. npx" 
              />
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Args (comma-separated)</span>
              <Input 
                value={server.args || ''} 
                onChange={e => updateServer(index, { args: e.target.value })} 
                placeholder="e.g. -y,@modelcontextprotocol/server-filesystem,/tmp" 
              />
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Env (key=value, comma-separated)</span>
              <Input 
                value={server.env || ''} 
                onChange={e => updateServer(index, { env: e.target.value })} 
                placeholder="e.g. KEY1=value1,KEY2=value2" 
              />
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">URL (for SSE/HTTP)</span>
              <Input 
                value={server.url || ''} 
                onChange={e => updateServer(index, { url: e.target.value })} 
                placeholder="e.g. http://localhost:8000/sse" 
              />
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Timeout (seconds)</span>
              <Input 
                type="number" 
                value={server.timeout || 60} 
                onChange={e => updateServer(index, { timeout: parseInt(e.target.value, 10) || 0 })} 
              />
            </div>
          </div>
        </div>
      ))}
      
      {servers.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl">
          No MCP servers configured.
        </div>
      )}
      
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
  );
}
