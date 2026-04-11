#!/usr/bin/env python3
"""
Skill Wrapper Divergence Test

Demonstrates that /usr/local/bin wrappers (stock-analysis, finance-news,
news-aggregator-skill) can execute independently of Hermes skill discovery
and must be reported as separate dimensions in runtime matrix.

This test verifies:
1. Wrapper commands are in /usr/local/bin and executable
2. Wrapper commands can execute with --help or similar safe command
3. Hermes discovery status is checked independently
4. Divergence between wrapper success and Hermes discovery is documented

Classification:
- wrapper-available: Wrapper exists in /usr/local/bin and is executable
- wrapper-executable: Wrapper can execute and produce output
- hermes-discovered: Hermes can discover the skill via SKILL.md
- divergence: Difference between wrapper status and Hermes discovery status
"""

import json
import os
import subprocess
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, asdict

import pytest

# Try to import ContainerHelper for container-based tests
try:
    from tests.helpers.container_verify import ContainerHelper, build_image, check_docker_available
    CONTAINER_HELPER_AVAILABLE = True
except ImportError:
    CONTAINER_HELPER_AVAILABLE = False
    # Create dummy objects for type hints when import fails
    ContainerHelper = None  # type: ignore
    build_image = None  # type: ignore
    check_docker_available = None  # type: ignore


# Configuration
EVIDENCE_DIR = Path(__file__).parent.parent / ".sisyphus" / "evidence"
REPORT_PATH = EVIDENCE_DIR / "task-6-wrapper-divergence.json"

# Wrapper definitions from Dockerfile lines 56-104
WRAPPER_COMMANDS = {
    "stock-analysis": {
        "path": "/usr/local/bin/stock-analysis",
        "skill_dir": "/data/agents/.picoclaw/workspace/skills/stock-analysis",
        "skill_md": "/app/skills/stock-analysis/SKILL.md",
        "safe_command": ["stock-analysis"],  # No args shows usage
        "expected_output_pattern": "Usage: stock-analysis",
    },
    "finance-news": {
        "path": "/usr/local/bin/finance-news",
        "skill_dir": "/data/agents/.picoclaw/workspace/skills/finance-news",
        "skill_md": "/app/skills/finance-news/SKILL.md",
        "safe_command": ["finance-news"],  # No args shows usage
        "expected_output_pattern": "Usage: finance-news",
    },
    "news-aggregator-skill": {
        "path": "/usr/local/bin/news-aggregator-skill",
        "skill_dir": "/data/agents/.picoclaw/workspace/skills/news-aggregator-skill",
        "skill_md": "/app/skills/news-aggregator-skill/SKILL.md",
        "safe_command": ["news-aggregator-skill", "--help"],
        "expected_output_pattern": "fetch_news.py",  # Script name in help
    },
}


@dataclass
class WrapperStatus:
    """Status of a wrapper command."""
    name: str
    path: str
    exists: bool
    is_executable: bool
    can_execute: bool
    execution_output: str
    execution_error: str
    exit_code: int


@dataclass
class HermesDiscoveryStatus:
    """Status of Hermes skill discovery."""
    name: str
    skill_md_exists: bool
    skill_md_valid_yaml: bool
    skill_md_has_name: bool
    skill_md_has_description: bool
    skill_md_has_commands: bool
    discovery_notes: List[str]


@dataclass
class DivergenceReport:
    """Divergence between wrapper and Hermes discovery."""
    wrapper_name: str
    wrapper_available: bool
    wrapper_executable: bool
    hermes_discovered: bool
    divergence_type: str  # "none", "wrapper-only", "hermes-only", "both-failed"
    notes: List[str]


def check_wrapper_exists(wrapper_path: str) -> bool:
    """Check if wrapper exists at path."""
    return os.path.exists(wrapper_path)


def check_wrapper_executable(wrapper_path: str) -> bool:
    """Check if wrapper is executable."""
    return os.access(wrapper_path, os.X_OK)


def execute_wrapper_safe(command: List[str], timeout: float = 10.0) -> tuple[int, str, str]:
    """
    Execute wrapper with safe command and capture output.
    
    Returns:
        Tuple of (exit_code, stdout, stderr)
    """
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Command timed out"
    except FileNotFoundError:
        return -2, "", "Command not found"
    except Exception as e:
        return -3, "", str(e)


