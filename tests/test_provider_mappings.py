"""
Unit and integration tests for Provider API Key Mappings.
Tests that provider keys are correctly mapped to environment variables.
"""

import os
import sys
from pathlib import Path

import httpx
import pytest

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


class TestHermesManagerProviderMappings:
    """Unit tests for HermesManager provider to env var mappings."""

    @pytest.fixture
    def hermes_manager(self, tmp_path):
        """Create a HermesManager instance with temp paths."""
        from server import HermesManager

        manager = HermesManager()
        manager.config_dir = tmp_path / "hermes"
        manager.config_path = manager.config_dir / "config.yaml"
        manager.env_path = manager.config_dir / ".env"
        manager.config_dir.mkdir(parents=True, exist_ok=True)
        return manager

    def test_provider_env_keys_mapping(self, hermes_manager):
        """Verify all providers map to correct env var names."""
        expected_mappings = {
            "openrouter": "OPENROUTER_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY",
            "openai": "OPENAI_API_KEY",
            "google": "GOOGLE_API_KEY",
            "groq": "GROQ_API_KEY",
            "deepseek": "DEEPSEEK_API_KEY",
            "zhipu": "GLM_API_KEY",
            "moonshot": "KIMI_API_KEY",
            "minimax": "MINIMAX_API_KEY",
            "minimax_cn": "MINIMAX_CN_API_KEY",
        }

        for provider, expected_env in expected_mappings.items():
            assert provider in hermes_manager.PROVIDER_ENV_KEYS, (
                f"Provider {provider} not in PROVIDER_ENV_KEYS"
            )
            assert hermes_manager.PROVIDER_ENV_KEYS[provider] == expected_env, (
                f"Provider {provider} maps to {hermes_manager.PROVIDER_ENV_KEYS[provider]}, expected {expected_env}"
            )

    def test_minimax_maps_to_minimax_api_key(self, hermes_manager):
        """Specific test for MiniMax provider mapping."""
        assert hermes_manager.PROVIDER_ENV_KEYS["minimax"] == "MINIMAX_API_KEY"

    def test_openai_maps_to_openai_api_key(self, hermes_manager):
        """Specific test for OpenAI provider mapping."""
        assert hermes_manager.PROVIDER_ENV_KEYS["openai"] == "OPENAI_API_KEY"


class TestHermesManagerSecretMasking:
    """Unit tests for secret masking functionality."""

    @pytest.fixture
    def hermes_manager(self):
        """Create a HermesManager instance."""
        from server import HermesManager

        manager = HermesManager()
        return manager

    def test_mask_secrets_masks_api_keys(self, hermes_manager):
        """mask_secrets should mask api_key fields (showing first 8 chars + ***)."""
        config = {
            "providers": {
                "openai": {"api_key": "sk-secret12345"},
                "minimax": {"api_key": "sk-minimax-key"},
            }
        }

        masked = hermes_manager.mask_secrets(config)

        # Masking shows first 8 chars + ***
        assert masked["providers"]["openai"]["api_key"].endswith("***")
        assert masked["providers"]["minimax"]["api_key"].endswith("***")
        assert "sk-secre" in masked["providers"]["openai"]["api_key"]
        assert "sk-minim" in masked["providers"]["minimax"]["api_key"]

    def test_mask_secrets_preserves_empty_values(self, hermes_manager):
        """mask_secrets should preserve empty strings."""
        config = {
            "providers": {
                "openai": {"api_key": ""},
            }
        }

        masked = hermes_manager.mask_secrets(config)

        assert masked["providers"]["openai"]["api_key"] == ""


class TestHermesManagerMergeSecrets:
    """Unit tests for secret merging functionality."""

    @pytest.fixture
    def hermes_manager(self):
        """Create a HermesManager instance."""
        from server import HermesManager

        manager = HermesManager()
        return manager

    def test_merge_secrets_keeps_existing_when_masked(self, hermes_manager):
        """merge_secrets should keep existing value when new value is ***."""
        existing = {"api_key": "original-secret"}
        new_data = {"api_key": "***"}

        result = hermes_manager.merge_secrets(new_data, existing)

        assert result["api_key"] == "original-secret"

    def test_merge_secrets_updates_when_not_masked(self, hermes_manager):
        """merge_secrets should update when new value is not ***."""
        existing = {"api_key": "original-secret"}
        new_data = {"api_key": "new-secret"}

        result = hermes_manager.merge_secrets(new_data, existing)

        assert result["api_key"] == "new-secret"

    def test_merge_secrets_keeps_existing_on_empty_string(self, hermes_manager):
        """merge_secrets currently keeps existing when new value is empty string (known bug)."""
        existing = {"api_key": "original-secret"}
        new_data = {"api_key": ""}

        result = hermes_manager.merge_secrets(new_data, existing)

        # NOTE: This is a known bug - empty strings don't clear existing values
        # The expected behavior would be assert result["api_key"] == ""
        # But currently it keeps the existing value
        assert result["api_key"] == "original-secret"  # Current behavior


