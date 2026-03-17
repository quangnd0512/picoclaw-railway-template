"""
Hermes Skill Discovery Baseline Test

This test proves the gap between skills installed in the PicoClaw workspace path
and the Hermes canonical discovery path.

Expected behavior BEFORE remediation:
- Skills exist at /data/.picoclaw/workspace/skills (copied by start.sh)
- Skills are MISSING from /data/.hermes/skills (Hermes canonical path)
- This test MUST FAIL to prove the gap exists

Expected behavior AFTER remediation (Task 7):
- Skills will exist in both paths (or symlinked/copied)
- This test should pass

Task: 5 (Wave 1)
Purpose: Establish baseline failure that proves the path mismatch problem
"""

import pytest
import time
from pathlib import Path
from tests.helpers.container_verify import ContainerHelper


# Expected skills that should exist based on project's skills/ directory
EXPECTED_SKILLS = [
    "finance-news",
    "gemini-deep-research",
    "github",
    "reddit-insights",
    "self-improving-agent",
    "stock-analysis",
    "summarize",
    "trading-research",
    "web-search",
    "x-research",
    "news-aggregator-skill",
    "crypto-market-data",
    "find-skills",
]

# The PicoClaw workspace path where skills are copied on startup
PICOCLAW_SKILLS_PATH = "/data/.picoclaw/workspace/skills"

# The Hermes canonical discovery path (should contain skills for Hermes to discover)
HERMES_SKILLS_PATH = "/data/.hermes/skills"


@pytest.fixture
def container():
    """Fixture to manage container lifecycle for the test."""
    helper = ContainerHelper(
        image="picoclaw-railway-template",
        name=f"test-hermes-skills-{int(time.time() * 1000)}",
        evidence_dir=Path(".sisyphus/evidence")
    )

    # Start container with /data volume to persist state
    result = helper.start(
        port=8080,
        env={
            "PORT": "8080",
            "ADMIN_PASSWORD": "test",
        },
        volumes={
            str(Path.cwd() / ".tmpdata"): "/data"
        },
        timeout=60.0
    )

    if not result.success:
        pytest.fail(f"Failed to start container: {result.stderr}")

    # Wait for container to be ready
    time.sleep(3)

    yield helper

    # Cleanup
    helper.stop()


def list_skills_in_path(helper: ContainerHelper, path: str) -> list[str]:
    """
    List skill directories in the given path.

    Args:
        helper: ContainerHelper instance
        path: Path to check for skills

    Returns:
        List of skill directory names
    """
    # Use find instead of glob pattern to avoid shell expansion issues
    result = helper.exec(["sh", "-c", f"ls -d {path}/*/ 2>/dev/null || true"], timeout=10.0)
    if not result.success:
        return []

    # Parse output - each line is a directory path
    skills = []
    for line in result.stdout.strip().split("\n"):
        if line:
            # Extract directory name from path
            skill_name = line.rstrip("/").split("/")[-1]
            skills.append(skill_name)

    return skills


def path_exists_in_container(helper: ContainerHelper, path: str) -> bool:
    """Check if a path exists in the container."""
    result = helper.exec(["test", "-d", path], timeout=5.0)
    return result.success


