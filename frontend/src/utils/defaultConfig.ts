import type { AppConfig } from '../types/config';

export function defaultConfig(): AppConfig {
  return {
    agents: {
      defaults: {
        workspace: '~/.picoclaw/workspace',
        restrict_to_workspace: true,
        allow_read_outside_workspace: false,
        provider: '',
        model: 'glm-4.7',
        max_tokens: 8192,
        temperature: 0.7,
        max_tool_iterations: 20,
      },
    },
    channels: {
      telegram: { enabled: false, token: '', proxy: '', allow_from: [] },
      discord: { enabled: false, token: '', allow_from: [] },
      slack: { enabled: false, bot_token: '', app_token: '', allow_from: [] },
      whatsapp: { enabled: false, bridge_url: 'ws://localhost:3001', allow_from: [] },
      feishu: { enabled: false, app_id: '', app_secret: '', encrypt_key: '', verification_token: '', allow_from: [] },
      dingtalk: { enabled: false, client_id: '', client_secret: '', allow_from: [] },
      qq: { enabled: false, app_id: '', app_secret: '', allow_from: [] },
      line: { enabled: false, channel_secret: '', channel_access_token: '', webhook_host: '0.0.0.0', webhook_port: 18791, webhook_path: '/webhook/line', allow_from: [] },
      maixcam: { enabled: false, host: '0.0.0.0', port: 18790, allow_from: [] },
    },
    hermes: {
      agent: { max_turns: 90, system_prompt: '', reasoning_effort: 'medium', personalities: '' },
      compression: { enabled: true, threshold: 0.5, summary_model: '', summary_provider: '' },
      display: { compact: false, personality: 'kawaii', resume_display: 'full', bell_on_complete: false, show_reasoning: false, skin: '' },
      mcp_servers: [],
      provider_routing: { sort: 'price', only: '', ignore: '', order: '', require_parameters: false, data_collection: 'deny' },
      fallback_model: { provider: '', model: '' },
      auxiliary: {
        vision: { provider: '', model: '', base_url: '', api_key: '' },
        web_extract: { provider: '', model: '', base_url: '', api_key: '' },
      },
      channels: {
        telegram: { enabled: false, bot_token: '', token: '', home_channel: '', home_channel_name: '', allowed_users: '', allow_from: [], allow_all_users: false },
        discord: { enabled: false, bot_token: '', token: '', allowed_users: '', allow_from: [], allow_bots: false, require_mention: false, free_response_channels: '', auto_thread: false },
        slack: { enabled: false, bot_token: '', app_token: '', home_channel: '', home_channel_name: '', allowed_users: '', allow_all_users: false },
        whatsapp: { enabled: false, mode: 'local', allowed_users: '', allow_all_users: false },
        signal: { enabled: false, http_url: '', account: '', ignore_stories: true, home_channel: '', home_channel_name: '', group_allowed_users: '', allowed_users: '', allow_all_users: false },
        email: { enabled: false, address: '', password: '', imap_host: '', smtp_host: '', imap_port: 993, smtp_port: 465, poll_interval: 60, home_address: '', home_address_name: '', allowed_users: '', allow_all_users: false },
        homeassistant: { enabled: false, token: '', url: '' },
      },
      terminal: {
        backend: 'native',
        cwd: '',
        timeout: 300,
        docker_image: '',
        container_cpu: '',
        container_memory: '',
        container_disk: '',
        container_persistent: false,
        ssh_host: '',
        ssh_port: 22,
        ssh_user: '',
        ssh_key_path: '',
      },
      security: {
        redact_secrets: true,
        tirith_enabled: false,
        tirith_path: '',
        tirith_timeout: 30,
        tirith_fail_open: false,
      },
    },
    providers: {
      anthropic: { api_key: '' },
      openai: { api_key: '', api_base: '', base_url: '' },
      openrouter: { api_key: '' },
      deepseek: { api_key: '' },
      groq: { api_key: '' },
      gemini: { api_key: '' },
      zhipu: { api_key: '', api_base: '' },
      zai: { api_key: '' },
      vllm: { api_key: '', api_base: '' },
      nvidia: { api_key: '', api_base: '' },
      moonshot: { api_key: '' },
      minimax: { api_key: '' },
      custom: { api_key: '', base_url: '', model: '' },
    },
    gateway: { host: '0.0.0.0', port: 18790 },
    tools: {
      web: {
        brave: { enabled: false, api_key: '', max_results: 5 },
        duckduckgo: { enabled: true, api_key: '', max_results: 5 },
        perplexity: { enabled: false, api_key: '', max_results: 5 },
        tavily: { enabled: false, api_key: '', base_url: '', max_results: 5 },
        proxy: '',
        fetch_limit_bytes: 10485760,
      },
      mcp: {
        enabled: false,
        servers: {
          context7: {
            enabled: false,
            type: 'http',
            url: 'https://mcp.context7.com/mcp',
          },
          filesystem: {
            enabled: false,
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
          },
          github: {
            enabled: false,
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-github'],
            env: { GITHUB_PERSONAL_ACCESS_TOKEN: '' },
          },
        },
      },
      cron: {
        exec_timeout_minutes: 5,
      },
      exec: {
        enable_deny_patterns: true,
        custom_deny_patterns: [],
        custom_allow_patterns: [],
      },
      skills: {
        registries: {
          clawhub: {
            enabled: true,
            base_url: 'https://clawhub.ai',
            search_path: '/api/v1/search',
            skills_path: '/api/v1/skills',
            download_path: '/api/v1/download',
          },
        },
      },
    },
    heartbeat: { enabled: true, interval: 30 },
    devices: { enabled: false, monitor_usb: false },
  };
}
