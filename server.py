import asyncio
import base64
import importlib
import json
import os
import re
import secrets
import signal
import time
from abc import ABC, abstractmethod
from collections import deque
from pathlib import Path

import yaml
from starlette.applications import Starlette
from starlette.authentication import (
    AuthCredentials,
    AuthenticationBackend,
    AuthenticationError,
    SimpleUser,
)
from starlette.middleware import Middleware
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, PlainTextResponse
from starlette.routing import Route
from starlette.templating import Jinja2Templates

dotenv = importlib.import_module("dotenv")

ANSI_ESCAPE = re.compile(r"\x1b\[[0-9;]*m")
HERMES_SECRET_FIELDS = {
    "api_key",
    "token",
    "bot_token",
    "app_token",
    "app_secret",
    "client_secret",
    "channel_secret",
    "channel_access_token",
    "encrypt_key",
    "verification_token",
    "SLACK_BOT_TOKEN",
    "SLACK_APP_TOKEN",
    "EMAIL_PASSWORD",
    "HASS_TOKEN",
    "GLM_API_KEY",
    "ZAI_API_KEY",
    "Z_AI_API_KEY",
    "KIMI_API_KEY",
    "MINIMAX_API_KEY",
    "MINIMAX_CN_API_KEY",
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_TOKEN",
    "AUXILIARY_VISION_API_KEY",
    "AUXILIARY_WEB_EXTRACT_API_KEY",
}

templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")

if not ADMIN_PASSWORD:
    ADMIN_PASSWORD = secrets.token_urlsafe(16)
    print(f"Generated admin password: {ADMIN_PASSWORD}")


class BasicAuthBackend(AuthenticationBackend):
    async def authenticate(self, conn):
        if "Authorization" not in conn.headers:
            return None

        auth = conn.headers["Authorization"]
        try:
            scheme, credentials = auth.split()
            if scheme.lower() != "basic":
                return None
            decoded = base64.b64decode(credentials).decode("ascii")
        except (ValueError, UnicodeDecodeError):
            raise AuthenticationError("Invalid credentials")

        username, _, password = decoded.partition(":")
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            return AuthCredentials(["authenticated"]), SimpleUser(username)

        raise AuthenticationError("Invalid credentials")


def require_auth(request: Request):
    if not request.user.is_authenticated:
        return PlainTextResponse(
            "Unauthorized",
            status_code=401,
            headers={"WWW-Authenticate": 'Basic realm="picoclaw"'},
        )
    return None


def default_config():
    return {
        "agents": {
            "defaults": {
                "workspace": "~/.picoclaw/workspace",
                "restrict_to_workspace": True,
                "allow_read_outside_workspace": False,
                "provider": "",
                "model": "glm-4.7",
                "max_tokens": 8192,
                "temperature": 0.7,
                "max_tool_iterations": 20,
            }
        },
        "channels": {
            "telegram": {"enabled": False, "token": "", "proxy": "", "allow_from": []},
            "discord": {"enabled": False, "token": "", "allow_from": []},
            "slack": {"enabled": False, "bot_token": "", "app_token": "", "allow_from": []},
            "whatsapp": {"enabled": False, "bridge_url": "ws://localhost:3001", "allow_from": []},
            "feishu": {"enabled": False, "app_id": "", "app_secret": "", "encrypt_key": "", "verification_token": "", "allow_from": []},
            "dingtalk": {"enabled": False, "client_id": "", "client_secret": "", "allow_from": []},
            "qq": {"enabled": False, "app_id": "", "app_secret": "", "allow_from": []},
            "line": {"enabled": False, "channel_secret": "", "channel_access_token": "", "webhook_host": "0.0.0.0", "webhook_port": 18791, "webhook_path": "/webhook/line", "allow_from": []},
            "maixcam": {"enabled": False, "host": "0.0.0.0", "port": 18790, "allow_from": []},
        },
        "providers": {
            "anthropic": {"api_key": ""},
            "openai": {"api_key": "", "api_base": ""},
            "openrouter": {"api_key": ""},
            "deepseek": {"api_key": ""},
            "groq": {"api_key": ""},
            "gemini": {"api_key": ""},
            "zhipu": {"api_key": "", "api_base": ""},
            "vllm": {"api_key": "", "api_base": ""},
            "nvidia": {"api_key": "", "api_base": ""},
            "moonshot": {"api_key": ""},
        },
        "gateway": {"host": "0.0.0.0", "port": 18790},
        "tools": {
            "web": {
                "brave": {"enabled": False, "api_key": "", "max_results": 5},
                "duckduckgo": {"enabled": True, "max_results": 5},
                "perplexity": {"enabled": False, "api_key": "", "max_results": 5},
                "tavily": {"enabled": False, "api_key": "", "base_url": "", "max_results": 5},
                "proxy": "",
                "fetch_limit_bytes": 10485760
            },
            "mcp": {
                "enabled": False,
                "servers": {
                "context7": {
                    "enabled": False,
                    "type": "http",
                    "url": "https://mcp.context7.com/mcp"
                },
                "filesystem": {
                    "enabled": False,
                    "command": "npx",
                    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
                },
                "github": {
                    "enabled": False,
                    "command": "npx",
                    "args": ["-y", "@modelcontextprotocol/server-github"],
                    "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "" }
                }
                }
            },
            "cron": {
                "exec_timeout_minutes": 5
            },
            "exec": {
                "enable_deny_patterns": True,
                "custom_deny_patterns": [],
                "custom_allow_patterns": []
            },
            "skills": {
                "registries": {
                    "clawhub": {
                        "enabled": True,
                        "base_url": "https://clawhub.ai",
                        "search_path": "/api/v1/search",
                        "skills_path": "/api/v1/skills",
                        "download_path": "/api/v1/download"
                    }
                }
            }
        },
        "heartbeat": {"enabled": True, "interval": 30},
        "devices": {"enabled": False, "monitor_usb": False},
    }