def test_hermes_skill_discovery_gap(container):
    """
    Test that proves the gap between PicoClaw workspace skills and Hermes discovery path.

    This test MUST FAIL before Task 7 remediation to prove:
    1. Skills exist in /data/.picoclaw/workspace/skills (start.sh copies them)
    2. Skills are MISSING from /data/.hermes/skills (Hermes canonical path)

    After Task 7 (path remediation), this test should pass.
    """
    # Step 1: Verify PicoClaw workspace skills path exists and contains skills
    picoclaw_path_exists = path_exists_in_container(container, PICOCLAW_SKILLS_PATH)
    assert picoclaw_path_exists, (
        f"PicoClaw skills path does not exist: {PICOCLAW_SKILLS_PATH}. "
        "This is unexpected - start.sh should create this path."
    )

    picoclaw_skills = list_skills_in_path(container, PICOCLAW_SKILLS_PATH)

    # Verify we have skills in the picoclaw path
    assert len(picoclaw_skills) > 0, (
        f"No skills found in {PICOCLAW_SKILLS_PATH}. "
        "start.sh should have copied skills from /app/skills."
    )

    # Step 2: Check Hermes canonical discovery path
    hermes_path_exists = path_exists_in_container(container, HERMES_SKILLS_PATH)

    hermes_skills = []
    if hermes_path_exists:
        hermes_skills = list_skills_in_path(container, HERMES_SKILLS_PATH)

    # Step 3: Build diagnostic message
    diagnostic = f"""
================================================================================
HERMES SKILL DISCOVERY GAP ANALYSIS
================================================================================

PicoClaw Workspace Path: {PICOCLAW_SKILLS_PATH}
  - Exists: {picoclaw_path_exists}
  - Skills found ({len(picoclaw_skills)}):
    {', '.join(sorted(picoclaw_skills))}

Hermes Canonical Path: {HERMES_SKILLS_PATH}
  - Exists: {hermes_path_exists}
  - Skills found ({len(hermes_skills)}):
    {', '.join(sorted(hermes_skills)) if hermes_skills else '(none)'}

================================================================================
GAP ANALYSIS
================================================================================
"""

    # Find missing skills (in picoclaw but not in hermes)
    missing_skills = set(picoclaw_skills) - set(hermes_skills)
    extra_skills = set(hermes_skills) - set(picoclaw_skills)

    if missing_skills:
        diagnostic += f"""
MISSING from Hermes (in PicoClaw but not in Hermes):
  {', '.join(sorted(missing_skills))}
"""
    if extra_skills:
        diagnostic += f"""
EXTRA in Hermes (in Hermes but not in PicoClaw):
  {', '.join(sorted(extra_skills))}
"""

    # Write diagnostic to evidence file
    evidence_path = container.write_evidence(
        "task-5-hermes-baseline.txt",
        diagnostic,
        metadata={
            "test": "test_hermes_skill_discovery_gap",
            "picoclaw_skills_path": PICOCLAW_SKILLS_PATH,
            "hermes_skills_path": HERMES_SKILLS_PATH,
            "picoclaw_skills_count": len(picoclaw_skills),
            "hermes_skills_count": len(hermes_skills),
        }
    )

    diagnostic += f"""
================================================================================
EVIDENCE
================================================================================
Diagnostic evidence written to: {evidence_path}

This test FAILS to prove the gap exists (skills in PicoClaw but not Hermes).
After Task 7 remediation, this test should PASS.
================================================================================
"""

    # Step 4: Assert the gap exists (this is the baseline failure)
    # The test FAILS here to prove the problem exists
    # After Task 7, this assertion should pass (no missing skills)
    assert len(missing_skills) == 0, diagnostic


def test_hermes_skill_discovery_alternative_paths(container):
    """
    Additional test to check alternative Hermes skill discovery paths.

    Hermes might look in other locations - check a few common alternatives.
    This provides additional evidence for the gap.
    """
    alternative_paths = [
        "/data/.hermes/skills",
        "/root/.hermes/skills",
        "/home/app/.hermes/skills",
    ]

    findings = []

    for path in alternative_paths:
        exists = path_exists_in_container(container, path)
        skills = []
        if exists:
            skills = list_skills_in_path(container, path)

        findings.append({
            "path": path,
            "exists": exists,
            "skills_count": len(skills),
            "skills": sorted(skills),
        })

    # Write findings to evidence
    evidence_content = "Hermes Skill Discovery Alternative Paths Check\n"
    evidence_content += "=" * 60 + "\n\n"

    for f in findings:
        evidence_content += f"Path: {f['path']}\n"
        evidence_content += f"  Exists: {f['exists']}\n"
        evidence_content += f"  Skills: {f['skills_count']} - {', '.join(f['skills']) if f['skills'] else '(none)'}\n\n"

    container.write_evidence(
        "task-5-hermes-alt-paths.txt",
        evidence_content
    )

    # The primary hermes path should NOT have skills (proving the gap)
    primary_path = next((f for f in findings if f["path"] == HERMES_SKILLS_PATH), None)
    assert primary_path is not None

    # This should have no skills (proving gap)
    assert primary_path["skills_count"] == 0, (
        f"Expected no skills in {HERMES_SKILLS_PATH} to prove gap, "
        f"but found: {primary_path['skills']}"
    )
