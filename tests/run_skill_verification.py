#!/usr/bin/env python3
"""
Skill Verification Runner - Top-Level Verification Orchestrator

This script orchestrates all skill verification test suites in the required order
and generates a consolidated summary artifact.

Execution Order:
1. Packaging tests (test_skill_packaging.py)
2. Dependency tests (test_skill_dependencies.py)
3. Hermes discovery tests (test_hermes_skill_discovery.py)
4. Runtime matrix tests (test_skill_runtime_matrix.py)

Output:
- .sisyphus/evidence/task-11-verification-summary.json

Exit Codes:
- 0: All tests passed
- 1: One or more tests failed
- 2: Execution error (missing dependencies, etc.)

Usage:
    python tests/run_skill_verification.py
    python tests/run_skill_verification.py --suite packaging
    python tests/run_skill_verification.py --suite dependencies --verbose
    python tests/run_skill_verification.py --skip-container  # Skip container-based tests
    python tests/run_skill_verification.py --ci  # CI mode: non-interactive, exit on first failure
"""

import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Configuration
PROJECT_ROOT = Path(__file__).resolve().parent.parent
TESTS_DIR = PROJECT_ROOT / "tests"
EVIDENCE_DIR = PROJECT_ROOT / ".sisyphus" / "evidence"
SUMMARY_PATH = EVIDENCE_DIR / "task-11-verification-summary.json"

# Test suites in execution order
TEST_SUITES = [
    {
        "name": "packaging",
        "file": "test_skill_packaging.py",
        "description": "Skill packaging invariants (SKILL.md, _meta.json, YAML frontmatter)",
        "requires_container": False,
    },
    {
        "name": "dependencies",
        "file": "test_skill_dependencies.py",
        "description": "Skill dependency verification (binaries, env vars, Python packages)",
        "requires_container": False,
    },
    {
        "name": "hermes-discovery",
        "file": "test_hermes_skill_discovery.py",
        "description": "Hermes skill discovery path verification",
        "requires_container": True,
    },
    {
        "name": "runtime-matrix",
        "file": "test_skill_runtime_matrix.py",
        "description": "Full containerized verification across all skills",
        "requires_container": True,
    },
]


class VerificationResult:
    """Container for test suite results."""
    
    def __init__(self, suite_name: str):
        self.suite_name = suite_name
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.errors = 0
        self.duration_seconds = 0.0
        self.success = False
        self.output = ""
        self.error_output = ""
        self.start_time: Optional[datetime] = None
        self.end_time: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "suite_name": self.suite_name,
            "passed": self.passed,
            "failed": self.failed,
            "skipped": self.skipped,
            "errors": self.errors,
            "total": self.passed + self.failed + self.skipped + self.errors,
            "duration_seconds": round(self.duration_seconds, 2),
            "success": self.success,
            "output_preview": self.output[:500] if self.output else None,
            "error_preview": self.error_output[:500] if self.error_output else None,
        }