class BaseGatewayManager(ABC):
    def __init__(self):
        self.process: asyncio.subprocess.Process | None = None
        self.state = "stopped"
        self.logs: deque[str] = deque(maxlen=500)
        self.start_time: float | None = None
        self.restart_count = 0
        self._read_tasks: list[asyncio.Task] = []
        self._auto_restart_task: asyncio.Task | None = None
        self._manual_stop_requested = False

    @abstractmethod
    def get_command(self) -> tuple[str, ...]:
        raise NotImplementedError

    @abstractmethod
    def get_config_path(self) -> Path:
        raise NotImplementedError

    @abstractmethod
    def read_config(self) -> dict:
        raise NotImplementedError

    @abstractmethod
    def write_config(self, data: dict):
        raise NotImplementedError

    @abstractmethod
    def get_env(self) -> dict[str, str] | None:
        raise NotImplementedError

    @abstractmethod
    def mask_secrets(self, data, _path=""):
        raise NotImplementedError

    @abstractmethod
    def merge_secrets(self, new_data, existing_data, _path=""):
        raise NotImplementedError

    async def start(self):
        if self.process and self.process.returncode is None:
            return
        self._manual_stop_requested = False
        self.state = "starting"
        try:
            command = self.get_command()
            self.process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                env=self.get_env(),
            )
            self.state = "running"
            self.start_time = time.time()
            task = asyncio.create_task(self._read_output())
            self._read_tasks.append(task)
            task.add_done_callback(lambda t: self._read_tasks.remove(t) if t in self._read_tasks else None)
        except Exception as e:
            self.state = "error"
            self.logs.append(f"Failed to start gateway: {e}")

    async def stop(self):
        self._manual_stop_requested = True
        if self._auto_restart_task and not self._auto_restart_task.done():
            self._auto_restart_task.cancel()
        if not self.process or self.process.returncode is not None:
            self.state = "stopped"
            self.start_time = None
            return
        self.state = "stopping"
        self.process.terminate()
        try:
            await asyncio.wait_for(self.process.wait(), timeout=10)
        except asyncio.TimeoutError:
            self.process.kill()
            await self.process.wait()
        self.state = "stopped"
        self.start_time = None

    async def restart(self):
        await self.stop()
        self.restart_count += 1
        await self.start()

    async def _read_output(self):
        try:
            while self.process and self.process.stdout:
                line = await self.process.stdout.readline()
                if not line:
                    break
                decoded = line.decode("utf-8", errors="replace").rstrip()
                cleaned = ANSI_ESCAPE.sub("", decoded)
                self.logs.append(cleaned)
        except asyncio.CancelledError:
            return
        if self.process and self.process.returncode is not None and self.state == "running":
            self.state = "error"
            self.logs.append(f"Gateway exited with code {self.process.returncode}")
            if not self._manual_stop_requested:
                self._auto_restart_task = asyncio.create_task(self._auto_restart())

    async def _auto_restart(self):
        try:
            await asyncio.sleep(1)
            if self.state == "error" and not self._manual_stop_requested:
                self.restart_count += 1
                await self.start()
        except asyncio.CancelledError:
            return

    def get_status(self) -> dict:
        pid = None
        if self.process and self.process.returncode is None:
            pid = self.process.pid
        uptime = None
        if self.start_time and self.state == "running":
            uptime = int(time.time() - self.start_time)
        return {
            "state": self.state,
            "pid": pid,
            "uptime": uptime,
            "restart_count": self.restart_count,
        }


class PicoClawManager(BaseGatewayManager):
    SECRET_FIELDS = {
        "api_key", "token", "app_secret", "encrypt_key",
        "verification_token", "bot_token", "app_token",
        "channel_secret", "channel_access_token", "client_secret",
        "SLACK_BOT_TOKEN", "SLACK_APP_TOKEN", "EMAIL_PASSWORD", "HASS_TOKEN",
        "GLM_API_KEY", "ZAI_API_KEY", "Z_AI_API_KEY", "KIMI_API_KEY",
        "MINIMAX_API_KEY", "MINIMAX_CN_API_KEY", "ANTHROPIC_API_KEY", "ANTHROPIC_TOKEN",
        "AUXILIARY_VISION_API_KEY", "AUXILIARY_WEB_EXTRACT_API_KEY",
    }

    def __init__(self):
        super().__init__()
        self.config_dir = Path(os.environ.get("PICOCLAW_HOME", Path.home() / ".picoclaw"))
        self.config_path = self.config_dir / "config.json"

    def get_command(self) -> tuple[str, ...]:
        return ("picoclaw", "gateway")

    def get_config_path(self) -> Path:
        return self.config_path

    def read_config(self) -> dict:
        if not self.config_path.exists():
            return default_config()
        try:
            return json.loads(self.config_path.read_text())
        except Exception:
            return default_config()

    def write_config(self, data: dict):
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.config_path.write_text(json.dumps(data, indent=2))

    def get_env(self) -> dict[str, str] | None:
        return None

    def mask_secrets(self, data, _path=""):
        if isinstance(data, dict):
            result = {}
            is_mcp_secret = (
                re.search(r"\.mcp\.servers\.[^.]+\.env$", _path) is not None
                or re.search(r"\.mcp\.servers\.[^.]+\.headers$", _path) is not None
            )
            for k, v in data.items():
                if (k in self.SECRET_FIELDS or is_mcp_secret) and isinstance(v, str) and v:
                    result[k] = v[:8] + "***" if len(v) > 8 else "***"
                else:
                    result[k] = self.mask_secrets(v, f"{_path}.{k}")
            return result
        if isinstance(data, list):
            return [self.mask_secrets(item, _path) for item in data]
        return data

    def merge_secrets(self, new_data, existing_data, _path=""):
        if isinstance(new_data, dict) and isinstance(existing_data, dict):
            result = {}
            is_mcp_secret = (
                re.search(r"\.mcp\.servers\.[^.]+\.env$", _path) is not None
                or re.search(r"\.mcp\.servers\.[^.]+\.headers$", _path) is not None
            )
            for k in set(existing_data.keys()) | set(new_data.keys()):
                if k not in new_data:
                    result[k] = existing_data[k]
                    continue
                v = new_data[k]
                if (k in self.SECRET_FIELDS or is_mcp_secret) and isinstance(v, str) and (v.endswith("***") or v == ""):
                    result[k] = existing_data.get(k, "")
                else:
                    result[k] = self.merge_secrets(v, existing_data.get(k, {}), f"{_path}.{k}")
            return result
        return new_data


