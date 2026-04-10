"""Test HERMES_HOME environment variable support."""

import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

# Add parent directory to path to import server.py
sys.path.insert(0, str(Path(__file__).parent.parent))

from server import HermesGatewayManager


class TestHermesHomeEnv(unittest.TestCase):
    """Test that HERMES_HOME environment variable is respected."""

    def test_default_hermes_home(self):
        """Test default path when HERMES_HOME is not set."""
        # Clear HERMES_HOME
        with patch.dict(os.environ, {}, clear=True):
            manager = HermesGatewayManager()
            expected = Path.home() / ".hermes"
            self.assertEqual(manager.config_dir, expected)

    def test_custom_hermes_home(self):
        """Test custom path when HERMES_HOME is set."""
        with tempfile.TemporaryDirectory() as tmpdir:
            custom_path = Path(tmpdir) / "custom_hermes"
            with patch.dict(os.environ, {"HERMES_HOME": str(custom_path)}):
                manager = HermesGatewayManager()
                self.assertEqual(manager.config_dir, custom_path)
                self.assertEqual(manager.config_path, custom_path / "config.yaml")
                self.assertEqual(manager.env_path, custom_path / ".env")

    def test_config_path_methods(self):
        """Test that get_config_path returns the correct path."""
        with tempfile.TemporaryDirectory() as tmpdir:
            custom_path = Path(tmpdir) / "my_hermes"
            with patch.dict(os.environ, {"HERMES_HOME": str(custom_path)}):
                manager = HermesGatewayManager()
                self.assertEqual(manager.get_config_path(), custom_path / "config.yaml")

    def test_audit_dir_uses_hermes_home(self):
        """Test that audit logging uses HERMES_HOME."""
        import server as server_module

        with tempfile.TemporaryDirectory() as tmpdir:
            custom_path = Path(tmpdir) / "audit_hermes"
            custom_path.mkdir()
            audit_file = custom_path / "pairing-audit.log"

            with patch.dict(os.environ, {"HERMES_HOME": str(custom_path)}):
                # Write a test audit entry
                test_event = {
                    "operation": "test",
                    "platform": "telegram",
                    "actor": "test_user",
                    "ok": True,
                    "exit_code": 0,
                    "duration_ms": 100,
                    "stderr_summary": "",
                }
                server_module._append_pairing_audit(test_event)

                # Verify the audit file was created in the custom location
                self.assertTrue(audit_file.exists())

                # Read and verify content
                content = audit_file.read_text()
                self.assertIn("test", content)
                self.assertIn("telegram", content)


if __name__ == "__main__":
    unittest.main(verbosity=2)
