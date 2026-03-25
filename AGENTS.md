# PicoClaw Railway Template - AI Agent Rules & Guidelines

Welcome! This `AGENTS.md` file provides essential context, commands, and code style guidelines for AI agents operating within the PicoClaw Railway Template repository. This repository packages the PicoClaw Gateway for easy 1-click deployments on Railway with an integrated Configuration UI and Gateway Management Dashboard.

## 1. Project Overview & Architecture

**Primary Goal:** Provide a dead-simple, highly reliable deploy template for the `picoclaw` gateway.
- **Backend:** Python 3.12, Starlette (bare async ASGI framework), Uvicorn, Asyncio.
- **Frontend:** Vite+React+TypeScript app in `frontend/` directory, served as built static files by the Python backend.
- **Deployment:** Docker, Railway (`railway.toml`).
- **Core Mechanism:** A Python web server runs alongside the `picoclaw gateway` binary as a subprocess, managing its lifecycle (start/stop/restart) and intercepting `stdout`/`stderr` for live logging via a web UI.

## 2. Environment Setup, Build, and Testing Commands

### Running Locally (Docker)
To accurately replicate the Railway production environment, use Docker:
```bash
# 1. Build the image
docker build -t picoclaw-railway-template .

# 2. Run the container
# Mount a local .tmpdata directory to persist state
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e ADMIN_PASSWORD=test \
  -v $(pwd)/.tmpdata:/data \
  picoclaw-railway-template
```
*Access the web UI at `http://localhost:8080` with username `admin` and password `test`.*

### Python Environment Management
The Dockerfile uses `uv` for ultra-fast package installation. Locally, standard `pip` or `uv` is fine:
```bash
# Install dependencies
uv pip install -r requirements.txt
# OR
pip install -r requirements.txt
```

### Installing and Managing Skills
To pre-install OpenClaw skills via the Docker image so they are available upon deployment:
1. Download the skill package (a `.zip` containing `SKILL.md` and `_meta.json`) from ClawHub Skills Lib.
2. Unzip the package into a folder under `skills/` (e.g., `skills/gog/SKILL.md`).
3. If the skill requires any CLI binaries (e.g., `gogcli`), modify the `Dockerfile` to install them (e.g., via `go install` or downloading prebuilt binaries) and `COPY` them to `/usr/local/bin/` in the final stage.
4. On startup, `start.sh` automatically copies the contents of `skills/` into the persistent `/data/.picoclaw/workspace/skills/` directory using `cp -rn` if they don't already exist.

### Running Tests
There is currently no formal test suite. If you are asked to write and run tests, you must set them up first:
1. **Install Pytest:** `uv pip install pytest httpx`
2. **Create Test File:** Write tests in a new `tests/test_server.py` file.
3. **Run a Single Test:**
   ```bash
   pytest tests/test_server.py::test_function_name -v
   ```
4. **Run All Tests:**
   ```bash
   pytest tests/
   ```

### Linting and Formatting
No strict linters are currently enforced via CI, but the codebase follows standard, clean Python conventions. If introducing linting, prefer `ruff`:
```bash
# Check for lint errors
ruff check .

# Format code automatically
ruff format .
```

## 3. Code Style & Implementation Guidelines

### Python Backend (`server.py`)
- **Async-First:** The server relies entirely on `asyncio`. Route handlers must be `async def`. The subprocess manager (`GatewayManager`) uses `asyncio.create_subprocess_exec` and background tasks for non-blocking stream reading. Use `await` for all I/O operations.
- **Framework Choice:** Built with bare Starlette (`starlette.applications.Starlette`), *not* FastAPI. Do not import `fastapi`. Return `JSONResponse` or `TemplateResponse` directly from route handlers.
- **Error Handling:** 
  - Wrap unstable logic in `try...except`.
  - On failure, return a clean JSON payload: `return JSONResponse({"error": str(e)}, status_code=500)`.
  - For authentication issues, use Starlette's `AuthenticationError` or return a 401 `PlainTextResponse` with the `WWW-Authenticate` header.