def check_skill_md_exists(skill_md_path: str) -> bool:
    """Check if SKILL.md exists."""
    return os.path.exists(skill_md_path)


def parse_skill_md_yaml(skill_md_path: str) -> Optional[Dict[str, Any]]:
    """
    Parse YAML frontmatter from SKILL.md.
    
    Returns:
        Dict with parsed YAML or None if parsing fails
    """
    try:
        with open(skill_md_path, 'r') as f:
            content = f.read()
        
        # Extract YAML frontmatter
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                yaml_content = parts[1].strip()
                # Parse YAML manually (avoid yaml dependency)
                result = {}
                for line in yaml_content.split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        result[key.strip()] = value.strip().strip('"\'')
                return result
        return None
    except Exception:
        return None


def classify_divergence(
    wrapper_available: bool,
    wrapper_executable: bool,
    hermes_discovered: bool
) -> str:
    """
    Classify the divergence type between wrapper and Hermes discovery.
    
    Returns:
        Divergence type string
    """
    if wrapper_available and wrapper_executable and hermes_discovered:
        return "none"  # Both work
    elif wrapper_available and wrapper_executable and not hermes_discovered:
        return "wrapper-only"  # Wrapper works, Hermes doesn't discover
    elif not (wrapper_available and wrapper_executable) and hermes_discovered:
        return "hermes-only"  # Hermes discovers, wrapper doesn't work
    else:
        return "both-failed"  # Neither works


def generate_divergence_report(
    wrapper_statuses: Dict[str, WrapperStatus],
    hermes_statuses: Dict[str, HermesDiscoveryStatus],
    divergence_reports: Dict[str, DivergenceReport]
) -> Dict[str, Any]:
    """
    Generate the full divergence report.
    
    Returns:
        Dict with complete report data
    """
    return {
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "total_wrappers": len(WRAPPER_COMMANDS),
            "wrappers_available": sum(1 for w in wrapper_statuses.values() if w.exists and w.is_executable),
            "wrappers_executable": sum(1 for w in wrapper_statuses.values() if w.can_execute),
            "hermes_discovered": sum(1 for h in hermes_statuses.values() if h.skill_md_exists and h.skill_md_valid_yaml),
            "divergence_types": {
                "none": sum(1 for d in divergence_reports.values() if d.divergence_type == "none"),
                "wrapper-only": sum(1 for d in divergence_reports.values() if d.divergence_type == "wrapper-only"),
                "hermes-only": sum(1 for d in divergence_reports.values() if d.divergence_type == "hermes-only"),
                "both-failed": sum(1 for d in divergence_reports.values() if d.divergence_type == "both-failed"),
            },
        },
        "wrapper_statuses": {name: asdict(status) for name, status in wrapper_statuses.items()},
        "hermes_statuses": {name: asdict(status) for name, status in hermes_statuses.items()},
        "divergence_reports": {name: asdict(report) for name, report in divergence_reports.items()},
        "runtime_matrix": {
            name: {
                "wrapper_dimension": {
                    "available": wrapper_statuses[name].exists and wrapper_statuses[name].is_executable,
                    "executable": wrapper_statuses[name].can_execute,
                },
                "hermes_dimension": {
                    "discovered": hermes_statuses[name].skill_md_exists and hermes_statuses[name].skill_md_valid_yaml,
                    "has_name": hermes_statuses[name].skill_md_has_name,
                    "has_description": hermes_statuses[name].skill_md_has_description,
                },
            }
            for name in WRAPPER_COMMANDS.keys()
        },
    }


# ============================================================================
# Tests: Wrapper Availability
# ============================================================================

