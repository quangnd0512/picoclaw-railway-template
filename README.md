# Agent Gateway UI

A unified web dashboard for managing AI agent backends — configure providers, channels, tools, and monitor gateway status across multiple agent runtimes from a single interface.

**Supported Backends:** [PicoClaw](https://github.com/sipeed/picoclaw) · [Hermes Agent](https://github.com/NousResearch/hermes-agent)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (React)                    │
│  Dashboard · Providers · Channels · Tools · Status   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP (Basic Auth)
┌───────────────────────┴─────────────────────────────┐
│              Python Server (Starlette)               │
│  Config API · Secret Masking · Process Lifecycle     │
└──────────┬─────────────────────────────┬────────────┘
           │                             │
    ┌──────┴──────┐              ┌───────┴──────┐
    │  PicoClaw   │              │    Hermes    │
    │  Gateway    │              │    Agent     │
    └─────────────┘              └──────────────┘
```

The server runs your chosen agent backend as a subprocess, intercepts stdout/stderr for live log streaming, and exposes a REST API for the React frontend to manage everything — no shell access needed for most operations.

## Features

### Multi-Backend Support
- **PicoClaw** — lightweight gateway with JSON config
- **Hermes Agent** — full-featured agent with YAML config, .env secrets, and MCP server support
- One-click backend switching from the UI — the server stops the current gateway, persists your choice, and starts the new one

### Configuration Management
- **Providers** — Anthropic, OpenAI, OpenRouter, DeepSeek, Groq, Gemini, Zhipu, vLLM, NVIDIA, Moonshot, MiniMax
- **Channels** — Telegram, Discord, Slack, WhatsApp, Signal, Email, HomeAssistant, Feishu, DingTalk, QQ, Line, MaixCam
- **Agent Defaults** — model selection, token limits, temperature, workspace restrictions
- **Secrets** — API keys are masked on read (`sk-abc...***`) and preserved on write (masked values never overwrite real keys)

### Tools & Integrations
- **Web Search** — Brave, DuckDuckGo, Perplexity, Tavily
- **MCP Servers** — configure external MCP tool servers (Context7, filesystem, GitHub, custom)
- **Cron Jobs** — scheduled agent tasks with configurable timeouts
- **Exec Tool** — command execution with allow/deny pattern lists (PicoClaw backend)
- **Skills** — 14 pre-installed skills, ClawHub registry integration

### Operations
- **Live Logs** — real-time gateway output with ANSI stripping, 500-line rolling buffer
- **Status Dashboard** — gateway state, PID, uptime, restart count, provider/channel status
- **Hermes Pairing** — manage channel pairings (list, approve, revoke, clear-pending) directly from the UI
- **Audit Trail** — pairing operations logged to JSONL with code redaction
- **Auto-Restart** — gateway crashes trigger automatic recovery

### Frontend
- React 19 + TypeScript + Vite + Tailwind CSS v4
- Dark mode (follows system preference)
- TanStack Query for data fetching
- Unsaved changes detection with review modal
- Floating apply button with change count

## Quick Start

### Deploy to Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/)

1. Click deploy — Railway builds from the Dockerfile automatically
2. Set `ADMIN_PASSWORD` in Railway Variables (or check deploy logs for the auto-generated one)
3. Open your Railway URL, log in with `admin` / your password
4. Configure a provider API key → gateway starts automatically

### Run Locally (Docker)

```bash
# Build
make build

# Run (default password: test)
make run

# Open http://localhost:8080
# Username: admin | Password: test
```

Or manually:

```bash
docker build -t agent-gateway-ui .

docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e ADMIN_PASSWORD=test \
  -v $(pwd)/.tmpdata:/data \
  agent-gateway-ui
```

### Run Without Docker

```bash
# Install Python dependencies
pip install -r requirements.txt

# Build frontend
cd frontend && npm install && npm run build && cd ..

# Start server
python server.py
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_USERNAME` | `admin` | Basic Auth username |
| `ADMIN_PASSWORD` | *(auto-generated)* | Basic Auth password. Printed at startup if not set. |
| `PICOCLAW_VERSION` | `main` | Git branch/tag to build PicoClaw from |
| `PORT` | `8080` | Server listen port |

### Persistent Data

All state is stored under `/data` (mounted as a Docker volume):

```
/data/
├── .picoclaw/
│   ├── config.json          # PicoClaw config
│   ├── workspace/skills/    # Installed skills
│   ├── sessions/            # Agent session history
│   └── cron/                # Scheduled job definitions
├── .hermes/
│   ├── config.yaml          # Hermes config
│   ├── .env                 # Channel/provider secrets
│   └── skills -> ../picoclaw/workspace/skills  # Symlink
└── .gateway-meta.json       # Active backend selection
```

## Getting Chat Tokens

<details>
<summary><strong>Telegram</strong></summary>

1. Message **@BotFather** on Telegram
2. Run `/newbot`, follow the prompts
3. Copy the token (`123456789:AA...`)
4. Paste into the Telegram channel config + add your user ID to the allow list
</details>

<details>
<summary><strong>Discord</strong></summary>

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. **New Application** → **Bot** tab → **Add Bot**
3. Enable **MESSAGE CONTENT INTENT**
4. Copy the Bot Token
5. Invite to your server (OAuth2 URL Generator → scopes: `bot`, `applications.commands`)
</details>

<details>
<summary><strong>Slack</strong></summary>

1. Create a [Slack App](https://api.slack.com/apps)
2. Enable Socket Mode (generates App Token)
3. Add Bot Token Scopes: `app_mentions:read`, `chat:write`, `channels:history`, `im:history`
4. Install to workspace, copy Bot Token and App Token
</details>

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/config` | Get config (secrets masked) |
| `PUT` | `/api/config` | Update config (secrets preserved) |
| `GET` | `/api/status` | Gateway state + provider/channel status |
| `GET` | `/api/audit` | Cron jobs, sessions, skills, MCP servers |
| `GET` | `/api/logs` | Live gateway log lines |
| `POST` | `/api/gateway/start` | Start gateway |
| `POST` | `/api/gateway/stop` | Stop gateway |
| `POST` | `/api/gateway/restart` | Restart gateway |
| `GET` | `/api/backend` | Current backend + available options |
| `POST` | `/api/backend` | Switch backend |
| `GET` | `/api/hermes/pairing/list` | List Hermes pairings |
| `POST` | `/api/hermes/pairing/approve` | Approve a pairing |
| `POST` | `/api/hermes/pairing/revoke` | Revoke a pairing |
| `POST` | `/api/hermes/pairing/clear-pending` | Clear all pending pairings |

All endpoints require Basic Auth.

## Adding a New Backend

The `BaseGatewayManager` abstract class defines the interface. To add a new backend:

```python
class MyBackendManager(BaseGatewayManager):
    def get_command(self) -> tuple[str, ...]:
        return ("my-agent", "serve")

    def get_config_path(self) -> Path:
        return Path.home() / ".myagent" / "config.yaml"

    def read_config(self) -> dict: ...
    def write_config(self, data: dict): ...
    def get_env(self) -> dict[str, str] | None: ...
    def mask_secrets(self, data, _path=""): ...
    def merge_secrets(self, new_data, existing_data, _path=""): ...
```

Then register it in `server.py`:

```python
managers = {
    "picoclaw": gateway,
    "hermes": hermes_gateway,
    "my-backend": MyBackendManager(),
}
AVAILABLE_BACKENDS = ["picoclaw", "hermes", "my-backend"]
```

The frontend automatically picks up the new backend from `/api/backend`.

## Pre-Installed Skills

| Skill | Description |
|-------|-------------|
| stock-analysis | Stock scanning, portfolio tracking, dividend analysis |
| finance-news | Market briefings, portfolio-aware news aggregation |
| trading-research | Technical indicators, strategy backtesting |
| crypto-market-data | Real-time crypto prices and market data |
| news-aggregator-skill | Multi-source news fetching and deduplication |
| reddit-insights | Reddit thread analysis and trending topics |
| x-research | Twitter/X research and monitoring |
| web-search | Enhanced web search with content extraction |
| github | GitHub API operations |
| blogwatcher | RSS/Atom feed monitoring |
| summarize | Content summarization |
| gemini-deep-research | Deep research using Gemini |
| find-skills | Skill discovery from registries |
| self-improving-agent | Agent self-improvement and learning loops |

## Troubleshooting

**Gateway won't start**
→ Ensure at least one provider has an API key. The gateway auto-starts only when a key is present. Manually start from the Status tab if needed.

**Auto-generated password**
→ Check Railway deploy logs. Look for: `Generated admin password: ...`

**Hermes skills not discovered**
→ `start.sh` creates a symlink from `/data/.hermes/skills` → `/data/.picoclaw/workspace/skills`. Verify with `ls -la /data/.hermes/skills` inside the container.

**Channel requires shell setup**
→ WhatsApp and Signal initial setup still require shell access. See channel docs for details.

## License

See [LICENSE](LICENSE) for details.
