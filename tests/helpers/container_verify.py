"""
Container verification helper for Docker-based integration tests.

Provides utilities for:
- Starting containers with health polling
- Executing commands with output capture
- Timeout handling
- Evidence file writing
- Cleanup guarantees

Usage:
    from tests.helpers.container_verify import ContainerHelper

    helper = ContainerHelper(image="picoclaw-railway-template")
    helper.start(port=8080, env={"ADMIN_PASSWORD": "test"})

    # Wait for health endpoint
    helper.wait_for_health(timeout=60)

    # Execute command in container
    exit_code, output = helper.exec(["ls", "-la", "/app"])

    # Write transcript to evidence file
    helper.write_evidence("startup.log", output)

    # Cleanup
    helper.stop()
"""

import subprocess
import time
import json
from pathlib import Path
from typing import Optional, Dict, List, Tuple, Any
from dataclasses import dataclass


@dataclass
class ContainerResult:
    """Result of a container operation."""
    success: bool
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: float = 0.0


@dataclass
class HealthCheckResult:
    """Result of a health check poll."""
    healthy: bool
    attempts: int
    total_time_ms: float
    last_response: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ContainerHelper:
    """
    Docker container management helper for integration tests.

    This class provides a clean API for:
    - Starting/stopping containers
    - Health polling with configurable timeouts
    - Command execution with output capture
    - Evidence file writing for test artifacts

    All operations include proper cleanup guarantees.
    """

    def __init__(
        self,
        image: str,
        name: Optional[str] = None,
        evidence_dir: Optional[Path] = None
    ):
        """
        Initialize container helper.

        Args:
            image: Docker image name (e.g., "picoclaw-railway-template")
            name: Container name (auto-generated if not provided)
            evidence_dir: Directory for evidence files (default: ./evidence)
        """
        self.image = image
        self.name = name or f"test-{int(time.time() * 1000)}"
        self.evidence_dir = evidence_dir or Path("./evidence")
        self._container_id: Optional[str] = None
        self._started = False
        self._transcripts: List[Dict[str, Any]] = []

    def _run_docker(
        self,
        args: List[str],
        timeout: float = 30.0,
        capture: bool = True
    ) -> Tuple[int, str, str]:
        """
        Run a docker command with timeout handling.

        Args:
            args: Docker command arguments (e.g., ["run", "-d", ...])
            timeout: Timeout in seconds
            capture: Whether to capture output

        Returns:
            Tuple of (exit_code, stdout, stderr)
        """
        cmd = ["docker"] + args

        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                timeout=timeout
            )

            return (
                result.returncode,
                result.stdout.strip() if result.stdout else "",
                result.stderr.strip() if result.stderr else ""
            )
        except subprocess.TimeoutExpired:
            raise TimeoutError(f"Docker command timed out after {timeout}s: {' '.join(cmd)}")

    def start(
        self,
        port: int = 8080,
        env: Optional[Dict[str, str]] = None,
        volumes: Optional[Dict[str, str]] = None,
        extra_args: Optional[List[str]] = None,
        timeout: float = 30.0
    ) -> ContainerResult:
        """
        Start the container with specified configuration.

        Args:
            port: Host port to map
            env: Environment variables
            volumes: Volume mappings {host_path: container_path}
            extra_args: Additional docker run arguments
            timeout: Startup timeout in seconds

        Returns:
            ContainerResult with startup status
        """
        if self._started:
            raise RuntimeError(f"Container {self.name} already started")

        args = ["run", "-d", "--name", self.name]

        # Port mapping
        args.extend(["-p", f"{port}:{port}"])

        # Environment variables
        if env:
            for key, value in env.items():
                args.extend(["-e", f"{key}={value}"])

        # Volume mappings
        if volumes:
            for host_path, container_path in volumes.items():
                args.extend(["-v", f"{host_path}:{container_path}"])

        # Extra arguments
        if extra_args:
            args.extend(extra_args)

        # Image name
        args.append(self.image)

        start_time = time.time()

        try:
            exit_code, stdout, stderr = self._run_docker(args, timeout=timeout)
            duration_ms = (time.time() - start_time) * 1000

            if exit_code == 0:
                self._container_id = stdout.strip()
                self._started = True

                # Record transcript
                self._transcripts.append({
                    "operation": "start",
                    "success": True,
                    "container_id": self._container_id,
                    "duration_ms": duration_ms,
                    "timestamp": time.time()
                })

                return ContainerResult(
                    success=True,
                    exit_code=exit_code,
                    stdout=stdout,
                    stderr=stderr,
                    duration_ms=duration_ms
                )
            else:
                return ContainerResult(
                    success=False,
                    exit_code=exit_code,
                    stdout=stdout,
                    stderr=stderr,
                    duration_ms=duration_ms
                )

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return ContainerResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=str(e),
                duration_ms=duration_ms
            )

    def stop(self, timeout: float = 10.0) -> ContainerResult:
        """
        Stop and remove the container.

        Args:
            timeout: Stop timeout in seconds

        Returns:
            ContainerResult with stop status
        """
        if not self._started:
            return ContainerResult(
                success=True,
                exit_code=0,
                stdout="",
                stderr="Container not running"
            )

        start_time = time.time()

        try:
            # Stop the container
            exit_code, stdout, stderr = self._run_docker(
                ["stop", self.name],
                timeout=timeout
            )

            # Remove the container
            self._run_docker(["rm", self.name], timeout=timeout)

            duration_ms = (time.time() - start_time) * 1000
            self._started = False
            self._container_id = None

            self._transcripts.append({
                "operation": "stop",
                "success": True,
                "duration_ms": duration_ms,
                "timestamp": time.time()
            })

            return ContainerResult(
                success=True,
                exit_code=exit_code,
                stdout=stdout,
                stderr=stderr,
                duration_ms=duration_ms
            )

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            return ContainerResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=str(e),
                duration_ms=duration_ms
            )

    def wait_for_health(
        self,
        port: int = 8080,
        path: str = "/health",
        timeout: float = 60.0,
        interval: float = 1.0,
        expected_status: int = 200
    ) -> HealthCheckResult:
        """
        Poll health endpoint until healthy or timeout.

        Uses curl inside the container to check health endpoint.

        Args:
            port: Container port
            path: Health endpoint path
            timeout: Maximum wait time in seconds
            interval: Polling interval in seconds
            expected_status: Expected HTTP status code

        Returns:
            HealthCheckResult with polling status
        """
        start_time = time.time()
        attempts = 0
        last_error: Optional[str] = None
        last_response: Optional[Dict[str, Any]] = None

        while (time.time() - start_time) < timeout:
            attempts += 1

            try:
                # Use curl to check health endpoint
                exit_code, stdout, stderr = self._run_docker(
                    ["exec", self.name, "curl", "-s", "-f", f"http://localhost:{port}{path}"],
                    timeout=5.0
                )

                if exit_code == 0:
                    total_time_ms = (time.time() - start_time) * 1000

                    # Try to parse JSON response
                    try:
                        last_response = json.loads(stdout)
                    except json.JSONDecodeError:
                        last_response = {"raw": stdout}

                    self._transcripts.append({
                        "operation": "health_check",
                        "success": True,
                        "attempts": attempts,
                        "duration_ms": total_time_ms,
                        "timestamp": time.time()
                    })

                    return HealthCheckResult(
                        healthy=True,
                        attempts=attempts,
                        total_time_ms=total_time_ms,
                        last_response=last_response
                    )

                last_error = stderr or f"Exit code: {exit_code}"

            except TimeoutError as e:
                last_error = str(e)

            time.sleep(interval)

        total_time_ms = (time.time() - start_time) * 1000

        self._transcripts.append({
            "operation": "health_check",
            "success": False,
            "attempts": attempts,
            "duration_ms": total_time_ms,
            "error": last_error,
            "timestamp": time.time()
        })

        return HealthCheckResult(
            healthy=False,
            attempts=attempts,
            total_time_ms=total_time_ms,
            error=last_error
        )

    def exec(
        self,
        command: List[str],
        timeout: float = 30.0,
        user: Optional[str] = None,
        workdir: Optional[str] = None
    ) -> ContainerResult:
        """
        Execute a command in the running container.

        Args:
            command: Command and arguments to execute
            timeout: Execution timeout in seconds
            user: User to run as
            workdir: Working directory

        Returns:
            ContainerResult with command output
        """
        if not self._started:
            raise RuntimeError(f"Container {self.name} not started")

        args = ["exec"]

        if user:
            args.extend(["-u", user])

        if workdir:
            args.extend(["-w", workdir])

        args.append(self.name)
        args.extend(command)

        start_time = time.time()

        try:
            exit_code, stdout, stderr = self._run_docker(args, timeout=timeout)
            duration_ms = (time.time() - start_time) * 1000

            self._transcripts.append({
                "operation": "exec",
                "command": command,
                "success": exit_code == 0,
                "exit_code": exit_code,
                "duration_ms": duration_ms,
                "timestamp": time.time()
            })

            return ContainerResult(
                success=exit_code == 0,
                exit_code=exit_code,
                stdout=stdout,
                stderr=stderr,
                duration_ms=duration_ms
            )

        except TimeoutError as e:
            duration_ms = (time.time() - start_time) * 1000
            return ContainerResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=str(e),
                duration_ms=duration_ms
            )

    def path_exists(self, path: str) -> bool:
        """
        Check if a path exists in the container.

        Args:
            path: Path to check

        Returns:
            True if path exists, False otherwise
        """
        if not self._started:
            raise RuntimeError(f"Container {self.name} not started")

        result = self.exec(["test", "-e", path], timeout=5.0)
        return result.success

    def read_file(self, path: str, timeout: float = 10.0) -> ContainerResult:
        """
        Read a file from the container.

        Args:
            path: File path in container
            timeout: Read timeout in seconds

        Returns:
            ContainerResult with file contents in stdout
        """
        return self.exec(["cat", path], timeout=timeout)

    def write_evidence(
        self,
        filename: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Path:
        """
        Write content to an evidence file.

        Args:
            filename: Evidence file name
            content: Content to write
            metadata: Optional metadata to include as header

        Returns:
            Path to the evidence file
        """
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        evidence_path = self.evidence_dir / filename

        with open(evidence_path, "w") as f:
            if metadata:
                f.write("# Evidence Metadata\n")
                f.write(f"# Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                for key, value in metadata.items():
                    f.write(f"# {key}: {value}\n")
                f.write("\n")
            f.write(content)

        return evidence_path

    def write_transcript(self, filename: str = "transcript.json") -> Path:
        """
        Write all operation transcripts to a JSON file.

        Args:
            filename: Transcript file name

        Returns:
            Path to the transcript file
        """
        self.evidence_dir.mkdir(parents=True, exist_ok=True)
        transcript_path = self.evidence_dir / filename

        with open(transcript_path, "w") as f:
            json.dump({
                "container": self.name,
                "image": self.image,
                "operations": self._transcripts
            }, f, indent=2)

        return transcript_path

    def get_logs(self, tail: int = 100) -> ContainerResult:
        """
        Get container logs.

        Args:
            tail: Number of lines to retrieve

        Returns:
            ContainerResult with logs in stdout
        """
        if not self._started:
            raise RuntimeError(f"Container {self.name} not started")

        exit_code, stdout, stderr = self._run_docker(
            ["logs", "--tail", str(tail), self.name],
            timeout=10.0
        )

        return ContainerResult(
            success=exit_code == 0,
            exit_code=exit_code,
            stdout=stdout,
            stderr=stderr,
            duration_ms=0
        )

    def __enter__(self) -> "ContainerHelper":
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        """Context manager exit - ensures cleanup."""
        if self._started:
            self.stop()

    def is_running(self) -> bool:
        """Check if container is currently running."""
        if not self._container_id:
            return False

        try:
            exit_code, stdout, stderr = self._run_docker(
                ["ps", "-q", "--filter", f"id={self._container_id}"],
                timeout=5.0
            )
            return exit_code == 0 and bool(stdout.strip())
        except Exception:
            return False


def build_image(
    dockerfile_path: Path,
    tag: str,
    build_args: Optional[Dict[str, str]] = None,
    timeout: float = 300.0
) -> ContainerResult:
    """
    Build a Docker image from a Dockerfile.

    Args:
        dockerfile_path: Path to Dockerfile or directory containing Dockerfile
        tag: Image tag
        build_args: Build arguments
        timeout: Build timeout in seconds

    Returns:
        ContainerResult with build status
    """
    args = ["build"]

    if dockerfile_path.is_file():
        args.extend(["-f", str(dockerfile_path)])
        context = str(dockerfile_path.parent)
    else:
        context = str(dockerfile_path)

    args.extend(["-t", tag])

    if build_args:
        for key, value in build_args.items():
            args.extend(["--build-arg", f"{key}={value}"])

    args.append(context)

    start_time = time.time()

    try:
        cmd = ["docker"] + args
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        duration_ms = (time.time() - start_time) * 1000

        return ContainerResult(
            success=result.returncode == 0,
            exit_code=result.returncode,
            stdout=result.stdout,
            stderr=result.stderr,
            duration_ms=duration_ms
        )

    except subprocess.TimeoutExpired:
        duration_ms = (time.time() - start_time) * 1000
        return ContainerResult(
            success=False,
            exit_code=-1,
            stdout="",
            stderr=f"Build timed out after {timeout}s",
            duration_ms=duration_ms
        )


def check_docker_available() -> bool:
    """
    Check if Docker is available and running.

    Returns:
        True if Docker is available, False otherwise
    """
    try:
        result = subprocess.run(
            ["docker", "version"],
            capture_output=True,
            text=True,
            timeout=5.0
        )
        return result.returncode == 0
    except Exception:
        return False