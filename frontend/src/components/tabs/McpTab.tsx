import type { AppConfig } from '../../types/config';
import { PicoClawMcp } from '../config/PicoClawMcp';
import { HermesMcp } from '../config/HermesMcp';

interface McpTabProps {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function McpTab({ config, backend, onChange }: McpTabProps) {
  if (backend === 'picoclaw') {
    return (
      <PicoClawMcp
        enabled={config.tools?.mcp?.enabled ?? false}
        onEnabledChange={(enabled) => onChange('tools.mcp.enabled', enabled)}
        servers={config.tools?.mcp?.servers || {}}
        onServersChange={(servers) => onChange('tools.mcp.servers', servers)}
      />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">MCP Servers</h2>
      <HermesMcp
        servers={config.hermes?.mcp_servers || []}
        onServersChange={(servers) => onChange('hermes.mcp_servers', servers)}
      />
    </div>
  );
}
