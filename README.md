# PicoClaw Railway Template (1-click deploy)

This repo packages **PicoClaw** for Railway with a web-based configuration UI and gateway management dashboard.

## What you get

- **PicoClaw Gateway** managed as a subprocess with auto-restart
- A web **Configuration UI** at `/` (protected by Basic Auth) for editing providers, channels, agent defaults, and tools
- A **Status Dashboard** with live gateway state, provider/channel status, cron jobs, and real-time logs
- Persistent state via **Railway Volume** (config, workspace, sessions, and cron survive redeploys)

## How it works

- The container builds PicoClaw from source and runs a Python web server alongside it
- The web server provides a configuration editor that reads/writes `~/.picoclaw/config.json` directly
- On startup, if any provider API key is configured, the gateway starts automatically
- The gateway subprocess output is captured into a 500-line log buffer viewable from the Status tab

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_USERNAME` | `admin` | Username for Basic Auth |
| `ADMIN_PASSWORD` | *(auto-generated)* | Password for Basic Auth. **Check deploy logs for the generated password if not set.** |
| `PICOCLAW_VERSION` | `main` | Git branch/tag to build PicoClaw from |

## Getting chat tokens

### Telegram bot token

1. Open Telegram and message **@BotFather**
2. Run `/newbot` and follow the prompts
3. BotFather will give you a token like: `123456789:AA...`
4. Paste it into the Telegram channel config and add your user ID to the allow list

### Discord bot token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. **New Application** → pick a name
3. Open the **Bot** tab → **Add Bot**
4. Enable **MESSAGE CONTENT INTENT** under Privileged Gateway Intents
5. Copy the **Bot Token** and paste it into the Discord channel config
6. Invite the bot to your server (OAuth2 URL Generator → scopes: `bot`, `applications.commands`)

## Local testing

```bash
docker build -t picoclaw-railway-template .

docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e ADMIN_PASSWORD=test \
  -v $(pwd)/.tmpdata:/data \
  picoclaw-railway-template