def check_prerequisites() -> Tuple[bool, List[str]]:
    """
    Check if all prerequisites are met for running verification.
    
    Returns:
        Tuple of (success, list of error messages)
    """
    errors = []
    
    # Check pytest is available
    try:
        result = subprocess.run(
            ["pytest", "--version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode != 0:
            errors.append("pytest not available or not working")
    except FileNotFoundError:
        errors.append("pytest not installed. Run: pip install pytest")
    except subprocess.TimeoutExpired:
        errors.append("pytest --version timed out")
    
    # Check evidence directory exists
    if not EVIDENCE_DIR.exists():
        try:
            EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            errors.append(f"Cannot create evidence directory: {e}")
    
    # Check skill contract exists (required by dependency tests)
    contract_path = EVIDENCE_DIR / "task-1-skill-contract.json"
    if not contract_path.exists():
        errors.append(f"Skill contract not found: {contract_path}")
    
    return len(errors) == 0, errors


def run_test_suite(
    suite: Dict[str, Any],
    verbose: bool = False,
    skip_container: bool = False,
    ci_mode: bool = False
) -> VerificationResult:
    """
    Run a single test suite.
    
    Args:
        suite: Test suite configuration
        verbose: Enable verbose output
        skip_container: Skip container-based tests
        ci_mode: CI mode (exit on first failure)
    
    Returns:
        VerificationResult with test outcomes
    """
    result = VerificationResult(suite["name"])
    
    # Skip container-based tests if requested
    if skip_container and suite["requires_container"]:
        result.skipped = 1
        result.output = "Skipped (container tests disabled)"
        result.success = True  # Skipped is not a failure
        return result
    
    # Build pytest command
    pytest_args = [
        "pytest",
        str(TESTS_DIR / suite["file"]),
        "-v" if verbose else "-q",
        "--tb=short",
        "--no-header",
    ]
    
    # Add markers for container tests
    if suite["requires_container"]:
        pytest_args.extend(["-m", "not skip_in_host"])
    
    json_report_path = EVIDENCE_DIR / f"task-11-{suite['name']}-report.json"
    try:
        check_proc = subprocess.run(
            ["python", "-c", "import pytest_json_report"],
            capture_output=True,
            timeout=5
        )
        if check_proc.returncode == 0:
            pytest_args.extend([
                "--json-report",
                f"--json-report-file={json_report_path}",
            ])
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    result.start_time = datetime.now()
    
    try:
        proc = subprocess.run(
            pytest_args,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout per suite
            cwd=str(PROJECT_ROOT)
        )
        
        result.end_time = datetime.now()
        result.duration_seconds = (result.end_time - result.start_time).total_seconds()
        result.output = proc.stdout
        result.error_output = proc.stderr
        
        # Parse pytest output for counts
        # Look for summary line like: "X passed, Y failed, Z skipped"
        output_lines = proc.stdout.split('\n')
        for line in output_lines:
            line = line.strip()
            if "passed" in line or "failed" in line or "skipped" in line:
                # Parse counts from pytest summary
                import re
                passed_match = re.search(r'(\d+)\s+passed', line)
                failed_match = re.search(r'(\d+)\s+failed', line)
                skipped_match = re.search(r'(\d+)\s+skipped', line)
                error_match = re.search(r'(\d+)\s+error', line)
                
                if passed_match:
                    result.passed = int(passed_match.group(1))
                if failed_match:
                    result.failed = int(failed_match.group(1))
                if skipped_match:
                    result.skipped = int(skipped_match.group(1))
                if error_match:
                    result.errors = int(error_match.group(1))
        
        # Determine success
        result.success = proc.returncode == 0 or (result.failed == 0 and result.errors == 0)
        
        # Try to parse JSON report for more accurate counts
        if json_report_path.exists():
            try:
                with open(json_report_path, 'r') as f:
                    report = json.load(f)
                    summary = report.get("summary", {})
                    result.passed = summary.get("passed", result.passed)
                    result.failed = summary.get("failed", result.failed)
                    result.skipped = summary.get("skipped", result.skipped)
                    result.errors = summary.get("error", result.errors)
            except (json.JSONDecodeError, KeyError):
                pass  # Fall back to parsed output
        
    except subprocess.TimeoutExpired:
        result.end_time = datetime.now()
        result.duration_seconds = (result.end_time - result.start_time).total_seconds()
        result.errors = 1
        result.error_output = "Test suite timed out after 300 seconds"
        result.success = False
    
    except FileNotFoundError:
        result.end_time = datetime.now()
        result.duration_seconds = (result.end_time - result.start_time).total_seconds()
        result.errors = 1
        result.error_output = "pytest not found. Install with: pip install pytest pytest-json-report"
        result.success = False
    
    return result


def generate_summary(results: List[VerificationResult], ci_mode: bool) -> Dict[str, Any]:
    """
    Generate consolidated summary from all test results.
    
    Args:
        results: List of VerificationResult objects
        ci_mode: Whether running in CI mode
    
    Returns:
        Summary dictionary
    """
    total_passed = sum(r.passed for r in results)
    total_failed = sum(r.failed for r in results)
    total_skipped = sum(r.skipped for r in results)
    total_errors = sum(r.errors for r in results)
    total_duration = sum(r.duration_seconds for r in results)
    
    # Determine overall status
    if total_failed > 0 or total_errors > 0:
        overall_status = "fail"
    elif total_skipped > 0 and total_passed == 0:
        overall_status = "skipped"
    else:
        overall_status = "pass"
    
    # Build summary
    summary = {
        "timestamp": datetime.now().isoformat(),
        "ci_mode": ci_mode,
        "overall_status": overall_status,
        "total_passed": total_passed,
        "total_failed": total_failed,
        "total_skipped": total_skipped,
        "total_errors": total_errors,
        "total_tests": total_passed + total_failed + total_skipped + total_errors,
        "total_duration_seconds": round(total_duration, 2),
        "suites": [r.to_dict() for r in results],
        "suite_summary": {
            "packaging": "pass" if any(r.suite_name == "packaging" and r.success for r in results) else "fail",
            "dependencies": "pass" if any(r.suite_name == "dependencies" and r.success for r in results) else "fail",
            "hermes_discovery": "pass" if any(r.suite_name == "hermes-discovery" and r.success for r in results) else "fail",
            "runtime_matrix": "pass" if any(r.suite_name == "runtime-matrix" and r.success for r in results) else "fail",
        },
    }
    
    return summary


def print_summary(results: List[VerificationResult], summary: Dict[str, Any]) -> None:
    """Print human-readable summary to stdout."""
    print("\n" + "=" * 70)
    print("SKILL VERIFICATION SUMMARY")
    print("=" * 70)
    
    for result in results:
        status_icon = "✓" if result.success else "✗"
        status_text = "PASS" if result.success else "FAIL"
        if result.skipped > 0 and result.passed == 0 and result.failed == 0:
            status_text = "SKIP"
            status_icon = "○"
        
        print(f"\n{status_icon} {result.suite_name.upper()}: {status_text}")
        print(f"   Passed: {result.passed}, Failed: {result.failed}, Skipped: {result.skipped}, Errors: {result.errors}")
        print(f"   Duration: {result.duration_seconds:.2f}s")
    
    print("\n" + "-" * 70)
    print(f"TOTAL: {summary['total_passed']} passed, {summary['total_failed']} failed, {summary['total_skipped']} skipped, {summary['total_errors']} errors")
    print(f"Duration: {summary['total_duration_seconds']:.2f}s")
    print(f"Overall Status: {summary['overall_status'].upper()}")
    print(f"Evidence: {SUMMARY_PATH}")
    print("=" * 70)


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Run skill verification test suites",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python tests/run_skill_verification.py
    python tests/run_skill_verification.py --suite packaging
    python tests/run_skill_verification.py --skip-container
    python tests/run_skill_verification.py --ci --verbose
        """
    )
    
    parser.add_argument(
        "--suite",
        choices=["packaging", "dependencies", "hermes-discovery", "runtime-matrix", "all"],
        default="all",
        help="Run specific test suite (default: all)"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )
    
    parser.add_argument(
        "--skip-container",
        action="store_true",
        help="Skip container-based tests (hermes-discovery, runtime-matrix)"
    )
    
    parser.add_argument(
        "--ci",
        action="store_true",
        help="CI mode: non-interactive, exit on first failure"
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be run without executing"
    )
    
    args = parser.parse_args()
    
    # Check prerequisites
    prereq_ok, prereq_errors = check_prerequisites()
    if not prereq_ok:
        print("ERROR: Prerequisites not met:")
        for error in prereq_errors:
            print(f"  - {error}")
        return 2
    
    # Determine which suites to run
    if args.suite == "all":
        suites_to_run = TEST_SUITES
    else:
        suites_to_run = [s for s in TEST_SUITES if s["name"] == args.suite]
    
    # Dry run mode
    if args.dry_run:
        print("Would run the following test suites:")
        for suite in suites_to_run:
            skip_marker = " (would skip - container)" if args.skip_container and suite["requires_container"] else ""
            print(f"  - {suite['name']}: {suite['file']}{skip_marker}")
        return 0
    
    # Run test suites
    results: List[VerificationResult] = []
    
    for suite in suites_to_run:
        print(f"\nRunning: {suite['name']} ({suite['file']})")
        print(f"  {suite['description']}")
        
        result = run_test_suite(
            suite,
            verbose=args.verbose,
            skip_container=args.skip_container,
            ci_mode=args.ci
        )
        results.append(result)
        
        # Print result
        status = "PASS" if result.success else "FAIL"
        if result.skipped > 0 and result.passed == 0 and result.failed == 0:
            status = "SKIP"
        
        print(f"  Result: {status} ({result.passed} passed, {result.failed} failed, {result.skipped} skipped)")
        
        # In CI mode, exit on first failure
        if args.ci and not result.success:
            print("\nCI mode: Exiting on first failure")
            break
    
    # Generate and save summary
    summary = generate_summary(results, args.ci)
    
    # Ensure evidence directory exists
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    
    # Write summary
    with open(SUMMARY_PATH, 'w') as f:
        json.dump(summary, f, indent=2)
    
    # Print summary
    print_summary(results, summary)
    
    # Return appropriate exit code
    if summary["overall_status"] == "fail":
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())