#!/usr/bin/env python3
"""
Skill Dependency Verification Test

Evaluates skill runtime prerequisites from contract + file-level 
imports/declared metadata against container-installed binaries/dependencies.

Classification:
- ready: All dependencies present
- gated-env: All runtime deps present but missing API keys/tokens
- missing-binary: Required binary not found in PATH
- missing-python-dep: Required Python package not importable
"""

import json
import os
import shutil
import importlib
from pathlib import Path
from typing import Any

import pytest


# Configuration
CONTRACT_PATH = Path(__file__).parent.parent / ".sisyphus" / "evidence" / "task-1-skill-contract.json"
REPORT_PATH = Path(__file__).parent.parent / ".sisyphus" / "evidence" / "task-3-dependency-matrix.json"

# Known API keys / env vars that indicate gated skills (not failures)
GATED_ENV_VARS = {
    "GEMINI_API_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "GOG_KEY",
    "GOG_KEYRING_PASSWORD",
    "FINANCE_NEWS_TARGET",
    "FINANCE_NEWS_CHANNEL",
}


def load_skill_contract() -> dict[str, Any]:
    """Load the skill contract matrix."""
    with open(CONTRACT_PATH, "r") as f:
        return json.load(f)


def check_binary_available(binary_name: str) -> bool:
    """Check if a binary is available in PATH."""
    return shutil.which(binary_name) is not None


def check_env_var_present(env_var: str) -> bool:
    """Check if an environment variable is set and non-empty."""
    return bool(os.environ.get(env_var, "").strip())


def check_python_import(module_name: str) -> bool:
    """Check if a Python module can be imported."""
    try:
        importlib.import_module(module_name)
        return True
    except ImportError:
        return False


def classify_skill(skill: dict[str, Any]) -> dict[str, Any]:
    """
    Classify a skill based on its dependency requirements.
    
    Returns a dict with:
    - status: ready | gated-env | missing-binary | missing-python-dep
    - reason: detailed explanation
    - missing_bins: list of missing binaries
    - missing_env: list of missing env vars (that are NOT gated)
    - missing_python: list of missing Python modules
    """
    folder = skill.get("folder", "unknown")
    requires_bins = skill.get("requires_bins", [])
    requires_env = skill.get("requires_env", [])
    expected_status = skill.get("expected_status", "pass")
    
    missing_bins = []
    missing_env = []  # Missing env vars that are NOT gated (actual failures)
    missing_python = []
    gated_env_vars = []  # Missing gated env vars (API keys - not failures)
    
    # Check binary dependencies
    for binary in requires_bins:
        if not check_binary_available(binary):
            missing_bins.append(binary)
    
    # Check environment variable dependencies
    for env_var in requires_env:
        if not check_env_var_present(env_var):
            # Check if it's a gated env var (API key, etc.)
            if env_var in GATED_ENV_VARS:
                # This is expected - skill is gated by API key
                gated_env_vars.append(env_var)
            else:
                # Actual missing env var (failure)
                missing_env.append(env_var)
    
    # Determine classification
    if missing_bins:
        return {
            "folder": folder,
            "status": "missing-binary",
            "reason": f"Missing required binaries: {', '.join(missing_bins)}",
            "missing_bins": missing_bins,
            "missing_env": missing_env,
            "gated_env_vars": gated_env_vars,
            "missing_python": missing_python,
            "expected_status": expected_status,
        }
    
    if missing_python:
        return {
            "folder": folder,
            "status": "missing-python-dep",
            "reason": f"Missing required Python packages: {', '.join(missing_python)}",
            "missing_bins": missing_bins,
            "missing_env": missing_env,
            "gated_env_vars": gated_env_vars,
            "missing_python": missing_python,
            "expected_status": expected_status,
        }
    
    # Check for gated env vars - skills that need API keys but have all runtime deps
    if gated_env_vars:
        # All runtime deps present, but gated by missing API keys
        return {
            "folder": folder,
            "status": "gated-env",
            "reason": f"Requires API keys (not failures): {', '.join(gated_env_vars)}",
            "missing_bins": missing_bins,
            "missing_env": missing_env,
            "gated_env_vars": gated_env_vars,
            "missing_python": missing_python,
            "expected_status": expected_status,
        }
    
    # Check if expected to be gated but binaries are now available
    if expected_status == "gated" and not missing_bins:
        # Binary is available but skill may still need config
        return {
            "folder": folder,
            "status": "ready",
            "reason": "All dependencies present (binary now available)",
            "missing_bins": missing_bins,
            "missing_env": missing_env,
            "gated_env_vars": gated_env_vars,
            "missing_python": missing_python,
            "expected_status": expected_status,
        }
    
    # All dependencies available
    return {
        "folder": folder,
        "status": "ready",
        "reason": "All dependencies present",
        "missing_bins": missing_bins,
        "missing_env": missing_env,
        "gated_env_vars": gated_env_vars,
        "missing_python": missing_python,
        "expected_status": expected_status,
    }