- **Security & Secrets (CRITICAL):**
  - All configurations containing API keys and tokens MUST be passed through the `mask_secrets()` function before being returned by `GET /api/config`.
  - When accepting new configurations (`PUT /api/config`), use `merge_secrets()` to ensure masked secrets `***` do not overwrite the actual stored keys.
  - If adding new secret fields (e.g., a new provider's API key or a new channel's token), you MUST add the key name to the `SECRET_FIELDS` set at the top of `server.py`.
  - Passwords are auto-generated via `secrets.token_urlsafe(16)` if `ADMIN_PASSWORD` is not provided in the environment.
- **Type Hinting:** Use standard Python type hinting (e.g., `def get_status() -> dict:`) to improve code clarity and maintainability.
- **Logging Management:** Subprocess logs are captured and stored in a limited-size `collections.deque(maxlen=500)`. This structure is intentional to prevent memory leaks over long uptimes. Do not replace it with an unbounded list.

### React+Vite Frontend (`frontend/`)
- **Build Architecture:** The Python backend (`server.py`, `start.sh`, `requirements.txt`) has no Node.js dependencies. The `frontend/` directory is a separate Vite+React+TypeScript application with its own `package.json`. Frontend builds are performed via `npm run build` during Docker image construction. The built static files are served by the Python backend from `frontend/dist/`. **Do not add npm packages to the Python backend layer. Do not add Python packages to `frontend/`.**
- **State Management:** Use React hooks (`useState`, `useContext`, `useReducer`) and TanStack Query for data fetching. **Do not add:** shadcn/ui, React Router, Zustand, Redux, or other complex state management libraries.
- **Styling:** 
  - Use Tailwind utility classes. 
  - **Dark Mode Requirement:** All new UI components must include equivalent `dark:` classes for dark mode support (e.g., `bg-white dark:bg-gray-900`, `text-gray-900 dark:text-gray-100`, `border-gray-200 dark:border-gray-800`).
- **Component Structure:** Keep components simple and focused. Do not over-architect — follow React best practices but avoid unnecessary abstraction layers or complex patterns.

### Git & Collaboration
- Do not over-engineer. This is a template designed for quick, reliable 1-click deployments.
- Write clear, concise commit messages.
- Do not suppress type errors unless absolutely necessary, and always comment why if you do.


## 4. Codebase Structure & File Guide
- `server.py`: The core backend server and gateway manager. All routes and API endpoints live here.
- `frontend/`: Vite+React+TypeScript application with its own `package.json`, build config, and components.
- `frontend/dist/`: Built static files (HTML, CSS, JS bundles) served by the Python backend at `/`.
- `start.sh`: The container entrypoint. Bootstraps the workspace and starts the Python server.
- `railway.toml`: Deployment configuration for Railway specifically.
- `requirements.txt`: Python dependencies (Starlette, Uvicorn, Jinja2, python-multipart).
- `Dockerfile`: Multi-stage build that compiles PicoClaw from Go source, builds the React frontend, and sets up the Python environment.

## 5. Agent Instructions (Tone & Behavior)
- **Simplicity First:** The biggest virtue of this repository is straightforward, focused code without unnecessary complexity. For the Python backend, maintain the zero-build simplicity. For the React+Vite frontend, avoid adding component libraries (shadcn/ui), routing libraries (React Router), or complex state management (Zustand, Redux). Keep the codebase maintainable and easy to understand.
- **Zero Fluff:** Provide only the code needed to implement a feature. Do not add superfluous abstractions, design patterns, or layers unless necessary for fixing a bug or fulfilling a request.
- **Persistence:** Remember that the configuration is stored in `~/.picoclaw/config.json` inside the container (mapped to `/data` in Railway). Modifications to settings must read/write to this location.
- **Error Recovery:** If modifying the `GatewayManager` subprocess logic, ensure that you handle `asyncio.CancelledError` gracefully and never leave zombie `picoclaw gateway` processes behind.
- **Reviewing Output:** Before concluding a feature, make sure to check that the UI binds correctly to `config` state in `index.html` and that `server.py` correctly passes masked/merged secrets back and forth.
- **Environment Constraints (WSL):** We are currently operating in a WSL (Windows Subsystem for Linux) environment. Installing or using browser automation tools like Playwright alongside browsers (Firefox, Chrome) is difficult and highly prone to failure. Avoid relying on Playwright or browser-based tasks unless explicitly required and configured to work in this environment.