class HermesManager(BaseGatewayManager):
    SECRET_FIELDS = HERMES_SECRET_FIELDS

    PROVIDER_ENV_KEYS = {
        "openrouter": "OPENROUTER_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "openai": "OPENAI_API_KEY",
        "zhipu": "GLM_API_KEY",
        "moonshot": "KIMI_API_KEY",
        "minimax": "MINIMAX_API_KEY",
        "minimax_cn": "MINIMAX_CN_API_KEY",
    }

    def __init__(self):
        super().__init__()
        self.config_dir = Path.home() / ".hermes"
        self.config_path = self.config_dir / "config.yaml"
        self.env_path = self.config_dir / ".env"

    def get_command(self) -> tuple[str, ...]:
        return ("hermes", "gateway")

    def get_config_path(self) -> Path:
        return self.config_path

    def _default_hermes_yaml(self) -> dict:
        return {
            "model": {
                "provider": "openrouter",
                "default": "anthropic/claude-3.5-sonnet",
            },
            "agent": {
                "max_turns": 90,
                "system_prompt": "",
                "reasoning_effort": "medium",
                "personalities": "",
            },
            "auxiliary": {
                "vision": {
                    "provider": "auto",
                    "model": "openai/gpt-4o",
                },
                "web_extract": {
                    "provider": "auto",
                    "model": "google/gemini-2.5-flash",
                },
            },
            "compression": {
                "enabled": True,
                "threshold": 0.50,
                "summary_model": "",
                "summary_provider": "",
            },
            "display": {
                "compact": False,
                "personality": "kawaii",
                "resume_display": "full",
                "bell_on_complete": False,
                "show_reasoning": False,
                "skin": "",
            },
            "mcp_servers": {},
            "provider_routing": {
                "sort": "price",
                "only": "",
                "ignore": "",
                "order": "",
                "require_parameters": False,
                "data_collection": "deny",
            },
            "fallback_model": {
                "provider": "",
                "model": "",
            },
        }

    def _ensure_default_files(self):
        self.config_dir.mkdir(parents=True, exist_ok=True)
        if not self.config_path.exists():
            self.config_path.write_text(yaml.safe_dump(self._default_hermes_yaml(), sort_keys=False))
        if not self.env_path.exists():
            self.env_path.write_text("")

    def _read_env_file(self) -> dict[str, str]:
        if not self.env_path.exists():
            return {}

        dotenv.load_dotenv(dotenv_path=self.env_path, override=True)

        env_data: dict[str, str] = {}
        for line in self.env_path.read_text().splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in stripped:
                continue
            key, value = stripped.split("=", 1)
            env_data[key.strip()] = value.strip()
        return env_data

    def _write_env_file(self, env_data: dict[str, str]):
        lines = [f"{k}={v}" for k, v in sorted(env_data.items())]
        content = "\n".join(lines)
        if content:
            content += "\n"
        self.env_path.write_text(content)

    def _split_csv(self, value: str) -> list[str]:
        if not value:
            return []
        return [item.strip() for item in value.split(",") if item.strip()]

    def _join_csv(self, values) -> str:
        if isinstance(values, str):
            return values
        if not isinstance(values, list):
            return ""
        return ",".join(str(v).strip() for v in values if str(v).strip())

    def _strip_secrets_for_yaml(self, value):
        if isinstance(value, dict):
            out = {}
            for k, v in value.items():
                if k in self.SECRET_FIELDS:
                    continue
                out[k] = self._strip_secrets_for_yaml(v)
            return out
        if isinstance(value, list):
            return [self._strip_secrets_for_yaml(item) for item in value]
        return value

    def read_config(self) -> dict:
        self._ensure_default_files()

        try:
            yaml_data = yaml.safe_load(self.config_path.read_text()) or {}
        except Exception:
            yaml_data = self._default_hermes_yaml()

        env_data = self._read_env_file()
        config = default_config()
        config["agents"]["defaults"]["provider"] = "auto"
        if "hermes" not in config:
            config["hermes"] = {}

        model = yaml_data.get("model", {}) if isinstance(yaml_data, dict) else {}
        if isinstance(model, dict):
            model_provider = str(model.get("provider", "") or "")
            config["agents"]["defaults"]["provider"] = model_provider or "auto"
            config["agents"]["defaults"]["model"] = str(model.get("default", "") or "")

        auxiliary = yaml_data.get("auxiliary", {}) if isinstance(yaml_data, dict) else {}
        if isinstance(auxiliary, dict):
            config["hermes"]["auxiliary"] = auxiliary

        config["providers"]["openrouter"]["api_key"] = env_data.get("OPENROUTER_API_KEY", "")
        config["providers"]["anthropic"]["api_key"] = env_data.get("ANTHROPIC_API_KEY", "")
        config["providers"]["zhipu"]["api_key"] = env_data.get("GLM_API_KEY", "")
        config["providers"]["moonshot"]["api_key"] = env_data.get("KIMI_API_KEY", "")

        config["providers"]["openai"]["api_key"] = env_data.get("OPENAI_API_KEY", "")
        config["providers"]["openai"]["api_base"] = env_data.get("OPENAI_BASE_URL", "")

        telegram_channel = {
            "bot_token": env_data.get("TELEGRAM_BOT_TOKEN", ""),
            "token": env_data.get("TELEGRAM_BOT_TOKEN", ""),
            "home_channel": env_data.get("TELEGRAM_HOME_CHANNEL", ""),
            "home_channel_name": env_data.get("TELEGRAM_HOME_CHANNEL_NAME", ""),
            "allowed_users": env_data.get("TELEGRAM_ALLOWED_USERS", ""),
            "allow_from": self._split_csv(env_data.get("TELEGRAM_ALLOWED_USERS", "")),
            "allow_all_users": env_data.get("TELEGRAM_ALLOW_ALL_USERS", "").lower() == "true",
            "enabled": bool(env_data.get("TELEGRAM_BOT_TOKEN", "")),
        }
        config["channels"]["telegram"] = telegram_channel

        discord_channel = {
            "bot_token": env_data.get("DISCORD_BOT_TOKEN", ""),
            "token": env_data.get("DISCORD_BOT_TOKEN", ""),
            "allowed_users": env_data.get("DISCORD_ALLOWED_USERS", ""),
            "allow_from": self._split_csv(env_data.get("DISCORD_ALLOWED_USERS", "")),
            "allow_bots": env_data.get("DISCORD_ALLOW_BOTS", "").lower() == "true",
            "require_mention": env_data.get("DISCORD_REQUIRE_MENTION", "").lower() == "true",
            "free_response_channels": env_data.get("DISCORD_FREE_RESPONSE_CHANNELS", ""),
            "auto_thread": env_data.get("DISCORD_AUTO_THREAD", "").lower() == "true",
            "enabled": bool(env_data.get("DISCORD_BOT_TOKEN", "")),
        }
        config["channels"]["discord"] = discord_channel

        slack_channel = {
            "bot_token": env_data.get("SLACK_BOT_TOKEN", ""),
            "app_token": env_data.get("SLACK_APP_TOKEN", ""),
            "home_channel": env_data.get("SLACK_HOME_CHANNEL", ""),
            "home_channel_name": env_data.get("SLACK_HOME_CHANNEL_NAME", ""),
            "allowed_users": env_data.get("SLACK_ALLOWED_USERS", ""),
            "allow_from": self._split_csv(env_data.get("SLACK_ALLOWED_USERS", "")),
            "allow_all_users": env_data.get("SLACK_ALLOW_ALL_USERS", "").lower() == "true",
            "enabled": bool(env_data.get("SLACK_BOT_TOKEN", "")),
        }
        config["channels"]["slack"] = slack_channel

        whatsapp_channel = {
            "enabled": env_data.get("WHATSAPP_ENABLED", "").lower() == "true",
            "mode": env_data.get("WHATSAPP_MODE", ""),
            "allowed_users": env_data.get("WHATSAPP_ALLOWED_USERS", ""),
            "allow_from": self._split_csv(env_data.get("WHATSAPP_ALLOWED_USERS", "")),
            "allow_all_users": env_data.get("WHATSAPP_ALLOW_ALL_USERS", "").lower() == "true",
        }
        config["channels"]["whatsapp"] = whatsapp_channel

        signal_channel = {
            "http_url": env_data.get("SIGNAL_HTTP_URL", ""),
            "account": env_data.get("SIGNAL_ACCOUNT", ""),
            "ignore_stories": env_data.get("SIGNAL_IGNORE_STORIES", "").lower() == "true",
            "home_channel": env_data.get("SIGNAL_HOME_CHANNEL", ""),
            "home_channel_name": env_data.get("SIGNAL_HOME_CHANNEL_NAME", ""),
            "group_allowed_users": env_data.get("SIGNAL_GROUP_ALLOWED_USERS", ""),
            "allowed_users": env_data.get("SIGNAL_ALLOWED_USERS", ""),
            "allow_from": self._split_csv(env_data.get("SIGNAL_ALLOWED_USERS", "")),
            "allow_all_users": env_data.get("SIGNAL_ALLOW_ALL_USERS", "").lower() == "true",
            "enabled": bool(env_data.get("SIGNAL_HTTP_URL", "")) and bool(env_data.get("SIGNAL_ACCOUNT", "")),
        }
        config["channels"]["signal"] = signal_channel

        email_channel = {
            "address": env_data.get("EMAIL_ADDRESS", ""),
            "password": env_data.get("EMAIL_PASSWORD", ""),
            "imap_host": env_data.get("EMAIL_IMAP_HOST", ""),
            "smtp_host": env_data.get("EMAIL_SMTP_HOST", ""),
            "imap_port": env_data.get("EMAIL_IMAP_PORT", ""),
            "smtp_port": env_data.get("EMAIL_SMTP_PORT", ""),
            "poll_interval": env_data.get("EMAIL_POLL_INTERVAL", ""),
            "home_address": env_data.get("EMAIL_HOME_ADDRESS", ""),
            "home_address_name": env_data.get("EMAIL_HOME_ADDRESS_NAME", ""),
            "allowed_users": env_data.get("EMAIL_ALLOWED_USERS", ""),
            "allow_from": self._split_csv(env_data.get("EMAIL_ALLOWED_USERS", "")),
            "allow_all_users": env_data.get("EMAIL_ALLOW_ALL_USERS", "").lower() == "true",
            "enabled": bool(env_data.get("EMAIL_ADDRESS", "")) and bool(env_data.get("EMAIL_PASSWORD", "")) and bool(env_data.get("EMAIL_IMAP_HOST", "")) and bool(env_data.get("EMAIL_SMTP_HOST", "")),
        }
        config["channels"]["email"] = email_channel

        homeassistant_channel = {
            "token": env_data.get("HASS_TOKEN", ""),
            "url": env_data.get("HASS_URL", ""),
            "enabled": bool(env_data.get("HASS_TOKEN", "")),
        }
        config["channels"]["homeassistant"] = homeassistant_channel

        if "hermes" not in config:
            config["hermes"] = {}

        config["hermes"]["channels"] = {
            "telegram": telegram_channel,
            "discord": discord_channel,
            "slack": slack_channel,
            "whatsapp": whatsapp_channel,
            "signal": signal_channel,
            "email": email_channel,
            "homeassistant": homeassistant_channel,
        }

        compression = yaml_data.get("compression", {}) if isinstance(yaml_data, dict) else {}
        if isinstance(compression, dict):
            config["hermes"]["compression"] = compression

        display = yaml_data.get("display", {}) if isinstance(yaml_data, dict) else {}
        if isinstance(display, dict):
            config["hermes"]["display"] = display

        mcp_servers_dict = yaml_data.get("mcp_servers", {}) if isinstance(yaml_data, dict) else {}
        mcp_servers_list = []
        for name, srv in mcp_servers_dict.items():
            srv_copy = dict(srv)
            srv_copy["name"] = name
            if isinstance(srv_copy.get("args"), list):
                srv_copy["args"] = ",".join(srv_copy["args"])
            if isinstance(srv_copy.get("env"), dict):
                srv_copy["env"] = ",".join(f"{k}={v}" for k, v in srv_copy["env"].items())
            mcp_servers_list.append(srv_copy)
        config["hermes"]["mcp_servers"] = mcp_servers_list

        provider_routing = yaml_data.get("provider_routing", {}) if isinstance(yaml_data, dict) else {}
        if isinstance(provider_routing, dict):
            config["hermes"]["provider_routing"] = provider_routing

        fallback_model = yaml_data.get("fallback_model", {}) if isinstance(yaml_data, dict) else {}
        if isinstance(fallback_model, dict):
            config["hermes"]["fallback_model"] = fallback_model

        custom_providers = yaml_data.get("custom_providers", []) if isinstance(yaml_data, dict) else []
        if isinstance(custom_providers, list):
            config["hermes"]["custom_providers"] = custom_providers

        if "gateway" not in config["hermes"]:
            config["hermes"]["gateway"] = {}
            
        agent = yaml_data.get("agent", {}) if isinstance(yaml_data, dict) else {}
        if isinstance(agent, dict):
            config["hermes"]["agent"] = agent

        # Priority logic:
        # 1. Platform allow-all (e.g., TELEGRAM_ALLOW_ALL_USERS=true)
        # 2. DM pairing
        # 3. Combined platform + global allowlist
        # 4. Global allow-all (GATEWAY_ALLOW_ALL_USERS) — only if both lists empty
        config["hermes"]["gateway"]["allowed_users"] = self._split_csv(env_data.get("GATEWAY_ALLOWED_USERS", ""))
        config["hermes"]["gateway"]["allow_all_users"] = env_data.get("GATEWAY_ALLOW_ALL_USERS", "").lower() == "true"

        if "minimax" not in config["providers"]:
            config["providers"]["minimax"] = {"api_key": ""}
        if "minimax_cn" not in config["providers"]:
            config["providers"]["minimax_cn"] = {"api_key": ""}
        config["providers"]["minimax"]["api_key"] = env_data.get("MINIMAX_API_KEY", "")
        config["providers"]["minimax_cn"]["api_key"] = env_data.get("MINIMAX_CN_API_KEY", "")

        return config

    def write_config(self, data: dict):
        self._ensure_default_files()

        try:
            existing_yaml = yaml.safe_load(self.config_path.read_text()) or {}
        except Exception:
            existing_yaml = {}
        existing_env = self._read_env_file()

        providers = data.get("providers", {}) if isinstance(data, dict) else {}
        channels = data.get("channels", {}) if isinstance(data, dict) else {}
        hermes_data = data.get("hermes", {}) if isinstance(data, dict) else {}
        hermes_channels = hermes_data.get("channels", {}) if isinstance(hermes_data, dict) else {}
        defaults = ((data.get("agents") or {}).get("defaults") or {}) if isinstance(data, dict) else {}

        model_provider = str(defaults.get("provider", "") or "") or "auto"
        model_default = str(defaults.get("model", "") or "")

        yaml_out = dict(existing_yaml) if isinstance(existing_yaml, dict) else {}
        model_out = yaml_out.get("model", {}) if isinstance(yaml_out.get("model", {}), dict) else {}
        model_out["provider"] = model_provider
        model_out["default"] = model_default or "anthropic/claude-3.5-sonnet"
        yaml_out["model"] = model_out

        auxiliary = ((data.get("hermes") or {}).get("auxiliary")) if isinstance(data, dict) else None
        if isinstance(auxiliary, dict):
            yaml_out["auxiliary"] = self._strip_secrets_for_yaml(auxiliary)
        elif "auxiliary" not in yaml_out:
            yaml_out["auxiliary"] = self._default_hermes_yaml()["auxiliary"]

        compression = hermes_data.get("compression") if isinstance(hermes_data, dict) else None
        if isinstance(compression, dict):
            yaml_out["compression"] = compression
        elif "compression" not in yaml_out:
            yaml_out["compression"] = self._default_hermes_yaml()["compression"]

        display = hermes_data.get("display") if isinstance(hermes_data, dict) else None
        if isinstance(display, dict):
            yaml_out["display"] = display
        elif "display" not in yaml_out:
            yaml_out["display"] = self._default_hermes_yaml()["display"]

        agent = hermes_data.get("agent") if isinstance(hermes_data, dict) else None
        if isinstance(agent, dict):
            yaml_out["agent"] = agent
        elif "agent" not in yaml_out:
            yaml_out["agent"] = self._default_hermes_yaml()["agent"]

        mcp_servers_list = hermes_data.get("mcp_servers", []) if isinstance(hermes_data, dict) else []
        mcp_servers_dict = {}
        for srv in mcp_servers_list:
            name = srv.get("name")
            if not name:
                continue
            srv_out = {
                "command": srv.get("command", ""),
                "url": srv.get("url", ""),
                "timeout": int(srv.get("timeout", 0)) if srv.get("timeout") else 0,
            }
            args_str = srv.get("args", "")
            if args_str:
                srv_out["args"] = [a.strip() for a in args_str.split(",") if a.strip()]
            else:
                srv_out["args"] = []
                
            env_str = srv.get("env", "")
            env_dict = {}
            if env_str:
                for pair in env_str.split(","):
                    if "=" in pair:
                        k, v = pair.split("=", 1)
                        env_dict[k.strip()] = v.strip()
            srv_out["env"] = env_dict
            mcp_servers_dict[name] = srv_out
            
        yaml_out["mcp_servers"] = mcp_servers_dict

        provider_routing = hermes_data.get("provider_routing") if isinstance(hermes_data, dict) else None
        if isinstance(provider_routing, dict):
            yaml_out["provider_routing"] = provider_routing
        elif "provider_routing" not in yaml_out:
            yaml_out["provider_routing"] = self._default_hermes_yaml()["provider_routing"]

        fallback_model = hermes_data.get("fallback_model") if isinstance(hermes_data, dict) else None
        if isinstance(fallback_model, dict):
            yaml_out["fallback_model"] = fallback_model
        elif "fallback_model" not in yaml_out:
            yaml_out["fallback_model"] = self._default_hermes_yaml()["fallback_model"]

        custom_providers = hermes_data.get("custom_providers") if isinstance(hermes_data, dict) else None
        if isinstance(custom_providers, list):
            yaml_out["custom_providers"] = custom_providers

        env_out = dict(existing_env)

        def _safe_env_write(key: str, new_val: str) -> None:
            if isinstance(new_val, str) and new_val.endswith("***"):
                return
            if new_val == "" and existing_env.get(key, ""):
                return
            env_out[key] = new_val

        for our_name, env_key in self.PROVIDER_ENV_KEYS.items():
            provider_obj = providers.get(our_name, {}) if isinstance(providers, dict) else {}
            if isinstance(provider_obj, dict):
                _safe_env_write(env_key, str(provider_obj.get("api_key", "") or ""))

        openai = providers.get("openai", {}) if isinstance(providers, dict) else {}
        if isinstance(openai, dict):
            _safe_env_write("OPENAI_API_KEY", str(openai.get("api_key", "") or ""))
            _safe_env_write("OPENAI_BASE_URL", str(openai.get("api_base", "") or ""))
        if model_default:
            env_out["HERMES_MODEL"] = model_default
            env_out.pop("LLM_MODEL", None)

        telegram = hermes_channels.get("telegram", {}) if isinstance(hermes_channels, dict) else {}
        if not isinstance(telegram, dict) or not telegram:
            telegram = channels.get("telegram", {}) if isinstance(channels, dict) else {}
        if isinstance(telegram, dict):
            _safe_env_write("TELEGRAM_BOT_TOKEN", str(telegram.get("bot_token", telegram.get("token", "")) or ""))
            _safe_env_write("TELEGRAM_HOME_CHANNEL", str(telegram.get("home_channel", "") or ""))
            _safe_env_write("TELEGRAM_HOME_CHANNEL_NAME", str(telegram.get("home_channel_name", "") or ""))
            allowed_users = telegram.get("allowed_users")
            if isinstance(allowed_users, list):
                _safe_env_write("TELEGRAM_ALLOWED_USERS", self._join_csv(allowed_users))
            elif isinstance(allowed_users, str):
                _safe_env_write("TELEGRAM_ALLOWED_USERS", allowed_users)
            else:
                _safe_env_write("TELEGRAM_ALLOWED_USERS", self._join_csv(telegram.get("allow_from", [])))
            env_out["TELEGRAM_ALLOW_ALL_USERS"] = "true" if telegram.get("allow_all_users", False) else "false"

        discord = hermes_channels.get("discord", {}) if isinstance(hermes_channels, dict) else {}
        if not isinstance(discord, dict) or not discord:
            discord = channels.get("discord", {}) if isinstance(channels, dict) else {}
        if isinstance(discord, dict):
            _safe_env_write("DISCORD_BOT_TOKEN", str(discord.get("bot_token", discord.get("token", "")) or ""))
            allowed_users = discord.get("allowed_users")
            if isinstance(allowed_users, list):
                _safe_env_write("DISCORD_ALLOWED_USERS", self._join_csv(allowed_users))
            elif isinstance(allowed_users, str):
                _safe_env_write("DISCORD_ALLOWED_USERS", allowed_users)
            else:
                _safe_env_write("DISCORD_ALLOWED_USERS", self._join_csv(discord.get("allow_from", [])))
            env_out["DISCORD_ALLOW_BOTS"] = "true" if discord.get("allow_bots", False) else "false"
            env_out["DISCORD_REQUIRE_MENTION"] = "true" if discord.get("require_mention", False) else "false"
            free_response_channels = discord.get("free_response_channels", "")
            if isinstance(free_response_channels, list):
                _safe_env_write("DISCORD_FREE_RESPONSE_CHANNELS", self._join_csv(free_response_channels))
            else:
                _safe_env_write("DISCORD_FREE_RESPONSE_CHANNELS", str(free_response_channels or ""))
            env_out["DISCORD_AUTO_THREAD"] = "true" if discord.get("auto_thread", False) else "false"

        slack = hermes_channels.get("slack", {}) if isinstance(hermes_channels, dict) else {}
        if not isinstance(slack, dict) or not slack:
            slack = channels.get("slack", {}) if isinstance(channels, dict) else {}
        if isinstance(slack, dict):
            _safe_env_write("SLACK_BOT_TOKEN", str(slack.get("bot_token", "") or ""))
            _safe_env_write("SLACK_APP_TOKEN", str(slack.get("app_token", "") or ""))
            _safe_env_write("SLACK_HOME_CHANNEL", str(slack.get("home_channel", "") or ""))
            _safe_env_write("SLACK_HOME_CHANNEL_NAME", str(slack.get("home_channel_name", "") or ""))
            allowed_users = slack.get("allowed_users")
            if isinstance(allowed_users, list):
                _safe_env_write("SLACK_ALLOWED_USERS", self._join_csv(allowed_users))
            elif isinstance(allowed_users, str):
                _safe_env_write("SLACK_ALLOWED_USERS", allowed_users)
            else:
                _safe_env_write("SLACK_ALLOWED_USERS", self._join_csv(slack.get("allow_from", [])))
            env_out["SLACK_ALLOW_ALL_USERS"] = "true" if slack.get("allow_all_users", False) else "false"

        whatsapp = hermes_channels.get("whatsapp", {}) if isinstance(hermes_channels, dict) else {}
        if not isinstance(whatsapp, dict) or not whatsapp:
            whatsapp = channels.get("whatsapp", {}) if isinstance(channels, dict) else {}
        if isinstance(whatsapp, dict):
            env_out["WHATSAPP_ENABLED"] = "true" if whatsapp.get("enabled", False) else "false"
            _safe_env_write("WHATSAPP_MODE", str(whatsapp.get("mode", "") or ""))
            allowed_users = whatsapp.get("allowed_users")
            if isinstance(allowed_users, list):
                _safe_env_write("WHATSAPP_ALLOWED_USERS", self._join_csv(allowed_users))
            elif isinstance(allowed_users, str):
                _safe_env_write("WHATSAPP_ALLOWED_USERS", allowed_users)
            else:
                _safe_env_write("WHATSAPP_ALLOWED_USERS", self._join_csv(whatsapp.get("allow_from", [])))
            env_out["WHATSAPP_ALLOW_ALL_USERS"] = "true" if whatsapp.get("allow_all_users", False) else "false"

        signal_data = hermes_channels.get("signal", {}) if isinstance(hermes_channels, dict) else {}
        if not isinstance(signal_data, dict) or not signal_data:
            signal_data = channels.get("signal", {}) if isinstance(channels, dict) else {}
        if isinstance(signal_data, dict):
            _safe_env_write("SIGNAL_HTTP_URL", str(signal_data.get("http_url", "") or ""))
            _safe_env_write("SIGNAL_ACCOUNT", str(signal_data.get("account", "") or ""))
            env_out["SIGNAL_IGNORE_STORIES"] = "true" if signal_data.get("ignore_stories", False) else "false"
            _safe_env_write("SIGNAL_HOME_CHANNEL", str(signal_data.get("home_channel", "") or ""))
            _safe_env_write("SIGNAL_HOME_CHANNEL_NAME", str(signal_data.get("home_channel_name", "") or ""))
            group_allowed_users = signal_data.get("group_allowed_users", "")
            if isinstance(group_allowed_users, list):
                _safe_env_write("SIGNAL_GROUP_ALLOWED_USERS", self._join_csv(group_allowed_users))
            else:
                _safe_env_write("SIGNAL_GROUP_ALLOWED_USERS", str(group_allowed_users or ""))
            allowed_users = signal_data.get("allowed_users")
            if isinstance(allowed_users, list):
                _safe_env_write("SIGNAL_ALLOWED_USERS", self._join_csv(allowed_users))
            elif isinstance(allowed_users, str):
                _safe_env_write("SIGNAL_ALLOWED_USERS", allowed_users)
            else:
                _safe_env_write("SIGNAL_ALLOWED_USERS", self._join_csv(signal_data.get("allow_from", [])))
            env_out["SIGNAL_ALLOW_ALL_USERS"] = "true" if signal_data.get("allow_all_users", False) else "false"

        email = hermes_channels.get("email", {}) if isinstance(hermes_channels, dict) else {}
        if not isinstance(email, dict) or not email:
            email = channels.get("email", {}) if isinstance(channels, dict) else {}
        if isinstance(email, dict):
            _safe_env_write("EMAIL_ADDRESS", str(email.get("address", "") or ""))
            _safe_env_write("EMAIL_PASSWORD", str(email.get("password", "") or ""))
            _safe_env_write("EMAIL_IMAP_HOST", str(email.get("imap_host", "") or ""))
            _safe_env_write("EMAIL_SMTP_HOST", str(email.get("smtp_host", "") or ""))
            _safe_env_write("EMAIL_IMAP_PORT", str(email.get("imap_port", "") or ""))
            _safe_env_write("EMAIL_SMTP_PORT", str(email.get("smtp_port", "") or ""))
            _safe_env_write("EMAIL_POLL_INTERVAL", str(email.get("poll_interval", "") or ""))
            _safe_env_write("EMAIL_HOME_ADDRESS", str(email.get("home_address", "") or ""))
            _safe_env_write("EMAIL_HOME_ADDRESS_NAME", str(email.get("home_address_name", "") or ""))
            allowed_users = email.get("allowed_users")
            if isinstance(allowed_users, list):
                _safe_env_write("EMAIL_ALLOWED_USERS", self._join_csv(allowed_users))
            elif isinstance(allowed_users, str):
                _safe_env_write("EMAIL_ALLOWED_USERS", allowed_users)
            else:
                _safe_env_write("EMAIL_ALLOWED_USERS", self._join_csv(email.get("allow_from", [])))
            env_out["EMAIL_ALLOW_ALL_USERS"] = "true" if email.get("allow_all_users", False) else "false"

        homeassistant = hermes_channels.get("homeassistant", {}) if isinstance(hermes_channels, dict) else {}
        if not isinstance(homeassistant, dict) or not homeassistant:
            homeassistant = channels.get("homeassistant", {}) if isinstance(channels, dict) else {}
        if isinstance(homeassistant, dict):
            _safe_env_write("HASS_TOKEN", str(homeassistant.get("token", homeassistant.get("hass_token", "")) or ""))
            _safe_env_write("HASS_URL", str(homeassistant.get("url", "") or ""))

        gateway_data = hermes_data.get("gateway", {}) if isinstance(hermes_data, dict) else {}
        if isinstance(gateway_data, dict):
            _safe_env_write("GATEWAY_ALLOWED_USERS", self._join_csv(gateway_data.get("allowed_users", [])))
            allow_all = gateway_data.get("allow_all_users", False)
            if isinstance(allow_all, str):
                allow_all = allow_all.lower() == "true"
            env_out["GATEWAY_ALLOW_ALL_USERS"] = "true" if allow_all else "false"

        self.config_path.write_text(yaml.safe_dump(yaml_out, sort_keys=False))
        self._write_env_file(env_out)

    def get_env(self) -> dict[str, str] | None:
        self._ensure_default_files()
        env = os.environ.copy()
        for key, value in self._read_env_file().items():
            env[key] = value
        return env

    def mask_secrets(self, data, _path=""):
        if isinstance(data, dict):
            result = {}
            for k, v in data.items():
                if k in self.SECRET_FIELDS and isinstance(v, str) and v:
                    result[k] = v[:8] + "***" if len(v) > 8 else "***"
                else:
                    result[k] = self.mask_secrets(v, f"{_path}.{k}")
            return result
        if isinstance(data, list):
            return [self.mask_secrets(item, _path) for item in data]
        return data

    def merge_secrets(self, new_data, existing_data, _path=""):
        if isinstance(new_data, dict) and isinstance(existing_data, dict):
            result = {}
            for k in set(existing_data.keys()) | set(new_data.keys()):
                if k not in new_data:
                    result[k] = existing_data[k]
                    continue
                v = new_data[k]
                if k in self.SECRET_FIELDS and isinstance(v, str) and (v.endswith("***") or v == ""):
                    result[k] = existing_data.get(k, "")
                else:
                    result[k] = self.merge_secrets(v, existing_data.get(k, {}), f"{_path}.{k}")
            return result
        return new_data


