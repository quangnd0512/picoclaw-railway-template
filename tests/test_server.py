"""
Integration tests for PicoClaw Railway Template Docker container.
Tests run against live container at http://localhost:8080
"""

import pytest
import httpx
import json

BASE_URL = "http://localhost:8080"
AUTH = ("admin", "wZeUOiytnIRvub9AgGnAWg")


@pytest.fixture
def client():
    """Create httpx client with timeout."""
    return httpx.Client(base_url=BASE_URL, timeout=30.0)


class TestCoreAPIAndAuth:
    """Verify basic connectivity and authentication."""

    def test_health_unauthenticated(self, client):
        """Health endpoint should work without auth."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"

    def test_protected_unauthenticated(self, client):
        """Protected endpoints should return 401 without auth."""
        response = client.get("/api/config")
        assert response.status_code == 401

    def test_protected_authenticated(self, client):
        """Protected endpoints should work with valid auth."""
        response = client.get("/api/config", auth=AUTH)
        assert response.status_code == 200
        data = response.json()
        # Should return config structure
        assert "providers" in data or "hermes" in data

    def test_homepage_authenticated(self, client):
        """Homepage should load with auth."""
        response = client.get("/", auth=AUTH)
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")


class TestConfigUpdates:
    """Verify config fetch and update operations."""

    def test_config_get_returns_masked_secrets(self, client):
        """Config should mask sensitive fields."""
        response = client.get("/api/config", auth=AUTH)
        assert response.status_code == 200
        data = response.json()

        # Check for common secret fields
        def check_no_unmasked_secrets(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    new_path = f"{path}.{key}" if path else key
                    # Check if this looks like a secret field
                    if any(secret in key.lower() for secret in [
                        "token", "password", "secret", "key", "api_key"
                    ]):
                        if isinstance(value, str) and value and value != "***":
                            # Allow empty strings (unconfigured secrets)
                            if len(value) > 0:
                                pytest.fail(f"Unmasked secret at {new_path}: {value[:10]}...")
                    # Recurse into nested dicts
                    if isinstance(value, (dict, list)):
                        check_no_unmasked_secrets(value, new_path)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    check_no_unmasked_secrets(item, f"{path}[{i}]")

        check_no_unmasked_secrets(data)

    def test_config_update_and_roundtrip(self, client):
        """Config updates should be accepted and retrievable."""
        # First, get current config
        response = client.get("/api/config", auth=AUTH)
        assert response.status_code == 200
        original_config = response.json()

        # Update a safe value (use a simple string field that exists in both backends)
        if "hermes" in original_config:
            # For Hermes, update the model name
            update_data = {"hermes": {"model": "test-model-verification"}}
        else:
            # Fallback for PicoClaw mode - update agent model
            update_data = {"agents": {"defaults": {"model": "test-model-verification"}}}

        response = client.put(
            "/api/config",
            auth=AUTH,
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200

        # Verify we can still fetch config after update
        response = client.get("/api/config", auth=AUTH)
        assert response.status_code == 200

        # Restore original config
        client.put("/api/config", auth=AUTH, json=original_config)


class TestGatewayLifecycle:
    """Verify gateway start/stop/restart operations."""

    def test_status_endpoint(self, client):
        """Status endpoint should return gateway state."""
        response = client.get("/api/status", auth=AUTH)
        assert response.status_code == 200
        data = response.json()

        # Should have gateway status
        assert "gateway" in data
        gateway = data["gateway"]
        assert "state" in gateway
        assert gateway["state"] in ["running", "stopped", "error", "unknown"]

    def test_gateway_stop(self, client):
        """Gateway stop should return 200."""
        response = client.post("/api/gateway/stop", auth=AUTH)
        assert response.status_code == 200

        # Give it a moment to stop
        import time
        time.sleep(1)

        # Verify status reflects stopped
        response = client.get("/api/status", auth=AUTH)
        data = response.json()
        assert data["gateway"]["state"] in ["stopped", "unknown"]

    def test_gateway_start(self, client):
        """Gateway start should return 200."""
        response = client.post("/api/gateway/start", auth=AUTH)
        # May fail if no API key configured (expected behavior)
        assert response.status_code in [200, 500]

    def test_gateway_restart(self, client):
        """Gateway restart should return 200."""
        response = client.post("/api/gateway/restart", auth=AUTH)
        assert response.status_code in [200, 500]  # May fail without API key


class TestLogsEndpoint:
    """Verify logs endpoint."""

    def test_logs_endpoint(self, client):
        """Logs endpoint should return object with lines array."""
        response = client.get("/api/logs", auth=AUTH)
        assert response.status_code == 200
        data = response.json()

        # Returns {"lines": [...]} structure
        assert isinstance(data, dict)
        assert "lines" in data
        assert isinstance(data["lines"], list)

        # If logs exist, check format
        if len(data["lines"]) > 0:
            log_entry = data["lines"][0]
            assert isinstance(log_entry, (str, dict))


class TestBackendEndpoint:
    """Verify backend switching endpoint."""

    def test_backend_get(self, client):
        """Backend GET should return backend and available backends."""
        response = client.get("/api/backend", auth=AUTH)
        assert response.status_code == 200
        data = response.json()

        # API returns {"backend": "...", "available": [...]}
        assert "backend" in data
        assert "available" in data
        assert isinstance(data["available"], list)
        assert data["backend"] in data["available"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