class TestHermesManagerFallbackModel:
    """Unit tests for the fallback_model fix (empty strings should not be written)."""

    @pytest.fixture
    def hermes_manager(self, tmp_path):
        """Create a HermesManager instance with temp paths."""
        import yaml as yaml_lib

        from server import HermesManager

        manager = HermesManager()
        manager.config_dir = tmp_path / "hermes"
        manager.config_path = manager.config_dir / "config.yaml"
        manager.env_path = manager.config_dir / ".env"
        manager.config_dir.mkdir(parents=True, exist_ok=True)

        # Create default config
        default_yaml = manager._default_hermes_yaml()
        manager.config_path.write_text(yaml_lib.safe_dump(default_yaml))
        manager.env_path.write_text("")

        return manager

    def test_fallback_model_with_empty_strings_is_removed(self, hermes_manager):
        """Empty fallback_model should be removed from YAML output."""
        import yaml as yaml_lib

        data = {
            "agents": {"defaults": {"provider": "auto", "model": "test"}},
            "hermes": {"fallback_model": {"provider": "", "model": ""}},
        }

        hermes_manager.write_config(data)

        written_yaml = yaml_lib.safe_load(hermes_manager.config_path.read_text())

        # Empty fallback_model should be removed
        if "fallback_model" in written_yaml:
            fm = written_yaml["fallback_model"]
            assert fm.get("provider") and fm.get("model"), (
                f"Empty fallback_model should be removed, got: {fm}"
            )

    def test_fallback_model_with_values_is_preserved(self, hermes_manager):
        """Non-empty fallback_model should be preserved in YAML output."""
        import yaml as yaml_lib

        data = {
            "agents": {"defaults": {"provider": "auto", "model": "test"}},
            "hermes": {"fallback_model": {"provider": "openrouter", "model": "gpt-4"}},
        }

        hermes_manager.write_config(data)

        written_yaml = yaml_lib.safe_load(hermes_manager.config_path.read_text())

        assert written_yaml.get("fallback_model", {}).get("provider") == "openrouter"
        assert written_yaml.get("fallback_model", {}).get("model") == "gpt-4"


class TestHermesManagerEnvFileWriting:
    """Unit tests for environment variable file writing."""

    @pytest.fixture
    def hermes_manager(self, tmp_path):
        """Create a HermesManager instance with temp paths."""
        import yaml as yaml_lib

        from server import HermesManager

        manager = HermesManager()
        manager.config_dir = tmp_path / "hermes"
        manager.config_path = manager.config_dir / "config.yaml"
        manager.env_path = manager.config_dir / ".env"
        manager.config_dir.mkdir(parents=True, exist_ok=True)

        default_yaml = manager._default_hermes_yaml()
        manager.config_path.write_text(yaml_lib.safe_dump(default_yaml))
        manager.env_path.write_text("")

        return manager

    def test_provider_keys_written_to_env(self, hermes_manager):
        """Provider API keys should be written to .env file."""
        data = {
            "agents": {"defaults": {"provider": "auto", "model": "test"}},
            "providers": {
                "minimax": {"api_key": "test-minimax-key"},
                "openai": {"api_key": "test-openai-key"},
            },
        }

        hermes_manager.write_config(data)

        env_content = hermes_manager.env_path.read_text()

        assert "MINIMAX_API_KEY=test-minimax-key" in env_content
        assert "OPENAI_API_KEY=test-openai-key" in env_content

    def test_masked_values_not_written(self, hermes_manager):
        """Masked values (ending with ***) should not overwrite existing keys."""
        # First write a real key
        hermes_manager.env_path.write_text("MINIMAX_API_KEY=original-key\n")

        # Then try to write with masked value
        data = {
            "agents": {"defaults": {"provider": "auto", "model": "test"}},
            "providers": {
                "minimax": {"api_key": "***"},  # Masked value from UI
            },
        }

        hermes_manager.write_config(data)

        env_content = hermes_manager.env_path.read_text()

        # Original key should be preserved
        assert "MINIMAX_API_KEY=original-key" in env_content


@pytest.mark.integration
class TestProviderAPIIntegration:
    """Integration tests for provider API endpoints.

    These tests require a running server at localhost:8080
    Set ADMIN_PASSWORD env var or use default "test"
    """

    BASE_URL = "http://localhost:8080"

    @pytest.fixture
    def auth(self):
        """Get auth credentials from env or use default."""
        password = os.environ.get("ADMIN_PASSWORD", "test")
        return ("admin", password)

    @pytest.fixture
    def client(self):
        """Create httpx client."""
        return httpx.Client(base_url=self.BASE_URL, timeout=30.0)

    def test_all_providers_returned_in_config(self, client, auth):
        """Config endpoint should return all expected providers."""
        response = client.get("/api/config", auth=auth)
        assert response.status_code == 200

        data = response.json()
        providers = data.get("providers", {})

        expected_providers = [
            "openai",
            "anthropic",
            "openrouter",
            "deepseek",
            "groq",
            "gemini",
            "zhipu",
            "moonshot",
            "minimax",
        ]

        for provider in expected_providers:
            assert provider in providers, f"Provider {provider} not in config"
            assert "api_key" in providers[provider], (
                f"Provider {provider} missing api_key field"
            )

    def test_provider_keys_are_masked(self, client, auth):
        """Provider API keys should be masked in GET response (first 8 chars + ***)."""
        response = client.get("/api/config", auth=auth)
        assert response.status_code == 200

        data = response.json()
        providers = data.get("providers", {})

        for name, provider in providers.items():
            key = provider.get("api_key", "")
            if key and key != "":
                # Keys are masked as first 8 chars + ***
                assert key.endswith("***"), (
                    f"Provider {name} has unmasked key: {key[:10]}..."
                )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
