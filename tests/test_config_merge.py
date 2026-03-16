import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from server import HermesManager, PicoClawManager


def _assert_preserves_unrelated_keys(merged: dict):
    assert merged["agents"]["defaults"]["model"] == "glm-4.7"
    assert merged["agents"]["defaults"]["temperature"] == 0.7
    assert merged["providers"]["anthropic"]["api_key"] == "anthropic_key"


def test_picoclaw_merge_secrets_preserves_existing_unmodified_keys():
    manager = PicoClawManager()
    existing = {
        "agents": {"defaults": {"model": "glm-4.7", "temperature": 0.7}},
        "providers": {
            "openai": {"api_key": "old_openai_key", "api_base": "https://api.openai.com/v1"},
            "anthropic": {"api_key": "anthropic_key"},
        },
    }
    new_data = {
        "providers": {
            "openai": {"api_key": "new_openai_key"},
        }
    }

    merged = manager.merge_secrets(new_data, existing)

    assert merged["providers"]["openai"]["api_key"] == "new_openai_key"
    assert merged["providers"]["openai"]["api_base"] == "https://api.openai.com/v1"
    _assert_preserves_unrelated_keys(merged)


def test_hermes_merge_secrets_preserves_existing_unmodified_keys():
    manager = HermesManager()
    existing = {
        "agents": {"defaults": {"model": "glm-4.7", "temperature": 0.7}},
        "providers": {
            "openai": {"api_key": "old_openai_key", "api_base": "https://api.openai.com/v1"},
            "anthropic": {"api_key": "anthropic_key"},
        },
    }
    new_data = {
        "providers": {
            "openai": {"api_key": "new_openai_key"},
        }
    }

    merged = manager.merge_secrets(new_data, existing)

    assert merged["providers"]["openai"]["api_key"] == "new_openai_key"
    assert merged["providers"]["openai"]["api_base"] == "https://api.openai.com/v1"
    _assert_preserves_unrelated_keys(merged)