# Open http://localhost:8080 (username: admin, password: test)
```

## FAQ

**Q: How do I access the configuration page?**

A: Go to your deployed instance's URL. When prompted for credentials, use `admin` as the username and the `ADMIN_PASSWORD` from your Railway Variables as the password.

**Q: Where do I find the auto-generated password?**

A: Check the deploy logs in Railway. The password is printed at startup: `Generated admin password: ...`

**Q: How do I change the AI model?**

A: Go to the Configuration tab → Agent Defaults → Model field. Set it to `provider/model-name` format (e.g., `anthropic/claude-opus-4-5`, `openai/gpt-4.1`).

**Q: The gateway isn't starting. What should I check?**

A: Make sure at least one provider has an API key configured. The gateway auto-starts only when an API key is present. You can also manually start it from the Status tab.

## When Shell Access is Still Required

Most operations can be performed via the Web UI, but some channels still require shell access for initial setup:

| Channel | Setup | Pairing Operations | Notes |
|---------|-------|-------------------|-------|
| Telegram | Web UI | Web UI | Pairing via UI |
| Discord | Web UI | Web UI | Pairing via UI |
| Slack | Web UI | Web UI | Pairing via UI |
| WhatsApp | **Shell** | Web UI | Initial setup requires shell |
| Signal | **Shell** | Web UI | Initial setup requires shell |
| Email | Web UI | N/A | No pairing needed |
| HomeAssistant | Web UI | N/A | No pairing needed |

**V1 Scope**: The Web UI pairing operations cover Telegram, Discord, and Slack. WhatsApp and Signal initial setup is **out of scope for V1** and still requires shell access.

## Pairing Operations from Web UI

When using the Hermes backend, you can manage pairings directly from the Status tab:

### Prerequisites
1. Ensure your backend is set to **Hermes** (Configuration → Agent Defaults → Backend)
2. Navigate to the **Status** tab

### Available Operations

**Refresh List** - View current pairings
- Click "Refresh List" to see all active and pending pairings
- Results display in JSON format below the buttons

**Approve Pairing** - Approve a pending pairing code
1. Select the platform from the dropdown
2. Enter the 8-character pairing code (uppercase letters and numbers, excluding 0, 1, O, I)
3. Click "Approve"
4. The list refreshes automatically on success

**Revoke Pairing** - Remove a user's pairing
1. Select the platform from the dropdown
2. Enter the user ID to revoke
3. Click "Revoke"
4. The list refreshes automatically on success

**Clear Pending** - Clear all pending pairing requests
- Click "Clear Pending" to remove all pending pairing requests
- Use with caution - this affects all platforms

## Security Notes

- **No arbitrary command execution**: The Web UI only allows predefined pairing operations
- **Allowlisted operations**: Only `list`, `approve`, `revoke`, and `clear-pending` are available
- **Audit logging**: All pairing operations are logged to `~/.hermes/pairing-audit.log`
- **Code redaction**: Pairing codes are partially redacted in logs (only last 2 characters stored)
- **Authentication required**: All pairing endpoints require valid Basic Auth credentials
- **Backend guard**: Operations only work when Hermes is the active backend
- **Input validation**: All inputs are validated against strict patterns before processing

## Hermes Custom Skill Verification

This section describes how to verify that custom skills are correctly installed and discoverable by the Hermes backend.

### Prerequisites

- **Docker**: Required for containerized testing
- **Python 3.12+**: For running pytest
- **pytest**: Test framework (`pip install pytest`)

### One-Command Verification

Run the full skill verification suite:

```bash
# Build and run all verification tests
docker build -t picoclaw-railway-template . && \
pytest tests/test_skill_runtime_matrix.py -v
```

For a quick check without full matrix:

```bash
# Run Hermes discovery baseline test
pytest tests/test_hermes_skill_discovery.py -v
```

### Status Interpretations

Each skill receives a terminal status:

| Status | Meaning |
|--------|---------|
| `pass` | All verification dimensions passed. Skill is fully functional. |
| `gated-env` | Skill structure is valid but requires API keys. Not a failure - just needs configuration. |
| `fail` | Critical issue detected. Missing files, invalid YAML, or unmet dependencies. |

### Verification Dimensions

The test suite checks four dimensions per skill:

1. **Packaging**: SKILL.md and _meta.json exist with valid YAML frontmatter
2. **Dependencies**: Required binaries and environment variables are available
3. **Hermes Discovery**: Skill exists in `/data/.hermes/skills` (Hermes canonical path)
4. **Wrapper**: CLI wrapper (if applicable) is executable

### Important: Wrapper Success ≠ Hermes Discovery

**Warning**: A skill wrapper executing successfully does NOT guarantee Hermes discovery.

- **Wrapper check**: Verifies `/usr/local/bin/<skill>` exists and runs
- **Hermes discovery**: Verifies skill exists in `/data/.hermes/skills`

These are independent dimensions. A skill can have a working wrapper but fail Hermes discovery if the skill directory is not properly synchronized to the Hermes path.

### Evidence Files

Test results are written to `.sisyphus/evidence/`:

- `task-10-runtime-matrix.json` - Full verification report for all 14 skills
- `task-5-hermes-baseline.txt` - Hermes discovery gap analysis
- `task-6-wrapper-divergence.json` - Wrapper vs Hermes divergence report

### Troubleshooting

**Skills not discovered by Hermes:**
- Check that `start.sh` copies skills to `/data/.hermes/skills`
- Verify the Hermes backend is configured correctly
- Run `ls -la /data/.hermes/skills/` inside the container

**Wrapper not found:**
- Verify Dockerfile creates the wrapper in `/usr/local/bin/`
- Check wrapper has executable permissions (`chmod +x`)
- Ensure wrapper script has correct shebang (`#!/bin/bash` or `#!/usr/bin/env python3`)

**Gated by API keys:**
- Set required environment variables in Railway
- Common keys: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- Gated status is NOT a failure - skills are structurally valid
