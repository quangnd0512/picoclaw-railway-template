import pytest
import httpx

BASE_URL = "http://localhost:8080"
AUTH = ("admin", "test")


@pytest.fixture
def client():
    return httpx.Client(base_url=BASE_URL, timeout=30.0)


def test_audit_requires_auth(client):
    r = client.get("/api/audit")
    assert r.status_code == 401


def test_audit_returns_structure(client):
    r = client.get("/api/audit", auth=AUTH)
    assert r.status_code == 200
    d = r.json()
    for key in ["backend", "cron", "sessions", "skills", "mcp_servers", "tools"]:
        assert key in d, f"Missing key: {key}"


def test_audit_cron_is_list(client):
    r = client.get("/api/audit", auth=AUTH)
    d = r.json()
    assert isinstance(d["cron"]["jobs"], list)
    assert isinstance(d["cron"]["count"], int)


def test_audit_sessions_capped(client):
    r = client.get("/api/audit", auth=AUTH)
    d = r.json()
    assert isinstance(d["sessions"], list)
    assert len(d["sessions"]) <= 50


def test_audit_skills_has_required_fields(client):
    r = client.get("/api/audit", auth=AUTH)
    d = r.json()
    assert isinstance(d["skills"], list)
    for skill in d["skills"]:
        assert "name" in skill, "Each skill must have a name"


def test_audit_no_crash_on_missing_dirs(client):
    r = client.get("/api/audit", auth=AUTH)
    assert r.status_code == 200


def test_audit_mcp_normalized(client):
    r = client.get("/api/audit", auth=AUTH)
    d = r.json()
    assert isinstance(d["mcp_servers"], list)
    for mcp in d["mcp_servers"]:
        assert "name" in mcp, "Each MCP server must have a name"
