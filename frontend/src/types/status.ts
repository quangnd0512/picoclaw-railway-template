/**
 * Type definitions for /api/status response.
 * Represents the current state of the gateway and system.
 */

export interface ChannelStatus {
  enabled: boolean;
  configured: boolean;
  error?: string;
}

export interface ProviderStatus {
  enabled: boolean;
  configured: boolean;
  error?: string;
}

export interface GatewayStatus {
  state: 'stopped' | 'starting' | 'running' | 'error';
  start_time?: number;
  restart_count: number;
  logs: string[];
}

export interface MCPServerStatus {
  name: string;
  enabled: boolean;
  status: 'healthy' | 'unhealthy' | 'unknown';
  error?: string;
}

export interface ToolStatus {
  enabled: boolean;
  configured: boolean;
  error?: string;
}

export interface StatusResponse {
  gateway: GatewayStatus;
  channels: Record<string, ChannelStatus>;
  providers: Record<string, ProviderStatus>;
  tools: Record<string, ToolStatus>;
  mcp_servers: MCPServerStatus[];
  uptime_seconds: number;
  backend: 'picoclaw' | 'hermes' | 'unknown';
}
