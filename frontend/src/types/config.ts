/**
 * Full TypeScript type definitions for the PicoClaw and Hermes configuration schema.
 * Matches the frontend's defaultConfig() from scripts.html (lines 414-539).
 */

// ============================================================================
// PROVIDER CONFIGURATIONS
// ============================================================================

export interface ProviderConfig {
  api_key: string;
  api_base?: string;
  base_url?: string;
  model?: string;
}

export interface ProvidersConfig {
  anthropic: { api_key: string };
  openai: { api_key: string; api_base?: string; base_url?: string };
  openrouter: { api_key: string };
  deepseek: { api_key: string };
  groq: { api_key: string };
  gemini: { api_key: string };
  zhipu: { api_key: string; api_base?: string };
  zai: { api_key: string };
  vllm: { api_key: string; api_base?: string };
  nvidia: { api_key: string; api_base?: string };
  moonshot: { api_key: string };
  minimax: { api_key: string };
  custom: { api_key: string; base_url?: string; model?: string };
}

// ============================================================================
// PICOCLAW CHANNEL CONFIGURATIONS
// ============================================================================

export interface PicoCawTelegramChannel {
  enabled: boolean;
  token: string;
  proxy: string;
  allow_from: string[];
}

export interface PicoCawDiscordChannel {
  enabled: boolean;
  token: string;
  allow_from: string[];
}

export interface PicoCawSlackChannel {
  enabled: boolean;
  bot_token: string;
  app_token: string;
  allow_from: string[];
}

export interface PicoCawWhatsAppChannel {
  enabled: boolean;
  bridge_url: string;
  allow_from: string[];
}

export interface PicoCawFeishuChannel {
  enabled: boolean;
  app_id: string;
  app_secret: string;
  encrypt_key: string;
  verification_token: string;
  allow_from: string[];
}

export interface PicoCawDingtalkChannel {
  enabled: boolean;
  client_id: string;
  client_secret: string;
  allow_from: string[];
}

export interface PicoCawQQChannel {
  enabled: boolean;
  app_id: string;
  app_secret: string;
  allow_from: string[];
}

export interface PicoCawLineChannel {
  enabled: boolean;
  channel_secret: string;
  channel_access_token: string;
  webhook_host: string;
  webhook_port: number;
  webhook_path: string;
  allow_from: string[];
}

export interface PicoCawMaixcamChannel {
  enabled: boolean;
  host: string;
  port: number;
  allow_from: string[];
}

export interface PicoCawChannelsConfig {
  telegram: PicoCawTelegramChannel;
  discord: PicoCawDiscordChannel;
  slack: PicoCawSlackChannel;
  whatsapp: PicoCawWhatsAppChannel;
  feishu: PicoCawFeishuChannel;
  dingtalk: PicoCawDingtalkChannel;
  qq: PicoCawQQChannel;
  line: PicoCawLineChannel;
  maixcam: PicoCawMaixcamChannel;
}

// ============================================================================
// HERMES CHANNEL CONFIGURATIONS
// ============================================================================

export interface HermesTelegramChannel {
  enabled: boolean;
  bot_token: string;
  token: string;
  home_channel: string;
  home_channel_name: string;
  allowed_users: string;
  allow_from: string[];
  allow_all_users: boolean;
}

export interface HermesDiscordChannel {
  enabled: boolean;
  bot_token: string;
  token: string;
  allowed_users: string;
  allow_from: string[];
  allow_bots: boolean;
  require_mention: boolean;
  free_response_channels: string;
  auto_thread: boolean;
}

export interface HermesSlackChannel {
  enabled: boolean;
  bot_token: string;
  app_token: string;
  home_channel: string;
  home_channel_name: string;
  allowed_users: string;
  allow_all_users: boolean;
}

export interface HermesWhatsAppChannel {
  enabled: boolean;
  mode: string;
  allowed_users: string;
  allow_all_users: boolean;
}

export interface HermesSignalChannel {
  enabled: boolean;
  http_url: string;
  account: string;
  ignore_stories: boolean;
  home_channel: string;
  home_channel_name: string;
  group_allowed_users: string;
  allowed_users: string;
  allow_all_users: boolean;
}

export interface HermesEmailChannel {
  enabled: boolean;
  address: string;
  password: string;
  imap_host: string;
  smtp_host: string;
  imap_port: number;
  smtp_port: number;
  poll_interval: number;
  home_address: string;
  home_address_name: string;
  allowed_users: string;
  allow_all_users: boolean;
}

export interface HermesHomeAssistantChannel {
  enabled: boolean;
  token: string;
  url: string;
}

export interface HermesChannelsConfig {
  telegram: HermesTelegramChannel;
  discord: HermesDiscordChannel;
  slack: HermesSlackChannel;
  whatsapp: HermesWhatsAppChannel;
  signal: HermesSignalChannel;
  email: HermesEmailChannel;
  homeassistant: HermesHomeAssistantChannel;
}

// ============================================================================
// MCP SERVER CONFIGURATIONS
// ============================================================================

