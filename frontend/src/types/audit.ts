/**
 * Type definitions for /api/audit response.
 * Represents audit information about the system state.
 */

export interface AuditCronJob {
  name?: string;
  schedule?: string;
  last_run?: string;
  next_run?: string;
  status?: string;
  [key: string]: unknown;
}

export interface AuditCron {
  count: number;
  jobs: AuditCronJob[];
}

export interface AuditSkill {
  name: string;
  description: string;
  version: string;
}

export interface AuditMCPServer {
  name: string;
  type: string;
  command_or_url: string;
}

export interface AuditSession {
  id: string;
  date: number;
  message_count: number;
}

export interface AuditToolInfo {
  enabled: boolean;
}

export interface AuditResponse {
  backend: 'picoclaw' | 'hermes';
  cron: AuditCron;
  skills: AuditSkill[];
  mcp_servers: AuditMCPServer[];
  sessions: AuditSession[];
  tools: Record<string, AuditToolInfo>;
}