# Initialize managers for both backends
gateway = PicoClawManager()  # Keep for backward compatibility during transition
hermes_gateway = HermesManager()

# Backend management
AVAILABLE_BACKENDS = ["picoclaw", "hermes"]
META_FILE = Path.home() / ".gateway-meta.json"

# Note: HermesManager will be implemented in Task 4
# For now, only PicoClawManager is available
managers = {
    "picoclaw": gateway,
    "hermes": hermes_gateway,
}

active_backend = "picoclaw"
switching_backend = False
config_lock = asyncio.Lock()


def load_backend_meta() -> dict:
    """Load backend selection from meta file."""
    if not META_FILE.exists():
        return {"backend": "picoclaw"}
    try:
        return json.loads(META_FILE.read_text())
    except Exception:
        return {"backend": "picoclaw"}


def save_backend_meta(backend: str):
    """Persist backend selection to meta file."""
    try:
        META_FILE.write_text(json.dumps({"backend": backend}, indent=2))
    except Exception as e:
        print(f"Failed to save backend meta: {e}")


def get_active_manager() -> BaseGatewayManager:
    """Get the currently active gateway manager."""
    return managers.get(active_backend, gateway)


async def homepage(request: Request):
    auth_err = require_auth(request)
    if auth_err:
        return auth_err
    return templates.TemplateResponse(request, "index.html")