export type McpServerType = 'stdio' | 'http' | 'sse';

export interface McpServer {
  enabled?: boolean;
  type?: McpServerType;
  command?: string;
  url?: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface McpServersConfig {
  [key: string]: McpServer;
}

/**
 * Hermes MCP Server - args and env are STRINGS (comma-separated),
 * NOT arrays. This is a deliberate data model difference from PicoClaw MCP.
 */
export interface HermesMcpServer {
  name: string;
  command: string;
  args: string; // comma-separated, e.g. "-y,@modelcontextprotocol/server-filesystem,/tmp"
  env: string; // comma-separated key=value pairs, e.g. "KEY1=value1,KEY2=value2"
  url?: string;
  timeout?: number;
}

// ============================================================================
// AGENT CONFIGURATIONS
// ============================================================================

export interface AgentDefaults {
  workspace: string;
  restrict_to_workspace: boolean;
  allow_read_outside_workspace: boolean;
  provider: string;
  model: string;
  max_tokens: number;
  temperature: number;
  max_tool_iterations: number;
}

export interface AgentsConfig {
  defaults: AgentDefaults;
}

// ============================================================================
// HERMES CONFIGURATION
// ============================================================================

export interface HermesAgent {
  max_turns: number;
  system_prompt: string;
  reasoning_effort: string;
  personalities: string;
}

export interface HermesCompression {
  enabled: boolean;
  threshold: number;
  summary_model: string;
  summary_provider: string;
}

export interface HermesDisplay {
  compact: boolean;
  personality: string;
  resume_display: string;
  bell_on_complete: boolean;
  show_reasoning: boolean;
  skin: string;
}

export interface HermesProviderRouting {
  sort: string;
  only: string;
  ignore: string;
  order: string;
  require_parameters: boolean;
  data_collection: string;
}

export interface HermesFallbackModel {
  provider: string;
  model: string;
}

export interface HermesAuxiliary {
  vision: {
    provider: string;
    model: string;
    base_url: string;
    api_key: string;
  };
  web_extract: {
    provider: string;
    model: string;
    base_url: string;
    api_key: string;
  };
}

export interface HermesTerminal {
  backend: string;
  cwd: string;
  timeout: number;
  docker_image: string;
  container_cpu: string;
  container_memory: string;
  container_disk: string;
  container_persistent: boolean;
  ssh_host: string;
  ssh_port: number;
  ssh_user: string;
  ssh_key_path: string;
}

export interface HermesSecurity {
  redact_secrets: boolean;
  tirith_enabled: boolean;
  tirith_path: string;
  tirith_timeout: number;
  tirith_fail_open: boolean;
}

export interface HermesConfig {
  agent: HermesAgent;
  compression: HermesCompression;
  display: HermesDisplay;
  mcp_servers: HermesMcpServer[];
  provider_routing: HermesProviderRouting;
  fallback_model: HermesFallbackModel;
  auxiliary: HermesAuxiliary;
  channels: HermesChannelsConfig;
  terminal: HermesTerminal;
  security: HermesSecurity;
}

// ============================================================================
// GATEWAY CONFIGURATION
// ============================================================================

export interface GatewayConfig {
  host: string;
  port: number;
}

// ============================================================================
// TOOLS CONFIGURATION
// ============================================================================

export interface WebToolConfig {
  enabled: boolean;
  api_key: string;
  max_results: number;
}

export interface WebTools {
  brave: WebToolConfig;
  duckduckgo: WebToolConfig;
  perplexity: WebToolConfig;
  tavily: WebToolConfig & { base_url?: string };
  proxy: string;
  fetch_limit_bytes: number;
}

export interface ToolsConfig {
  web: WebTools;
  mcp: {
    enabled: boolean;
    servers: McpServersConfig;
  };
  cron: {
    exec_timeout_minutes: number;
  };
  exec: {
    enable_deny_patterns: boolean;
    custom_deny_patterns: string[];
    custom_allow_patterns: string[];
  };
  skills: {
    registries: {
      clawhub: {
        enabled: boolean;
        base_url: string;
        search_path: string;
        skills_path: string;
        download_path: string;
      };
    };
  };
}

// ============================================================================
// HEARTBEAT & DEVICES
// ============================================================================

export interface HeartbeatConfig {
  enabled: boolean;
  interval: number;
}

export interface DevicesConfig {
  enabled: boolean;
  monitor_usb: boolean;
}

// ============================================================================
// TOP-LEVEL APP CONFIG
// ============================================================================

export interface AppConfig {
  agents: AgentsConfig;
  channels: PicoCawChannelsConfig;
  hermes: HermesConfig;
  providers: ProvidersConfig;
  gateway: GatewayConfig;
  tools: ToolsConfig;
  heartbeat: HeartbeatConfig;
  devices: DevicesConfig;
}

/**
 * API Request/Response for saving configuration.
 * Extends AppConfig with a special _restartGateway flag.
 */
export interface SaveConfigPayload extends AppConfig {
  _restartGateway: boolean;
}