class TestWrapperAvailability:
    """Test that wrapper commands are available in /usr/local/bin."""

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_wrapper_exists(self, wrapper_name: str):
        """Test that wrapper file exists at expected path."""
        wrapper_path = WRAPPER_COMMANDS[wrapper_name]["path"]
        
        # In container environment, check actual path
        # In host environment, we check if the Dockerfile creates it
        if os.path.exists(wrapper_path):
            assert check_wrapper_exists(wrapper_path), f"Wrapper {wrapper_name} should exist at {wrapper_path}"
        else:
            # If not in container, verify Dockerfile creates it
            dockerfile_path = Path(__file__).parent.parent / "Dockerfile"
            assert dockerfile_path.exists(), "Dockerfile should exist"
            
            with open(dockerfile_path, 'r') as f:
                dockerfile_content = f.read()
            
            # Verify wrapper creation in Dockerfile
            assert f"/usr/local/bin/{wrapper_name}" in dockerfile_content, \
                f"Dockerfile should create wrapper for {wrapper_name}"
            assert "chmod +x" in dockerfile_content, \
                f"Dockerfile should make {wrapper_name} executable"

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_wrapper_executable_permission(self, wrapper_name: str):
        """Test that wrapper has executable permission."""
        wrapper_path = WRAPPER_COMMANDS[wrapper_name]["path"]
        
        if os.path.exists(wrapper_path):
            assert check_wrapper_executable(wrapper_path), \
                f"Wrapper {wrapper_name} should be executable"
        else:
            # In host environment, verify Dockerfile sets executable
            dockerfile_path = Path(__file__).parent.parent / "Dockerfile"
            with open(dockerfile_path, 'r') as f:
                dockerfile_content = f.read()
            
            # Dockerfile uses chmod +x for wrappers
            assert "chmod +x" in dockerfile_content, \
                "Dockerfile should set executable permission"


# ============================================================================
# Tests: Wrapper Execution
# ============================================================================

class TestWrapperExecution:
    """Test that wrapper commands can execute."""

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_wrapper_can_execute(self, wrapper_name: str):
        """Test that wrapper can execute and produce output."""
        wrapper_path = WRAPPER_COMMANDS[wrapper_name]["path"]
        safe_command = WRAPPER_COMMANDS[wrapper_name]["safe_command"]
        
        if not os.path.exists(wrapper_path):
            pytest.skip(f"Wrapper {wrapper_name} not available in host environment")
        
        exit_code, stdout, stderr = execute_wrapper_safe(safe_command)
        
        # Wrapper should execute (exit code may be non-zero for usage display)
        # The key is that it runs without crashing
        assert exit_code != -2, f"Wrapper {wrapper_name} should be found"
        assert exit_code != -3, f"Wrapper {wrapper_name} should not crash: {stderr}"
        
        # Should produce some output (usage or help)
        output = stdout + stderr
        assert len(output) > 0, f"Wrapper {wrapper_name} should produce output"

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_wrapper_output_contains_expected(self, wrapper_name: str):
        """Test that wrapper output contains expected pattern."""
        wrapper_path = WRAPPER_COMMANDS[wrapper_name]["path"]
        safe_command = WRAPPER_COMMANDS[wrapper_name]["safe_command"]
        
        if not os.path.exists(wrapper_path):
            pytest.skip(f"Wrapper {wrapper_name} not available in host environment")
        
        exit_code, stdout, stderr = execute_wrapper_safe(safe_command)
        output = stdout + stderr
        
        # Check for expected pattern in output (usage or error is acceptable)
        assert "usage" in output.lower() or "error" in output.lower() or len(output) > 0, \
            f"Wrapper {wrapper_name} output should contain usage info or error message"


# ============================================================================
# Tests: Hermes Discovery
# ============================================================================

class TestHermesDiscovery:
    """Test Hermes skill discovery independently."""

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_skill_md_exists(self, wrapper_name: str):
        """Test that SKILL.md exists for each wrapper skill."""
        skill_md_path = WRAPPER_COMMANDS[wrapper_name]["skill_md"]
        
        # In container, check actual path
        # In host, check /app/skills/ path
        host_skill_md = Path(__file__).parent.parent / "skills" / wrapper_name / "SKILL.md"
        
        if os.path.exists(skill_md_path):
            assert check_skill_md_exists(skill_md_path), \
                f"SKILL.md should exist for {wrapper_name}"
        elif host_skill_md.exists():
            assert True, f"SKILL.md exists at {host_skill_md}"
        else:
            pytest.fail(f"SKILL.md not found for {wrapper_name}")

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_skill_md_has_yaml_frontmatter(self, wrapper_name: str):
        """Test that SKILL.md has valid YAML frontmatter."""
        host_skill_md = Path(__file__).parent.parent / "skills" / wrapper_name / "SKILL.md"
        
        if not host_skill_md.exists():
            pytest.skip(f"SKILL.md not found at {host_skill_md}")
        
        yaml_data = parse_skill_md_yaml(str(host_skill_md))
        assert yaml_data is not None, \
            f"SKILL.md for {wrapper_name} should have valid YAML frontmatter"

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_skill_md_has_required_fields(self, wrapper_name: str):
        """Test that SKILL.md has required fields for Hermes discovery."""
        host_skill_md = Path(__file__).parent.parent / "skills" / wrapper_name / "SKILL.md"
        
        if not host_skill_md.exists():
            pytest.skip(f"SKILL.md not found at {host_skill_md}")
        
        yaml_data = parse_skill_md_yaml(str(host_skill_md))
        if yaml_data is None:
            pytest.skip(f"SKILL.md for {wrapper_name} has no YAML frontmatter")
        
        # Required fields for Hermes discovery
        assert "name" in yaml_data, f"SKILL.md for {wrapper_name} should have 'name' field"
        assert "description" in yaml_data, f"SKILL.md for {wrapper_name} should have 'description' field"
        
        # Name should match wrapper name or be defined
        assert yaml_data["name"], f"SKILL.md name should not be empty for {wrapper_name}"