async def health(request: Request):
    return JSONResponse({"status": "ok", "gateway": gateway.state})


async def api_config_get(request: Request):
    auth_err = require_auth(request)
    if auth_err:
        return auth_err
    manager = get_active_manager()
    config = manager.read_config()
    return JSONResponse(manager.mask_secrets(config))


async def api_config_put(request: Request):
    auth_err = require_auth(request)
    if auth_err:
        return auth_err

    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    try:
        restart = body.pop("_restartGateway", False)

        async with config_lock:
            manager = get_active_manager()
            existing = manager.read_config()
            merged = manager.merge_secrets(body, existing)
            manager.write_config(merged)

        if restart:
            asyncio.create_task(get_active_manager().restart())

        return JSONResponse({"ok": True, "restarting": restart})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


async def api_status(request: Request):
    auth_err = require_auth(request)
    if auth_err:
        return auth_err

    manager = get_active_manager()
    config = manager.read_config()

    providers = {}
    for name, prov in config.get("providers", {}).items():
        providers[name] = {"configured": bool(prov.get("api_key"))}

    channels = {}
    for name, chan in config.get("channels", {}).items():
        channels[name] = {"enabled": chan.get("enabled", False)}

    cron_dir = manager.get_config_path().parent / "cron"
    cron_jobs = []
    if cron_dir.exists():
        for f in cron_dir.glob("*.json"):
            try:
                cron_jobs.append(json.loads(f.read_text()))
            except Exception:
                pass

    return JSONResponse({
        "backend": active_backend,
        "gateway": manager.get_status(),
        "providers": providers,
        "channels": channels,
        "cron": {"count": len(cron_jobs), "jobs": cron_jobs},
    })