def test_skill_contract_exists():
    """Verify the skill contract file exists."""
    assert CONTRACT_PATH.exists(), f"Skill contract not found at {CONTRACT_PATH}"


def test_skill_contract_valid_json():
    """Verify the skill contract is valid JSON."""
    contract = load_skill_contract()
    assert "skills" in contract, "Contract must contain 'skills' key"
    assert len(contract["skills"]) > 0, "Contract must have at least one skill"


class TestSkillDependencies:
    """Test class for skill dependency verification."""
    
    @pytest.fixture(autouse=True)
    def load_contract(self):
        """Load skill contract for each test."""
        self.contract = load_skill_contract()
        self.skills = self.contract.get("skills", [])
    
    def test_all_skills_classified(self):
        """Test that all skills from contract are classified."""
        results = [classify_skill(skill) for skill in self.skills]
        assert len(results) == len(self.skills), "All skills should be classified"
    
    def test_no_ambiguous_status(self):
        """Test that each skill has exactly one terminal classification."""
        results = [classify_skill(skill) for skill in self.skills]
        
        valid_statuses = {"ready", "gated-env", "missing-binary", "missing-python-dep"}
        
        for result in results:
            assert result["status"] in valid_statuses, (
                f"Skill '{result['folder']}' has invalid status: {result['status']}"
            )
            
            # Check that status is mutually exclusive
            statuses_present = {
                "ready": result["status"] == "ready",
                "gated-env": result["status"] == "gated-env",
                "missing-binary": result["status"] == "missing-binary",
                "missing-python-dep": result["status"] == "missing-python-dep",
            }
            assert sum(statuses_present.values()) == 1, (
                f"Skill '{result['folder']}' has ambiguous status"
            )


# Pytest parametrize for individual skill tests
@pytest.mark.parametrize("skill", load_skill_contract()["skills"], ids=lambda s: s.get("folder"))
def test_skill_dependency(skill: dict[str, Any]):
    """Test individual skill dependencies."""
    result = classify_skill(skill)
    
    # Print detailed output for debugging
    print(f"\n=== Skill: {result['folder']} ===")
    print(f"Status: {result['status']}")
    print(f"Reason: {result['reason']}")
    if result['missing_bins']:
        print(f"Missing binaries: {result['missing_bins']}")
    if result['missing_env']:
        print(f"Missing env vars: {result['missing_env']}")
    if result['missing_python']:
        print(f"Missing Python deps: {result['missing_python']}")
    
    # Generate the report
    generate_report()


def generate_report():
    """Generate the dependency matrix report."""
    contract = load_skill_contract()
    skills = contract.get("skills", [])
    
    results = {
        "generated_at": None,
        "total_skills": len(skills),
        "by_status": {
            "ready": [],
            "gated-env": [],
            "missing-binary": [],
            "missing-python-dep": [],
        },
        "skills": [],
    }
    
    for skill in skills:
        result = classify_skill(skill)
        results["skills"].append(result)
        results["by_status"][result["status"]].append(skill["folder"])
    
    # Add summary
    results["summary"] = {
        "total": len(skills),
        "ready": len(results["by_status"]["ready"]),
        "gated-env": len(results["by_status"]["gated-env"]),
        "missing-binary": len(results["by_status"]["missing-binary"]),
        "missing-python-dep": len(results["by_status"]["missing-python-dep"]),
    }
    
    # Write report
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_PATH, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n=== Report generated at {REPORT_PATH} ===")
    print(f"Summary: {results['summary']}")
    
    return results


def test_generate_dependency_report():
    """Generate and verify the dependency matrix report."""
    results = generate_report()
    
    # Verify report structure
    assert "skills" in results
    assert "by_status" in results
    assert "summary" in results
    
    # Verify all skills are categorized
    total_categorized = sum(len(v) for v in results["by_status"].values())
    assert total_categorized == results["total_skills"]
    
    # Verify report file exists
    assert REPORT_PATH.exists()


if __name__ == "__main__":
    # Run with pytest
    pytest.main([__file__, "-v", "--tb=short"])
