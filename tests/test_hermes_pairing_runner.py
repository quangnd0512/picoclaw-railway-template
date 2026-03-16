import pytest
import asyncio
import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch, MagicMock

sys.path.append(str(Path(__file__).resolve().parents[1]))

from server import (
    HERMES_PAIRING_PLATFORMS,
    PAIRING_CODE_RE,
    PAIRING_USER_ID_RE,
    _validate_pairing_platform,
    _validate_pairing_code,
    _validate_pairing_user_id,
    HermesManager,
)


class TestValidatePairingPlatform:
    def test_validate_pairing_platform_telegram(self):
        assert _validate_pairing_platform("telegram") == "telegram"

    def test_validate_pairing_platform_discord(self):
        assert _validate_pairing_platform("discord") == "discord"

    def test_validate_pairing_platform_slack(self):
        assert _validate_pairing_platform("slack") == "slack"

    def test_validate_pairing_platform_whatsapp(self):
        assert _validate_pairing_platform("whatsapp") == "whatsapp"

    def test_validate_pairing_platform_signal(self):
        assert _validate_pairing_platform("signal") == "signal"

    def test_validate_pairing_platform_email(self):
        assert _validate_pairing_platform("email") == "email"

    def test_validate_pairing_platform_homeassistant(self):
        assert _validate_pairing_platform("homeassistant") == "homeassistant"

    def test_invalid_platform(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_platform("invalid")
        assert "Invalid platform" in str(exc_info.value)

    def test_invalid_platform_empty(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_platform("")
        assert "Invalid platform" in str(exc_info.value)

    def test_invalid_platform_none(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_platform("telegram1")
        assert "Invalid platform" in str(exc_info.value)


class TestValidatePairingCode:
    def test_validate_pairing_code_all_uppercase(self):
        assert _validate_pairing_code("ABCDEFGH") == "ABCDEFGH"

    def test_validate_pairing_code_with_digits(self):
        assert _validate_pairing_code("A2CDEFGH") == "A2CDEFGH"

    def test_validate_pairing_code_all_digits(self):
        assert _validate_pairing_code("23456789") == "23456789"

    def test_invalid_code_too_short(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("ABCDEFG")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_too_long(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("ABCDEFGHI")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_lowercase(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("abcdefgh")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_with_special_chars(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("ABC!DEFG")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_with_0_or_1(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("A0CDEFGH")
        assert "Invalid pairing code" in str(exc_info.value)

    def test_invalid_code_empty(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_code("")
        assert "Invalid pairing code" in str(exc_info.value)


class TestValidatePairingUserId:
    def test_validate_pairing_user_id_simple(self):
        assert _validate_pairing_user_id("user123") == "user123"

    def test_validate_pairing_user_id_with_underscore(self):
        assert _validate_pairing_user_id("user_123") == "user_123"

    def test_validate_pairing_user_id_with_at(self):
        assert _validate_pairing_user_id("user@example") == "user@example"

    def test_validate_pairing_user_id_with_plus(self):
        assert _validate_pairing_user_id("user+123") == "user+123"

    def test_validate_pairing_user_id_with_colon(self):
        assert _validate_pairing_user_id("user:123") == "user:123"

    def test_validate_pairing_user_id_with_dot(self):
        assert _validate_pairing_user_id("user.name") == "user.name"

    def test_validate_pairing_user_id_with_hyphen(self):
        assert _validate_pairing_user_id("user-name") == "user-name"

    def test_validate_pairing_user_id_max_length(self):
        max_length_id = "a" * 128
        assert _validate_pairing_user_id(max_length_id) == max_length_id

    def test_invalid_user_id_too_long(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_user_id("a" * 129)
        assert "Invalid user ID" in str(exc_info.value)

    def test_invalid_user_id_empty(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_user_id("")
        assert "Invalid user ID" in str(exc_info.value)

    def test_invalid_user_id_with_special_chars(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_user_id("user@#$")
        assert "Invalid user ID" in str(exc_info.value)

    def test_invalid_user_id_with_space(self):
        with pytest.raises(ValueError) as exc_info:
            _validate_pairing_user_id("user id")
        assert "Invalid user ID" in str(exc_info.value)


class TestPairingConstants:
    def test_hermes_pairing_platforms_tuple(self):
        assert isinstance(HERMES_PAIRING_PLATFORMS, tuple)
        assert len(HERMES_PAIRING_PLATFORMS) == 7

    def test_pairing_code_regex_pattern(self):
        assert PAIRING_CODE_RE.pattern == r"^[A-Z2-9]{8}$"

    def test_pairing_user_id_regex_pattern(self):
        assert PAIRING_USER_ID_RE.pattern == r"^[A-Za-z0-9_:+@.-]{1,128}$"


class TestPairingCommandComposition:
    """Test command composition for each allowed operation."""

    @pytest.fixture
    def hermes_manager(self):
        with patch.object(HermesManager, '_ensure_default_files'):
            with patch.object(HermesManager, '_read_env_file', return_value={}):
                return HermesManager()

    @pytest.mark.asyncio
    async def test_list_command_composition(self, hermes_manager):
        """Test that 'list' operation builds correct command."""
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.communicate = AsyncMock(return_value=(b"[]", b""))

        with patch('asyncio.create_subprocess_exec', return_value=mock_process) as mock_exec:
            result = await hermes_manager.run_pairing_operation("list")

            mock_exec.assert_called_once()
            call_args = mock_exec.call_args
            assert call_args[0][0] == "hermes"
            assert call_args[0][1] == "pairing"
            assert call_args[0][2] == "list"
            assert result["ok"] is True
            assert result["operation"] == "list"
            assert result["exit_code"] == 0

    @pytest.mark.asyncio
    async def test_approve_command_composition(self, hermes_manager):
        """Test that 'approve' operation builds correct command with validated params."""
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.communicate = AsyncMock(return_value=(b"approved", b""))

        with patch('asyncio.create_subprocess_exec', return_value=mock_process) as mock_exec:
            result = await hermes_manager.run_pairing_operation(
                "approve",
                platform="telegram",
                code="ABCDEFGH"
            )

            mock_exec.assert_called_once()
            call_args = mock_exec.call_args
            assert call_args[0][0] == "hermes"
            assert call_args[0][1] == "pairing"
            assert call_args[0][2] == "approve"
            assert call_args[0][3] == "telegram"
            assert call_args[0][4] == "ABCDEFGH"
            assert result["ok"] is True

    @pytest.mark.asyncio
    async def test_revoke_command_composition(self, hermes_manager):
        """Test that 'revoke' operation builds correct command with validated params."""
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.communicate = AsyncMock(return_value=(b"revoked", b""))

        with patch('asyncio.create_subprocess_exec', return_value=mock_process) as mock_exec:
            result = await hermes_manager.run_pairing_operation(
                "revoke",
                platform="discord",
                user_id="user123"
            )

            mock_exec.assert_called_once()
            call_args = mock_exec.call_args
            assert call_args[0][0] == "hermes"
            assert call_args[0][1] == "pairing"
            assert call_args[0][2] == "revoke"
            assert call_args[0][3] == "discord"
            assert call_args[0][4] == "user123"
            assert result["ok"] is True

    @pytest.mark.asyncio
    async def test_clear_pending_command_composition(self, hermes_manager):
        """Test that 'clear-pending' operation builds correct command."""
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.communicate = AsyncMock(return_value=(b"cleared", b""))

        with patch('asyncio.create_subprocess_exec', return_value=mock_process) as mock_exec:
            result = await hermes_manager.run_pairing_operation("clear-pending")

            mock_exec.assert_called_once()
            call_args = mock_exec.call_args
            assert call_args[0][0] == "hermes"
            assert call_args[0][1] == "pairing"
            assert call_args[0][2] == "clear-pending"
            assert result["ok"] is True


class TestPairingValidation:
    """Test validation of pairing operation parameters."""

    @pytest.fixture
    def hermes_manager(self):
        with patch.object(HermesManager, '_ensure_default_files'):
            with patch.object(HermesManager, '_read_env_file', return_value={}):
                return HermesManager()

    @pytest.mark.asyncio
    async def test_invalid_operation_rejected(self, hermes_manager):
        """Test that invalid operations are rejected."""
        result = await hermes_manager.run_pairing_operation("invalid_op")

        assert result["ok"] is False
        assert result["exit_code"] == -1
        assert "Invalid operation" in result["stderr"]

    @pytest.mark.asyncio
    async def test_approve_missing_params(self, hermes_manager):
        """Test that approve without required params fails."""
        result = await hermes_manager.run_pairing_operation("approve")

        assert result["ok"] is False
        assert "requires platform and code" in result["stderr"]

    @pytest.mark.asyncio
    async def test_approve_invalid_platform(self, hermes_manager):
        """Test that approve with invalid platform fails validation."""
        result = await hermes_manager.run_pairing_operation(
            "approve",
            platform="invalid",
            code="ABCDEFGH"
        )

        assert result["ok"] is False
        assert "Invalid platform" in result["stderr"]

    @pytest.mark.asyncio
    async def test_approve_invalid_code(self, hermes_manager):
        """Test that approve with invalid code fails validation."""
        result = await hermes_manager.run_pairing_operation(
            "approve",
            platform="telegram",
            code="invalid"
        )

        assert result["ok"] is False
        assert "Invalid pairing code" in result["stderr"]

    @pytest.mark.asyncio
    async def test_revoke_missing_params(self, hermes_manager):
        """Test that revoke without required params fails."""
        result = await hermes_manager.run_pairing_operation("revoke")

        assert result["ok"] is False
        assert "requires platform and user_id" in result["stderr"]

    @pytest.mark.asyncio
    async def test_revoke_invalid_platform(self, hermes_manager):
        """Test that revoke with invalid platform fails validation."""
        result = await hermes_manager.run_pairing_operation(
            "revoke",
            platform="invalid",
            user_id="user123"
        )

        assert result["ok"] is False
        assert "Invalid platform" in result["stderr"]

    @pytest.mark.asyncio
    async def test_revoke_invalid_user_id(self, hermes_manager):
        """Test that revoke with invalid user_id fails validation."""
        result = await hermes_manager.run_pairing_operation(
            "revoke",
            platform="telegram",
            user_id="user id"  # contains space
        )

        assert result["ok"] is False
        assert "Invalid user ID" in result["stderr"]


class TestPairingTimeout:
    """Test timeout handling for pairing operations."""

    @pytest.fixture
    def hermes_manager(self):
        with patch.object(HermesManager, '_ensure_default_files'):
            with patch.object(HermesManager, '_read_env_file', return_value={}):
                return HermesManager()

    @pytest.mark.asyncio
    async def test_timeout_handling(self, hermes_manager):
        """Test that timeout properly terminates process and returns error."""
        mock_process = AsyncMock()
        mock_process.communicate = AsyncMock(side_effect=asyncio.TimeoutError())
        mock_process.terminate = MagicMock()
        mock_process.wait = AsyncMock(return_value=None)

        with patch('asyncio.create_subprocess_exec', return_value=mock_process):
            result = await hermes_manager.run_pairing_operation("list", timeout_seconds=1)

            assert result["ok"] is False
            assert "timed out" in result["stderr"]
            assert result["exit_code"] == -1
            mock_process.terminate.assert_called_once()

    @pytest.mark.asyncio
    async def test_timeout_with_kill(self, hermes_manager):
        """Test that process is killed if terminate fails."""
        mock_process = AsyncMock()
        mock_process.communicate = AsyncMock(side_effect=asyncio.TimeoutError())
        mock_process.terminate = MagicMock()
        mock_process.wait = AsyncMock(side_effect=asyncio.TimeoutError())
        mock_process.kill = MagicMock()

        with patch('asyncio.create_subprocess_exec', return_value=mock_process):
            result = await hermes_manager.run_pairing_operation("list", timeout_seconds=1)

            assert result["ok"] is False
            mock_process.kill.assert_called_once()


class TestPairingSuccess:
    """Test success scenarios with proper response structure."""

    @pytest.fixture
    def hermes_manager(self):
        with patch.object(HermesManager, '_ensure_default_files'):
            with patch.object(HermesManager, '_read_env_file', return_value={}):
                return HermesManager()

    @pytest.mark.asyncio
    async def test_nonzero_exit_code(self, hermes_manager):
        """Test that non-zero exit code returns ok=False."""
        mock_process = AsyncMock()
        mock_process.returncode = 1
        mock_process.communicate = AsyncMock(return_value=(b"", b"error occurred"))

        with patch('asyncio.create_subprocess_exec', return_value=mock_process):
            result = await hermes_manager.run_pairing_operation("list")

            assert result["ok"] is False
            assert result["exit_code"] == 1

    @pytest.mark.asyncio
    async def test_duration_ms_recorded(self, hermes_manager):
        """Test that duration_ms is properly recorded."""
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.communicate = AsyncMock(return_value=(b"output", b""))

        with patch('asyncio.create_subprocess_exec', return_value=mock_process):
            result = await hermes_manager.run_pairing_operation("list")

            assert result["duration_ms"] > 0

    @pytest.mark.asyncio
    async def test_stdout_stderr_captured(self, hermes_manager):
        """Test that stdout and stderr are captured correctly."""
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.communicate = AsyncMock(return_value=(b"test output", b"test error"))

        with patch('asyncio.create_subprocess_exec', return_value=mock_process):
            result = await hermes_manager.run_pairing_operation("list")

            assert result["stdout"] == "test output"
            assert result["stderr"] == "test error"

    @pytest.mark.asyncio
    async def test_uses_get_env(self, hermes_manager):
        """Test that the method uses get_env for subprocess."""
        mock_process = AsyncMock()
        mock_process.returncode = 0
        mock_process.communicate = AsyncMock(return_value=(b"", b""))

        with patch('asyncio.create_subprocess_exec', return_value=mock_process) as mock_exec:
            await hermes_manager.run_pairing_operation("list")

            call_kwargs = mock_exec.call_args[1]
            assert 'env' in call_kwargs
            assert call_kwargs['env'] is not None