async def api_logs(request: Request):
    auth_err = require_auth(request)
    if auth_err:
        return auth_err
    manager = get_active_manager()
    return JSONResponse({"lines": list(manager.logs)})


async def api_gateway_start(request: Request):
    auth_err = require_auth(request)
    if auth_err:
        return auth_err
    asyncio.create_task(get_active_manager().start())
    return JSONResponse({"ok": True})


async def api_gateway_stop(request: Request):
    auth_err = require_auth(request)
    if auth_err:
        return auth_err
    asyncio.create_task(get_active_manager().stop())
    return JSONResponse({"ok": True})


async def api_gateway_restart(request: Request):
    auth_err = require_auth(request)
    if auth_err:
        return auth_err
    asyncio.create_task(get_active_manager().restart())
    return JSONResponse({"ok": True})


async def api_backend_get(request: Request):
    """Get current backend selection."""
    auth_err = require_auth(request)
    if auth_err:
        return auth_err
    return JSONResponse({
        "backend": active_backend,
        "available": AVAILABLE_BACKENDS,
    })


async def api_backend_post(request: Request):
    """Switch active backend."""
    global active_backend, switching_backend
    
    auth_err = require_auth(request)
    if auth_err:
        return auth_err
    
    # Prevent concurrent switches
    if switching_backend:
        return JSONResponse({"error": "Backend switch already in progress"}, status_code=409)
    
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)
    
    new_backend = body.get("backend")
    
    # Validate backend name
    if new_backend not in AVAILABLE_BACKENDS:
        return JSONResponse(
            {"error": f"Invalid backend. Available: {AVAILABLE_BACKENDS}"},
            status_code=400
        )
    
    # Early return if already on requested backend
    if new_backend == active_backend:
        return JSONResponse({"backend": new_backend, "status": "ok"})
    
    # Check if requested backend manager exists
    if new_backend not in managers:
        return JSONResponse(
            {"error": f"Backend '{new_backend}' not installed or not available yet"},
            status_code=503
        )
    
    try:
        switching_backend = True
        
        # Stop current gateway if running
        current_manager = get_active_manager()
        if current_manager.process and current_manager.process.returncode is None:
            await current_manager.stop()
        
        # Switch backend
        active_backend = new_backend
        
        # Persist choice
        save_backend_meta(new_backend)
        
        return JSONResponse({"backend": new_backend, "status": "ok"})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    finally:
        switching_backend = False