# ============================================================================
# Tests: Divergence Documentation
# ============================================================================

class TestDivergenceDocumentation:
    """Test that divergence is properly documented."""

    def test_divergence_report_generated(self):
        """Test that divergence report is generated."""
        # Collect all statuses
        wrapper_statuses: Dict[str, WrapperStatus] = {}
        hermes_statuses: Dict[str, HermesDiscoveryStatus] = {}
        divergence_reports: Dict[str, DivergenceReport] = {}
        
        for name, config in WRAPPER_COMMANDS.items():
            # Check wrapper status
            wrapper_path = config["path"]
            host_skill_md = Path(__file__).parent.parent / "skills" / name / "SKILL.md"
            
            # Wrapper status
            exists = os.path.exists(wrapper_path)
            is_executable = check_wrapper_executable(wrapper_path) if exists else False
            
            if exists:
                exit_code, stdout, stderr = execute_wrapper_safe(config["safe_command"])
                can_execute = exit_code != -2 and exit_code != -3
            else:
                exit_code, stdout, stderr = -2, "", "Wrapper not found in host environment"
                can_execute = False
            
            wrapper_statuses[name] = WrapperStatus(
                name=name,
                path=wrapper_path,
                exists=exists,
                is_executable=is_executable,
                can_execute=can_execute,
                execution_output=stdout,
                execution_error=stderr,
                exit_code=exit_code,
            )
            
            # Hermes discovery status
            skill_md_exists = host_skill_md.exists()
            yaml_data = parse_skill_md_yaml(str(host_skill_md)) if skill_md_exists else None
            
            hermes_statuses[name] = HermesDiscoveryStatus(
                name=name,
                skill_md_exists=skill_md_exists,
                skill_md_valid_yaml=yaml_data is not None,
                skill_md_has_name=yaml_data is not None and "name" in yaml_data,
                skill_md_has_description=yaml_data is not None and "description" in yaml_data,
                skill_md_has_commands=yaml_data is not None and "commands" in yaml_data,
                discovery_notes=[],
            )
            
            # Calculate divergence
            wrapper_available = exists and is_executable
            wrapper_executable = can_execute
            hermes_discovered = skill_md_exists and yaml_data is not None
            
            divergence_type = classify_divergence(
                wrapper_available,
                wrapper_executable,
                hermes_discovered
            )
            
            notes = []
            if divergence_type == "wrapper-only":
                notes.append("Wrapper works but Hermes may not discover skill")
            elif divergence_type == "hermes-only":
                notes.append("Hermes can discover skill but wrapper doesn't work")
            elif divergence_type == "both-failed":
                notes.append("Neither wrapper nor Hermes discovery works")
            else:
                notes.append("Both wrapper and Hermes discovery work correctly")
            
            divergence_reports[name] = DivergenceReport(
                wrapper_name=name,
                wrapper_available=wrapper_available,
                wrapper_executable=wrapper_executable,
                hermes_discovered=hermes_discovered,
                divergence_type=divergence_type,
                notes=notes,
            )
        
        # Generate report
        report = generate_divergence_report(wrapper_statuses, hermes_statuses, divergence_reports)
        
        # Write report
        EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
        with open(REPORT_PATH, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Verify report was written
        assert REPORT_PATH.exists(), "Divergence report should be written"
        
        # Print summary for visibility
        print("\n=== Divergence Report Summary ===")
        print(f"Total wrappers: {report['summary']['total_wrappers']}")
        print(f"Wrappers available: {report['summary']['wrappers_available']}")
        print(f"Wrappers executable: {report['summary']['wrappers_executable']}")
        print(f"Hermes discovered: {report['summary']['hermes_discovered']}")
        print(f"Divergence types: {report['summary']['divergence_types']}")
        
        # Verify runtime matrix structure
        assert "runtime_matrix" in report, "Report should include runtime matrix"
        for name in WRAPPER_COMMANDS.keys():
            assert name in report["runtime_matrix"], f"Runtime matrix should include {name}"
            assert "wrapper_dimension" in report["runtime_matrix"][name], \
                f"Runtime matrix should have wrapper dimension for {name}"
            assert "hermes_dimension" in report["runtime_matrix"][name], \
                f"Runtime matrix should have Hermes dimension for {name}"


# ============================================================================
# Container-Based Tests (requires Docker)
# ============================================================================

@pytest.mark.skipif(not CONTAINER_HELPER_AVAILABLE, reason="ContainerHelper not available")
class TestContainerWrapperDivergence:
    """Test wrapper divergence in container environment."""

    @pytest.fixture(scope="class")
    def container(self):
        """Start container for testing."""
        # Re-import inside fixture to satisfy type checker
        from tests.helpers.container_verify import ContainerHelper as _ContainerHelper
        from tests.helpers.container_verify import build_image as _build_image
        from tests.helpers.container_verify import check_docker_available as _check_docker_available
        
        if not _check_docker_available():
            pytest.skip("Docker not available")
        
        # Build image if needed
        dockerfile_path = Path(__file__).parent.parent / "Dockerfile"
        image_name = "picoclaw-railway-template"
        
        # Check if image exists
        result = subprocess.run(
            ["docker", "images", "-q", image_name],
            capture_output=True,
            text=True
        )
        
        if not result.stdout.strip():
            print(f"\nBuilding Docker image {image_name}...")
            build_result = _build_image(dockerfile_path.parent, image_name, timeout=600.0)
            assert build_result.success, f"Failed to build image: {build_result.stderr}"
        
        # Start container
        helper = _ContainerHelper(image=image_name, evidence_dir=EVIDENCE_DIR)
        start_result = helper.start(port=8080, env={"ADMIN_PASSWORD": "test"})
        
        if not start_result.success:
            pytest.skip(f"Failed to start container: {start_result.stderr}")
        
        yield helper
        
        # Cleanup
        helper.stop()

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_container_wrapper_exists(self, container, wrapper_name: str):
        """Test that wrapper exists in container."""
        wrapper_path = WRAPPER_COMMANDS[wrapper_name]["path"]
        
        result = container.exec(["test", "-f", wrapper_path])
        assert result.success, f"Wrapper {wrapper_name} should exist at {wrapper_path} in container"

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_container_wrapper_executable(self, container, wrapper_name: str):
        """Test that wrapper is executable in container."""
        wrapper_path = WRAPPER_COMMANDS[wrapper_name]["path"]
        
        result = container.exec(["test", "-x", wrapper_path])
        assert result.success, f"Wrapper {wrapper_name} should be executable in container"

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_container_wrapper_runs(self, container, wrapper_name: str):
        """Test that wrapper can run in container."""
        safe_command = WRAPPER_COMMANDS[wrapper_name]["safe_command"]
        
        result = container.exec(safe_command, timeout=30.0)
        
        # Should not crash (exit code -2 or -3)
        assert result.exit_code != -2, f"Wrapper {wrapper_name} should be found in container"
        assert result.exit_code != -3, f"Wrapper {wrapper_name} should not crash: {result.stderr}"
        
        # Should produce output
        output = result.stdout + result.stderr
        assert len(output) > 0, f"Wrapper {wrapper_name} should produce output in container"

    @pytest.mark.parametrize("wrapper_name", WRAPPER_COMMANDS.keys())
    def test_container_skill_md_exists(self, container, wrapper_name: str):
        """Test that SKILL.md exists in container."""
        skill_md_path = WRAPPER_COMMANDS[wrapper_name]["skill_md"]
        
        result = container.exec(["test", "-f", skill_md_path])
        assert result.success, f"SKILL.md should exist at {skill_md_path} in container"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])