"""
Unit tests for Hermes Pairing API Endpoints.
Tests the api_hermes_pairing_list and api_hermes_pairing_approve handlers.
"""

import pytest
import asyncio
import json
import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch, MagicMock
from starlette.requests import Request
from starlette.responses import JSONResponse

sys.path.append(str(Path(__file__).resolve().parents[1]))

from server import (
    api_hermes_pairing_list,
    api_hermes_pairing_approve,
    api_hermes_pairing_revoke,
    api_hermes_pairing_clear_pending,
    active_backend,
    pairing_ops_lock,
    hermes_gateway,
)


def create_mock_authenticated_request(user_display_name: str = "admin") -> Request:
    """Create a mock authenticated request."""
    mock_request = MagicMock(spec=Request)
    mock_user = MagicMock()
    mock_user.is_authenticated = True
    mock_user.display_name = user_display_name
    mock_request.user = mock_user
    mock_request.json = AsyncMock()
    return mock_request


def create_mock_unauthenticated_request() -> Request:
    """Create a mock unauthenticated request."""
    mock_request = MagicMock(spec=Request)
    mock_user = MagicMock()
    mock_user.is_authenticated = False
    mock_request.user = mock_user
    return mock_request


class TestPairingListEndpoint:
    """Tests for GET /api/hermes/pairing/list"""

    @pytest.mark.asyncio
    async def test_list_requires_auth(self):
        """Unauthenticated requests should return 401."""
        mock_request = create_mock_unauthenticated_request()
        
        response = await api_hermes_pairing_list(mock_request)
        
        assert response.status_code == 401
        assert "WWW-Authenticate" in response.headers

    @pytest.mark.asyncio
    async def test_list_backend_mismatch(self):
        """Should return 409 when active_backend != 'hermes'."""
        mock_request = create_mock_authenticated_request()
        
        with patch("server.active_backend", "picoclaw"):
            response = await api_hermes_pairing_list(mock_request)
        
        assert response.status_code == 409
        response_body = json.loads(response.body.decode())
        assert "error" in response_body

    @pytest.mark.asyncio
    async def test_list_success(self):
        """Successful list operation returns 200."""
        mock_request = create_mock_authenticated_request()
        
        mock_result = {
            "ok": True,
            "operation": "list",
            "exit_code": 0,
            "stdout": '{"pending": [{"code": "ABC12345", "platform": "telegram"}]}',
            "stderr": "",
            "duration_ms": 150,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit") as mock_audit:
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_list(mock_request)
        
        assert response.status_code == 200
        response_body = json.loads(response.body.decode())
        assert response_body["ok"] is True
        assert response_body["operation"] == "list"
        mock_audit.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_operation_failure(self):
        """Operation failure returns 502."""
        mock_request = create_mock_authenticated_request()
        
        mock_result = {
            "ok": False,
            "operation": "list",
            "exit_code": 1,
            "stdout": "",
            "stderr": "Command failed: no such command",
            "duration_ms": 50,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_list(mock_request)
        
        assert response.status_code == 502
        response_body = json.loads(response.body.decode())
        assert "error" in response_body

    @pytest.mark.asyncio
    async def test_list_timeout(self):
        """Timeout returns 504."""
        mock_request = create_mock_authenticated_request()
        
        mock_result = {
            "ok": False,
            "operation": "list",
            "exit_code": -1,
            "stdout": "",
            "stderr": "Command timed out after 20 seconds",
            "duration_ms": 20000,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_list(mock_request)
        
        assert response.status_code == 504


class TestPairingApproveEndpoint:
    """Tests for POST /api/hermes/pairing/approve"""

    @pytest.mark.asyncio
    async def test_approve_requires_auth(self):
        """Unauthenticated requests should return 401."""
        mock_request = create_mock_unauthenticated_request()
        
        response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_approve_backend_mismatch(self):
        """Should return 409 when active_backend != 'hermes'."""
        mock_request = create_mock_authenticated_request()
        
        with patch("server.active_backend", "picoclaw"):
            response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_approve_invalid_json(self):
        """Invalid JSON body returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(side_effect=json.JSONDecodeError("Invalid", "", 0))
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_approve_missing_fields(self):
        """Missing platform/code returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={})
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 400
        response_body = json.loads(response.body.decode())
        assert "Missing required fields" in response_body["error"]

    @pytest.mark.asyncio
    async def test_approve_invalid_platform(self):
        """Invalid platform returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "invalid", "code": "ABC12345"})
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 400
        response_body = json.loads(response.body.decode())
        assert "Invalid platform" in response_body["error"]

    @pytest.mark.asyncio
    async def test_approve_invalid_code(self):
        """Invalid code returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "telegram", "code": "short"})
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 400
        response_body = json.loads(response.body.decode())
        assert "Invalid code" in response_body["error"]

    @pytest.mark.asyncio
    async def test_approve_success(self):
        """Successful approve returns 200."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "telegram", "code": "A2CDEFGH"})
        
        mock_result = {
            "ok": True,
            "operation": "approve",
            "exit_code": 0,
            "stdout": "Approved user ABC12345 on telegram",
            "stderr": "",
            "duration_ms": 100,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit") as mock_audit:
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 200
        response_body = json.loads(response.body.decode())
        assert response_body["ok"] is True
        assert response_body["operation"] == "approve"
        assert response_body["platform"] == "telegram"
        mock_audit.assert_called_once()
        call_args = mock_audit.call_args[0][0]
        assert call_args["operation"] == "approve"
        assert call_args["platform"] == "telegram"

    @pytest.mark.asyncio
    async def test_approve_operation_failure(self):
        """Operation failure returns 502."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "discord", "code": "XY98765Z"})
        
        mock_result = {
            "ok": False,
            "operation": "approve",
            "exit_code": 1,
            "stdout": "",
            "stderr": "Invalid pairing code",
            "duration_ms": 50,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 502

    @pytest.mark.asyncio
    async def test_approve_timeout(self):
        """Timeout returns 504."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "slack", "code": "S2ACK999"})
        
        mock_result = {
            "ok": False,
            "operation": "approve",
            "exit_code": -1,
            "stdout": "",
            "stderr": "Command timed out after 20 seconds",
            "duration_ms": 20000,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 504


class TestStatusCodeMapping:
    """Verify status code mapping matches specification."""

    @pytest.mark.asyncio
    async def test_validation_error_400(self):
        """Validation errors return 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "telegram", "code": "BAD"})
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_backend_mismatch_409(self):
        """Backend mismatch returns 409."""
        mock_request = create_mock_authenticated_request()
        
        with patch("server.active_backend", "picoclaw"):
            list_response = await api_hermes_pairing_list(mock_request)
            approve_response = await api_hermes_pairing_approve(mock_request)
        
        assert list_response.status_code == 409
        assert approve_response.status_code == 409

    @pytest.mark.asyncio
    async def test_timeout_504(self):
        """Timeout returns 504."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "telegram", "code": "A2CDEFGH"})
        
        mock_result = {
            "ok": False,
            "operation": "approve",
            "exit_code": -1,
            "stdout": "",
            "stderr": "timed out",
            "duration_ms": 20000,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 504

    @pytest.mark.asyncio
    async def test_nonzero_exit_502(self):
        """Non-zero exit code returns 502."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "telegram", "code": "A2CDEFGH"})
        
        mock_result = {
            "ok": False,
            "operation": "approve",
            "exit_code": 1,
            "stdout": "",
            "stderr": "error",
            "duration_ms": 50,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 502

    @pytest.mark.asyncio
    async def test_success_200(self):
        """Success returns 200."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "telegram", "code": "A2CDEFGH"})
        
        mock_result = {
            "ok": True,
            "operation": "approve",
            "exit_code": 0,
            "stdout": "ok",
            "stderr": "",
            "duration_ms": 50,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    response = await api_hermes_pairing_approve(mock_request)
        
        assert response.status_code == 200


class TestPairingRevokeEndpoint:
    """Tests for POST /api/hermes/pairing/revoke"""

    @pytest.mark.asyncio
    async def test_revoke_requires_auth(self):
        """Unauthenticated requests should return 401."""
        mock_request = create_mock_unauthenticated_request()
        
        response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_revoke_backend_mismatch(self):
        """Should return 409 when active_backend != 'hermes'."""
        mock_request = create_mock_authenticated_request()
        
        with patch("server.active_backend", "picoclaw"):
            response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_revoke_invalid_json(self):
        """Invalid JSON body returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(side_effect=json.JSONDecodeError("Invalid", "", 0))
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_revoke_missing_fields(self):
        """Missing platform/user_id returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={})
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 400
        response_body = json.loads(response.body.decode())
        assert "Missing required fields" in response_body["error"]

    @pytest.mark.asyncio
    async def test_revoke_missing_platform(self):
        """Missing platform returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"user_id": "test_user"})
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 400
        response_body = json.loads(response.body.decode())
        assert "Missing required fields" in response_body["error"]

    @pytest.mark.asyncio
    async def test_revoke_missing_user_id(self):
        """Missing user_id returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "telegram"})
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 400
        response_body = json.loads(response.body.decode())
        assert "Missing required fields" in response_body["error"]

    @pytest.mark.asyncio
    async def test_revoke_invalid_platform(self):
        """Invalid platform returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "invalid", "user_id": "test_user"})
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 400
        response_body = json.loads(response.body.decode())
        assert "Invalid platform" in response_body["error"]

    @pytest.mark.asyncio
    async def test_revoke_invalid_user_id(self):
        """Invalid user_id returns 400."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "telegram", "user_id": "x" * 200})
        
        with patch("server.active_backend", "hermes"):
            response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 400
        response_body = json.loads(response.body.decode())
        assert "Invalid user_id" in response_body["error"]

    @pytest.mark.asyncio
    async def test_revoke_success(self):
        """Successful revoke returns 200."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "telegram", "user_id": "user123"})
        
        mock_result = {
            "ok": True,
            "operation": "revoke",
            "exit_code": 0,
            "stdout": "Revoked user user123 on telegram",
            "stderr": "",
            "duration_ms": 100,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit") as mock_audit:
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 200
        response_body = json.loads(response.body.decode())
        assert response_body["ok"] is True
        assert response_body["operation"] == "revoke"
        assert response_body["platform"] == "telegram"
        assert response_body["user_id"] == "user123"
        mock_audit.assert_called_once()
        call_args = mock_audit.call_args[0][0]
        assert call_args["operation"] == "revoke"
        assert call_args["platform"] == "telegram"

    @pytest.mark.asyncio
    async def test_revoke_operation_failure(self):
        """Operation failure returns 502."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "discord", "user_id": "user456"})
        
        mock_result = {
            "ok": False,
            "operation": "revoke",
            "exit_code": 1,
            "stdout": "",
            "stderr": "User not found",
            "duration_ms": 50,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 502

    @pytest.mark.asyncio
    async def test_revoke_timeout(self):
        """Timeout returns 504."""
        mock_request = create_mock_authenticated_request()
        mock_request.json = AsyncMock(return_value={"platform": "slack", "user_id": "user789"})
        
        mock_result = {
            "ok": False,
            "operation": "revoke",
            "exit_code": -1,
            "stdout": "",
            "stderr": "Command timed out after 20 seconds",
            "duration_ms": 20000,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_revoke(mock_request)
        
        assert response.status_code == 504


class TestPairingClearPendingEndpoint:
    """Tests for POST /api/hermes/pairing/clear-pending"""

    @pytest.mark.asyncio
    async def test_clear_pending_requires_auth(self):
        """Unauthenticated requests should return 401."""
        mock_request = create_mock_unauthenticated_request()
        
        response = await api_hermes_pairing_clear_pending(mock_request)
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_clear_pending_backend_mismatch(self):
        """Should return 409 when active_backend != 'hermes'."""
        mock_request = create_mock_authenticated_request()
        
        with patch("server.active_backend", "picoclaw"):
            response = await api_hermes_pairing_clear_pending(mock_request)
        
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_clear_pending_success(self):
        """Successful clear-pending returns 200."""
        mock_request = create_mock_authenticated_request()
        
        mock_result = {
            "ok": True,
            "operation": "clear-pending",
            "exit_code": 0,
            "stdout": "Cleared 3 pending pairing requests",
            "stderr": "",
            "duration_ms": 150,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit") as mock_audit:
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_clear_pending(mock_request)
        
        assert response.status_code == 200
        response_body = json.loads(response.body.decode())
        assert response_body["ok"] is True
        assert response_body["operation"] == "clear-pending"
        mock_audit.assert_called_once()
        call_args = mock_audit.call_args[0][0]
        assert call_args["operation"] == "clear-pending"

    @pytest.mark.asyncio
    async def test_clear_pending_operation_failure(self):
        """Operation failure returns 502."""
        mock_request = create_mock_authenticated_request()
        
        mock_result = {
            "ok": False,
            "operation": "clear-pending",
            "exit_code": 1,
            "stdout": "",
            "stderr": "Database error",
            "duration_ms": 50,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_clear_pending(mock_request)
        
        assert response.status_code == 502

    @pytest.mark.asyncio
    async def test_clear_pending_timeout(self):
        """Timeout returns 504."""
        mock_request = create_mock_authenticated_request()
        
        mock_result = {
            "ok": False,
            "operation": "clear-pending",
            "exit_code": -1,
            "stdout": "",
            "stderr": "Command timed out after 20 seconds",
            "duration_ms": 20000,
        }
        
        with patch("server.active_backend", "hermes"):
            with patch.object(hermes_gateway, "run_pairing_operation", new_callable=AsyncMock) as mock_run:
                with patch("server._append_pairing_audit"):
                    mock_run.return_value = mock_result
                    
                    response = await api_hermes_pairing_clear_pending(mock_request)
        
        assert response.status_code == 504