async def auto_start_gateway():
    global active_backend
    
    meta = load_backend_meta()
    active_backend = meta.get("backend", "picoclaw")
    
    if active_backend not in managers:
        active_backend = "picoclaw"
    
    manager = get_active_manager()
    config = manager.read_config()
    has_key = False
    for prov in config.get("providers", {}).values():
        if isinstance(prov, dict) and prov.get("api_key"):
            has_key = True
            break
    if has_key:
        asyncio.create_task(manager.start())


async def shutdown_handler():
    try:
        manager = get_active_manager()
        if manager:
            await manager.stop()
    except Exception as e:
        print(f"Error during shutdown: {e}")


routes = [
    Route("/", homepage),
    Route("/health", health),
    Route("/api/config", api_config_get, methods=["GET"]),
    Route("/api/config", api_config_put, methods=["PUT"]),
    Route("/api/status", api_status),
    Route("/api/logs", api_logs),
    Route("/api/gateway/start", api_gateway_start, methods=["POST"]),
    Route("/api/gateway/stop", api_gateway_stop, methods=["POST"]),
    Route("/api/gateway/restart", api_gateway_restart, methods=["POST"]),
    Route("/api/backend", api_backend_get, methods=["GET"]),
    Route("/api/backend", api_backend_post, methods=["POST"]),
]

app = Starlette(
    routes=routes,
    middleware=[Middleware(AuthenticationMiddleware, backend=BasicAuthBackend())],
    on_startup=[auto_start_gateway],
    on_shutdown=[shutdown_handler],
)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8080"))

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    config = uvicorn.Config(app, host="0.0.0.0", port=port, log_level="info", loop="asyncio")
    server = uvicorn.Server(config)

    def handle_signal():
        loop.create_task(shutdown_handler())
        server.should_exit = True

    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, handle_signal)

    loop.run_until_complete(server.serve())
