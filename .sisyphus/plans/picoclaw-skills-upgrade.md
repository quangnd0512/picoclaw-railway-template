# PicoClaw Skills Upgrade — 13 Skills + OAuth Fix + RSS Pre-config

## TL;DR

> **Quick Summary**: Upgrade the PicoClaw Railway Template with 13 curated ClawHub skills, fix OAuth token persistence for gog, pre-configure Medium RSS feeds for the user's full-stack tech stack, and install all CLI/Python/Node dependencies — transforming the bot into a personal command center for daily tech blog reading, crypto/stock monitoring, deep tech research, and indie hacker idea validation.
> 
> **Deliverables**:
> - 13 new skill directories pre-packaged in Docker image (`skills/`)
> - Updated Dockerfile with CLI binaries (blogwatcher, summarize, gh) and Python/Node deps
> - Fixed OAuth token persistence for gog (survives container recreation)
> - Pre-configured Medium RSS feeds for 12 tech stack tags
> - Updated start.sh with token persistence bootstrapping
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 (research deps) → Task 2 (Dockerfile) → Task 4 (OAuth fix) → Task 10 (integration test)

---

## Context

### Original Request
User deploys PicoClaw on Railway. OAuth tokens for tools like gog vanish on redeploy. User wants:
1. New skills for daily tech blog reading, crypto/stock monitoring, research, and indie hacking
2. Fix the persistence problem
3. Pre-configured Medium RSS feeds for their tech stack
4. A "personal command center" bot

### Interview Summary
**Key Discussions**:
- **What vanishes**: OAuth tokens/auth state — NOT binaries or skill files. Gog's Google OAuth tokens don't survive container recreation.
- **API keys**: User has OpenAI + Gemini only (no Tavily, no Brave). Skills requiring those replaced with free alternatives (web-search uses DuckDuckGo).
- **Trading scope**: Research & monitoring only. No execution. May add later.
- **Tech stack**: Python, TS/Node, React/Next.js, Go, Docker/K8s, AI/ML/LLMs, React Native/Expo
- **Channel**: Telegram
- **Skills**: All 13 approved by user

**Research Findings**:
- ClawHub registry has 20,500+ skills. 13 curated across 4 tiers (Daily Intel, Trading, Research, Meta).
- Skill download API: `https://wry-manatee-359.convex.site/api/v1/download?slug=<slug>`
- Skill structure: `SKILL.md` (frontmatter + instructions) + `_meta.json` (ownerId, slug, version, publishedAt)
- Dockerfile: 2-stage build (Go builder → Python slim). `go install` pattern for Go binaries.
- start.sh: `cp -rn /app/skills/* /data/.picoclaw/workspace/skills/` — copies on first boot, preserves existing
- HOME=/data in container → gog tokens should persist IF stored under $HOME. Investigation needed for exact token path.

### Metis Review
**Identified Gaps** (addressed):
- **Gog token path unknown**: Added investigation task (Task 1) to determine exact storage location before implementing fix
- **CLI binary install methods unverified**: Added research step in Task 1 for blogwatcher, summarize, gh installation
- **Skill download API untested**: Added validation step in Task 3 to test API before bulk download
- **Docker image size concerns**: Added monitoring in Task 2 — report final image size
- **Dependency conflicts**: Added isolation checks in Task 5 (Python deps) and Task 6 (Node deps)
- **Skill update strategy**: Addressed — runtime `clawdbot install` updates persist in /data, Docker rebuild refreshes baseline

---

## Work Objectives

### Core Objective
Transform PicoClaw from a single-skill bot into a comprehensive personal command center with 13 curated skills covering daily tech intel, trading research, deep research, and meta-capabilities — while fixing the OAuth persistence bug that breaks gog on redeploy.

### Concrete Deliverables
- `skills/blogwatcher/` — RSS/Medium blog monitoring skill
- `skills/summarize/` — URL/PDF/YouTube summarization skill
- `skills/news-aggregator-skill/` — Multi-source news skill
- `skills/stock-analysis/` — Stock & crypto analysis skill
- `skills/crypto-market-data/` — Real-time crypto prices skill
- `skills/finance-news/` — Market news briefings skill
- `skills/gemini-deep-research/` — Deep multi-source research skill
- `skills/reddit-insights/` — Reddit semantic search skill
- `skills/web-search/` — DuckDuckGo web search skill
- `skills/find-skills/` — Skill auto-discovery skill
- `skills/self-improving-agent/` — Self-learning skill
- `skills/github/` — GitHub CLI integration skill
- `skills/x-research/` — X/Twitter research skill
- `Dockerfile` — Updated with CLI binaries + Python/Node dependencies
- `start.sh` — Updated with OAuth token persistence fix
- Pre-configured blogwatcher RSS feeds for 12 Medium tags

### Definition of Done
- [ ] `docker build -t picoclaw-test .` succeeds without errors
- [ ] `docker run picoclaw-test ls /app/skills/` shows all 14 skill directories (13 new + gog)
- [ ] `docker run picoclaw-test which blogwatcher` returns path
- [ ] `docker run picoclaw-test which summarize` returns path
- [ ] `docker run picoclaw-test which gh` returns path
- [ ] `docker run picoclaw-test which gog` returns path
- [ ] Container starts, gateway boots, skills load without errors in logs
- [ ] After container restart with same /data volume, gog auth tokens survive

### Must Have
- All 13 skills pre-packaged and copied on first boot
- CLI binaries: blogwatcher, summarize, gh, gog (existing)
- OAuth token persistence for gog across redeploys
- Medium RSS feeds pre-configured for user's tech stack
- Zero new API key requirements (only OpenAI + Gemini)
- Docker build completes successfully

### Must NOT Have (Guardrails)
- **NO trading execution** — Research/monitoring only
- **NO custom skill development** — Only pre-package existing ClawHub skills
- **NO picoclaw binary modifications** — Only Docker/config/skills changes
- **NO Tavily/Brave API dependencies** — User doesn't have these keys
- **NO Node.js build system** (package.json, webpack, vite) — Frontend stays CDN-only
- **NO UI changes** — No skills management UI (filesystem-based only)
- **NO breaking changes** to existing gog skill or config.json schema
- **NO over-engineering** — This is a deploy template, keep it simple

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO (no formal test suite)
- **Automated tests**: None — This is a Docker deployment template, not a library
- **Framework**: N/A
- **Primary verification**: Docker build + run + log inspection + CLI checks

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Docker build**: Use Bash — `docker build`, check exit code
- **CLI binaries**: Use Bash — `docker run ... which <binary>`, check output
- **Skills presence**: Use Bash — `docker run ... ls /app/skills/`, verify directories
- **Gateway startup**: Use Bash — `docker run -d ...`, wait, check logs for errors
- **OAuth persistence**: Use Bash — run container, create token, restart, verify token exists

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — research + skill downloads):
├── Task 1: Research CLI deps & gog token path [deep]
├── Task 3: Download & validate all 13 skills from ClawHub API [unspecified-high]
└── Task 7: Pre-configure blogwatcher Medium RSS feeds [quick]

Wave 2 (After Wave 1 — Dockerfile + dependency setup):
├── Task 2: Update Dockerfile with CLI binaries [deep]
├── Task 5: Install Python dependencies for skills [quick]
├── Task 6: Install Node.js dependencies for skills [quick]
└── Task 8: Add 13 skill directories to skills/ [quick]

Wave 3 (After Wave 2 — persistence fix + integration):
├── Task 4: Fix gog OAuth token persistence [deep]
└── Task 9: Update start.sh for new skills bootstrap [quick]

Wave 4 (After Wave 3 — verification):
├── Task 10: Docker build + full integration test [deep]

Wave FINAL (After ALL tasks — independent review, 4 parallel):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 2 → Task 4 → Task 10 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 3 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 (Research) | — | 2, 4 | 1 |
| 3 (Download skills) | — | 8 | 1 |
| 7 (RSS feeds) | — | 8 | 1 |
| 2 (Dockerfile CLIs) | 1 | 5, 6, 10 | 2 |
| 5 (Python deps) | 2 | 10 | 2 |
| 6 (Node deps) | 2 | 10 | 2 |
| 8 (Add skill dirs) | 3, 7 | 9, 10 | 2 |
| 4 (OAuth fix) | 1 | 9, 10 | 3 |
| 9 (start.sh update) | 4, 8 | 10 | 3 |
| 10 (Integration test) | 2, 5, 6, 8, 9 | F1-F4 | 4 |
| F1-F4 (Final review) | 10 | — | FINAL |

### Agent Dispatch Summary

- **Wave 1**: **3** — T1 → `deep`, T3 → `unspecified-high`, T7 → `quick`
- **Wave 2**: **4** — T2 → `deep` + `docker-compose`, T5 → `quick`, T6 → `quick`, T8 → `quick`
- **Wave 3**: **2** — T4 → `deep`, T9 → `quick`
- **Wave 4**: **1** — T10 → `deep`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Research & Validate CLI Dependencies and Gog Token Path

  **What to do**:
  - Verify gog OAuth token storage location by examining the gogcli source code on GitHub (`github.com/steipete/gogcli`)
  - Confirm that gog uses `~/.config/gogcli/` for keyring file backend (research found this — validate it)
  - Confirm the keyring environment variables: `GOG_KEYRING_BACKEND=file` and `GOG_KEYRING_PASSWORD=<value>`
  - Verify blogwatcher installation: `go install github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest` — confirm this is the correct import path by checking GitHub repo
  - Verify summarize installation: `npm install -g @steipete/summarize` — confirm package exists on npm
  - Verify gh CLI: confirm `gh` is in Debian Bookworm repos via `apt-get install gh`
  - Document exact installation commands for each CLI binary
  - Test the ClawHub download API: `curl -I 'https://wry-manatee-359.convex.site/api/v1/download?slug=web-search'` — confirm returns ZIP

  **Must NOT do**:
  - Do not install anything — research only
  - Do not modify any project files

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Requires multi-source investigation (GitHub repos, npm registry, Debian packages, API testing)
  - **Skills**: []
    - No special skills needed — standard web research and CLI verification
  - **Skills Evaluated but Omitted**:
    - `docker-compose`: Not needed — no Docker execution in this task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3, 7)
  - **Blocks**: Tasks 2, 4
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References**:
  - `Dockerfile:12` — Current `go install github.com/steipete/gogcli/cmd/gog@latest` pattern to replicate for blogwatcher
  - `Dockerfile:14-18` — Current apt-get install pattern to extend with `gh`, `nodejs`, `npm`
  - `Dockerfile:21` — Current `COPY --from=builder /go/bin/gog /usr/local/bin/gog` pattern for new Go binaries
  - `Dockerfile:34` — `ENV HOME=/data` — explains why `~/.config/gogcli/` maps to `/data/.config/gogcli/`

  **External References**:
  - gogcli GitHub: `https://github.com/steipete/gogcli` — Source code to verify token storage path
  - blogwatcher GitHub: `https://github.com/Hyaxia/blogwatcher` — Verify Go import path and installation
  - summarize website: `https://summarize.sh` — Verify CLI installation method
  - npm registry: `https://www.npmjs.com/package/@steipete/summarize` — Verify npm package exists
  - ClawHub download API: `https://wry-manatee-359.convex.site/api/v1/download?slug=web-search` — Test endpoint

  **WHY Each Reference Matters**:
  - Dockerfile patterns: The executor must understand the exact multi-stage build structure to know WHERE to add new commands
  - gogcli source: Must verify the keyring backend config before Task 4 relies on it
  - GitHub repos: Must confirm exact `go install` paths — wrong paths = build failure

  **Acceptance Criteria**:
  - [ ] Document confirming gog token storage path (exact directory)
  - [ ] Document confirming keyring env vars (`GOG_KEYRING_BACKEND`, `GOG_KEYRING_PASSWORD`)
  - [ ] Verified blogwatcher Go import path (confirmed via GitHub repo)
  - [ ] Verified summarize npm package name (confirmed via npm registry)
  - [ ] Verified gh available in apt repos
  - [ ] ClawHub API test: confirmed ZIP response with correct headers

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Verify gogcli keyring configuration docs
    Tool: Bash (curl/webfetch)
    Preconditions: Internet access
    Steps:
      1. Fetch https://github.com/steipete/gogcli — look for keyring/config references in README or source
      2. Search for `GOG_KEYRING` or `keyring` in the repository
      3. Document the exact env var names and token storage directory
    Expected Result: Clear documentation of token path and env vars
    Failure Indicators: No keyring configuration found — escalate to manual investigation
    Evidence: .sisyphus/evidence/task-1-gog-keyring-research.md

  Scenario: Verify blogwatcher Go import path
    Tool: Bash (curl)
    Preconditions: Internet access
    Steps:
      1. Fetch https://api.github.com/repos/Hyaxia/blogwatcher/contents/cmd — verify cmd/blogwatcher exists
      2. Check go.mod for module path
    Expected Result: Confirmed import path for `go install`
    Failure Indicators: 404 or different module path — adjust installation command
    Evidence: .sisyphus/evidence/task-1-blogwatcher-path.md

  Scenario: Verify ClawHub download API
    Tool: Bash (curl)
    Preconditions: Internet access
    Steps:
      1. Run: curl -sI 'https://wry-manatee-359.convex.site/api/v1/download?slug=web-search'
      2. Check Content-Type header contains 'application/zip'
      3. Check HTTP status is 200
    Expected Result: HTTP 200, Content-Type: application/zip
    Failure Indicators: Non-200 status or non-ZIP content type
    Evidence: .sisyphus/evidence/task-1-clawhub-api-test.md
  ```

  **Commit**: NO (research only, no file changes)

- [x] 2. Update Dockerfile with CLI Binaries and System Dependencies

  **What to do**:
  - Add blogwatcher Go binary to builder stage: `RUN go install github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest`
  - Copy blogwatcher binary to final stage: `COPY --from=builder /go/bin/blogwatcher /usr/local/bin/blogwatcher`
  - Add Node.js and npm to apt-get install: extend line 17 with `nodejs npm`
  - Add gh (GitHub CLI) to apt-get install: extend line 17 with `gh`
  - Install summarize CLI globally: `RUN npm install -g @steipete/summarize`
  - Add gog keyring persistence env vars: `ENV GOG_KEYRING_BACKEND=file` and `ENV GOG_KEYRING_PASSWORD=picoclaw_default_keyring_secret`
  - Verify the Dockerfile still builds successfully
  - Keep the 2-stage build pattern intact — do not refactor the build stages

  **Must NOT do**:
  - Do not change the Go builder base image or version
  - Do not remove existing binaries (picoclaw, gog)
  - Do not modify the Python installation or requirements.txt in this task
  - Do not add `package.json` — use global npm install only

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Dockerfile modification with multi-stage build requires careful understanding of build context and layer caching
  - **Skills**: [`docker-compose`]
    - `docker-compose`: Docker best practices for multi-stage builds, layer optimization, and dependency management
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — no browser interaction

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential dependency on Task 1)
  - **Blocks**: Tasks 5, 6, 10
  - **Blocked By**: Task 1

  **References** (CRITICAL):

  **Pattern References**:
  - `Dockerfile:1-13` — Builder stage: Go build + go install pattern for adding blogwatcher
  - `Dockerfile:14-22` — Final stage: apt-get + COPY --from=builder pattern for adding CLIs
  - `Dockerfile:34-35` — ENV vars section for adding GOG_KEYRING_* variables
  - `Dockerfile:16-18` — apt-get install list to extend with nodejs, npm, gh

  **External References**:
  - Task 1 evidence: `.sisyphus/evidence/task-1-*.md` — Verified installation commands
  - Debian packages: nodejs, npm available in bookworm-slim repos
  - GitHub CLI: `gh` package in Debian repos

  **WHY Each Reference Matters**:
  - Dockerfile:1-13: Must add `go install` for blogwatcher in SAME builder stage, before the `FROM` switch
  - Dockerfile:14-22: Must extend apt-get and add COPY commands in the correct order
  - Dockerfile:34-35: ENV vars must be set BEFORE CMD to be available at runtime

  **Acceptance Criteria**:
  - [ ] Dockerfile contains `go install` for blogwatcher in builder stage
  - [ ] Dockerfile contains `COPY --from=builder /go/bin/blogwatcher /usr/local/bin/blogwatcher`
  - [ ] Dockerfile apt-get includes nodejs, npm, gh
  - [ ] Dockerfile contains `RUN npm install -g @steipete/summarize`
  - [ ] Dockerfile contains `ENV GOG_KEYRING_BACKEND=file`
  - [ ] Dockerfile contains `ENV GOG_KEYRING_PASSWORD=...`
  - [ ] `docker build -t picoclaw-test .` completes successfully (exit code 0)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Docker build succeeds with new CLIs
    Tool: Bash
    Preconditions: Docker daemon running, internet access
    Steps:
      1. Run: docker build -t picoclaw-test .
      2. Check exit code is 0
      3. Run: docker run --rm picoclaw-test which blogwatcher
      4. Run: docker run --rm picoclaw-test which summarize
      5. Run: docker run --rm picoclaw-test which gh
      6. Run: docker run --rm picoclaw-test which gog
    Expected Result: All four `which` commands return paths in /usr/local/bin/ or /usr/bin/
    Failure Indicators: Build fails, any `which` returns empty/error
    Evidence: .sisyphus/evidence/task-2-docker-build.log

  Scenario: GOG keyring env vars present in container
    Tool: Bash
    Preconditions: Docker image built from previous scenario
    Steps:
      1. Run: docker run --rm picoclaw-test env | grep GOG_KEYRING
      2. Verify GOG_KEYRING_BACKEND=file is present
      3. Verify GOG_KEYRING_PASSWORD is present and non-empty
    Expected Result: Both env vars are set in the container environment
    Failure Indicators: Missing env vars or empty values
    Evidence: .sisyphus/evidence/task-2-gog-env-vars.log
  ```

  **Commit**: YES
  - Message: `feat(docker): add CLI binaries for blogwatcher, summarize, gh + gog keyring persistence`
  - Files: `Dockerfile`
  - Pre-commit: `docker build -t picoclaw-test .`

- [x] 3. Download and Package All 13 Skills from ClawHub API

  **What to do**:
  - For each of the 13 skills, download the ZIP from ClawHub API:
    ```
    curl -L -o /tmp/<slug>.zip 'https://wry-manatee-359.convex.site/api/v1/download?slug=<slug>'
    ```
  - Extract each ZIP to `skills/<slug>/` directory
  - Verify each extracted directory contains at minimum: `SKILL.md` and `_meta.json`
  - Skills to download (exact slugs):
    1. `blogwatcher`
    2. `summarize`
    3. `news-aggregator-skill`
    4. `stock-analysis`
    5. `crypto-market-data`
    6. `finance-news`
    7. `gemini-deep-research`
    8. `reddit-insights`
    9. `web-search`
    10. `find-skills`
    11. `self-improving-agent`
    12. `github`
    13. `x-research`
  - After extraction, verify file structure matches the gog reference pattern:
    - `skills/<slug>/SKILL.md` — must have YAML frontmatter with name, description
    - `skills/<slug>/_meta.json` — must have slug, version fields
  - Some skills may include additional files (Python scripts, package.json, etc.) — preserve all

  **Must NOT do**:
  - Do not modify any downloaded skill files
  - Do not create custom _meta.json files — use what's in the ZIP
  - Do not remove the existing `skills/gog/` directory

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Repetitive but important task requiring careful validation of 13 downloads
  - **Skills**: []
    - No special skills needed — curl + unzip operations
  - **Skills Evaluated but Omitted**:
    - `docker-compose`: Not relevant — no Docker operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 7)
  - **Blocks**: Task 8
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References**:
  - `skills/gog/SKILL.md` — Reference skill file structure (YAML frontmatter format, metadata JSON)
  - `skills/gog/_meta.json` — Reference metadata format: `{ownerId, slug, version, publishedAt}`

  **External References**:
  - ClawHub API: `https://wry-manatee-359.convex.site/api/v1/download?slug=<slug>` — Returns ZIP files
  - Validated: API returns `application/zip` with standard PK archives (confirmed by research)

  **WHY Each Reference Matters**:
  - `skills/gog/` is the golden reference — every new skill must match this structure
  - The API is confirmed to return ZIPs — executor can rely on `unzip` extraction

  **Acceptance Criteria**:
  - [ ] All 13 skill directories created under `skills/`
  - [ ] Each directory contains at minimum `SKILL.md` and `_meta.json`
  - [ ] `ls skills/` shows 14 directories (13 new + gog)
  - [ ] No empty directories
  - [ ] Existing `skills/gog/` untouched

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All 13 skills downloaded and extracted
    Tool: Bash
    Preconditions: Internet access, `curl` and `unzip` available
    Steps:
      1. For each slug in [blogwatcher, summarize, news-aggregator-skill, stock-analysis, crypto-market-data, finance-news, gemini-deep-research, reddit-insights, web-search, find-skills, self-improving-agent, github, x-research]:
         a. Run: curl -sL -o /tmp/${slug}.zip 'https://wry-manatee-359.convex.site/api/v1/download?slug=${slug}'
         b. Run: file /tmp/${slug}.zip — verify contains 'Zip archive'
         c. Run: unzip -o /tmp/${slug}.zip -d skills/${slug}/
         d. Run: ls skills/${slug}/SKILL.md — verify exists
         e. Run: ls skills/${slug}/_meta.json — verify exists
      2. Run: ls -d skills/*/ | wc -l
    Expected Result: 14 directories, each containing SKILL.md and _meta.json
    Failure Indicators: curl returns non-200, file is not a ZIP, SKILL.md or _meta.json missing
    Evidence: .sisyphus/evidence/task-3-skill-download-report.md

  Scenario: Existing gog skill untouched
    Tool: Bash
    Preconditions: Task completed
    Steps:
      1. Run: git diff skills/gog/
      2. Verify no changes to existing gog files
    Expected Result: Empty diff output
    Failure Indicators: Any modifications to skills/gog/ files
    Evidence: .sisyphus/evidence/task-3-gog-unchanged.log
  ```

  **Commit**: YES (groups with Task 8)
  - Message: `feat(skills): add 13 curated ClawHub skills`
  - Files: `skills/*/SKILL.md`, `skills/*/_meta.json`, `skills/*/` (all skill files)
  - Pre-commit: `ls -d skills/*/ | wc -l` (expect 14)


- [x] 4. Fix Gog OAuth Token Persistence Across Redeploys

  **What to do**:
  - Based on Task 1 research findings, implement the OAuth token persistence fix
  - PRIMARY APPROACH: Add environment variables to Dockerfile (already done in Task 2):
    - `ENV GOG_KEYRING_BACKEND=file`
    - `ENV GOG_KEYRING_PASSWORD=picoclaw_default_keyring_secret`
  - VERIFICATION: Since `HOME=/data` is already set, `~/.config/gogcli/` resolves to `/data/.config/gogcli/` which IS on the persistent volume
  - In `start.sh`, add a directory creation to ensure the config path exists on first boot:
    ```bash
    mkdir -p /data/.config/gogcli
    ```
  - If Task 1 reveals a DIFFERENT token path (not `~/.config/gogcli/`), adapt accordingly:
    - Option A: If tokens are in a non-$HOME path, add a symlink in start.sh pointing to /data/
    - Option B: If an env var redirects the path, add it to Dockerfile ENV section
  - Test: After container starts with persistent volume, run `gog auth list` — it should retain any configured accounts across restart

  **Must NOT do**:
  - Do not store actual OAuth credentials in Dockerfile or source code
  - Do not hardcode Google client secrets
  - Do not change `HOME=/data` — it's working correctly for persistence
  - Do not break the existing gog skill functionality

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Requires understanding of keyring backends, file-based token storage, and container lifecycle
  - **Skills**: []
    - No special skills needed — shell scripting and Docker environment
  - **Skills Evaluated but Omitted**:
    - `docker-compose`: Already handled in Task 2's Dockerfile modifications

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Task 1 (needs research results)

  **References** (CRITICAL):

  **Pattern References**:
  - `start.sh:4-7` — Current `mkdir -p` pattern for creating persistent directories on boot
  - `Dockerfile:34` — `ENV HOME=/data` — gog's `~/.config/gogcli/` resolves to `/data/.config/gogcli/`
  - `Dockerfile:26` — `RUN mkdir -p /data/.picoclaw` — pattern for creating persistent dirs in build

  **API/Type References**:
  - `skills/gog/SKILL.md:13-14` — Gog auth setup commands: `gog auth credentials`, `gog auth add`
  - Task 1 evidence: `.sisyphus/evidence/task-1-gog-keyring-research.md` — Verified token storage location

  **External References**:
  - gogcli GitHub: `https://github.com/steipete/gogcli` — keyring backend documentation

  **WHY Each Reference Matters**:
  - start.sh patterns: Must follow existing bootstrap convention for directory creation
  - HOME=/data: This is WHY the fix should work — all $HOME-relative paths already point to persistent volume
  - gog auth commands: Executor needs to know how users authenticate to test the fix

  **Acceptance Criteria**:
  - [ ] `start.sh` creates `/data/.config/gogcli` directory on boot
  - [ ] Dockerfile contains `GOG_KEYRING_BACKEND=file` env var
  - [ ] Dockerfile contains `GOG_KEYRING_PASSWORD` env var with a default value
  - [ ] Container restart preserves files in `/data/.config/gogcli/`

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Token directory persists across container restart
    Tool: Bash
    Preconditions: Docker image built with GOG_KEYRING_* env vars (Task 2)
    Steps:
      1. Run: docker run -d --name gog-test -v $(pwd)/.tmpdata:/data -e PORT=8080 -e ADMIN_PASSWORD=test picoclaw-test
      2. Run: docker exec gog-test ls -la /data/.config/gogcli/ — verify directory exists
      3. Run: docker exec gog-test touch /data/.config/gogcli/test-token-file
      4. Run: docker stop gog-test && docker rm gog-test
      5. Run: docker run --rm -v $(pwd)/.tmpdata:/data picoclaw-test ls /data/.config/gogcli/test-token-file
    Expected Result: test-token-file exists after container recreation
    Failure Indicators: File not found or directory missing
    Evidence: .sisyphus/evidence/task-4-oauth-persistence.log

  Scenario: GOG keyring env vars configured correctly
    Tool: Bash
    Preconditions: Docker image built
    Steps:
      1. Run: docker run --rm picoclaw-test env | grep GOG_KEYRING_BACKEND
      2. Verify output is 'GOG_KEYRING_BACKEND=file'
      3. Run: docker run --rm picoclaw-test env | grep GOG_KEYRING_PASSWORD
      4. Verify output shows a non-empty password value
    Expected Result: Both env vars set correctly
    Failure Indicators: Missing or empty values
    Evidence: .sisyphus/evidence/task-4-keyring-env.log
  ```

  **Commit**: YES (groups with Task 9)
  - Message: `fix(persistence): ensure gog OAuth tokens survive redeploys`
  - Files: `start.sh`
  - Pre-commit: `docker build -t picoclaw-test . && docker run --rm picoclaw-test env | grep GOG_KEYRING`

- [x] 5. Install Python Dependencies for Skills

  **What to do**:
  - Identify which skills need Python packages installed at the system level:
    - `stock-analysis`: Requires `yfinance` and related packages — check `skills/stock-analysis/` for requirements.txt or similar after Task 3 downloads it
    - `news-aggregator-skill`: Requires Python packages for web scraping — check skill directory for dependency list
  - Add Python dependencies to Dockerfile using the existing `uv pip install` pattern:
    ```dockerfile
    # After the existing requirements.txt install
    RUN uv pip install --system --no-cache yfinance <other-deps>
    ```
  - OR, if skills include their own requirements.txt, install those:
    ```dockerfile
    COPY skills/stock-analysis/requirements.txt /tmp/stock-requirements.txt
    RUN uv pip install --system --no-cache -r /tmp/stock-requirements.txt
    ```
  - Only install packages that are NOT already in the base image

  **Must NOT do**:
  - Do not install packages that aren't required by the 13 skills
  - Do not remove existing Python dependencies
  - Do not change the `uv pip install` pattern — keep using uv

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward pip install additions to Dockerfile
  - **Skills**: [`docker-compose`]
    - `docker-compose`: Docker layer optimization for pip installs
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — no browser interaction

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 6, 8)
  - **Blocks**: Task 10
  - **Blocked By**: Task 2 (Dockerfile base must be ready), Task 3 (need skill files to check deps)

  **References** (CRITICAL):

  **Pattern References**:
  - `Dockerfile:23-24` — Current `uv pip install` pattern: `COPY requirements.txt` then `RUN uv pip install --system --no-cache -r`
  - `requirements.txt` — Current Python dependencies (Starlette, Uvicorn, Jinja2, python-multipart)

  **API/Type References**:
  - After Task 3: `skills/stock-analysis/` — Check for requirements.txt or imports in Python files
  - After Task 3: `skills/news-aggregator-skill/` — Check for fetch_news.py requirements

  **WHY Each Reference Matters**:
  - Dockerfile:23-24: Must use the SAME `uv pip install --system --no-cache` pattern for consistency
  - Skill directories: Need to inspect downloaded skills to identify actual Python deps

  **Acceptance Criteria**:
  - [ ] All Python dependencies for stock-analysis are installable
  - [ ] All Python dependencies for news-aggregator-skill are installable
  - [ ] `docker build` succeeds after adding Python deps
  - [ ] No dependency conflicts with existing packages

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Python skill dependencies installed successfully
    Tool: Bash
    Preconditions: Docker image built with Python deps added
    Steps:
      1. Run: docker run --rm picoclaw-test python -c 'import yfinance; print(yfinance.__version__)'
      2. Verify import succeeds and version is printed
      3. Run: docker run --rm picoclaw-test python -c 'import requests; print("ok")'
      4. Verify requests module available (commonly needed by news skills)
    Expected Result: All imports succeed without ImportError
    Failure Indicators: ImportError or ModuleNotFoundError
    Evidence: .sisyphus/evidence/task-5-python-deps.log

  Scenario: No dependency conflicts
    Tool: Bash
    Preconditions: Docker image built
    Steps:
      1. Run: docker run --rm picoclaw-test python -c 'import starlette; print(starlette.__version__)'
      2. Verify existing starlette still works (no conflict)
    Expected Result: Existing packages unaffected
    Failure Indicators: ImportError or version mismatch
    Evidence: .sisyphus/evidence/task-5-no-conflicts.log
  ```

  **Commit**: YES (groups with Task 6)
  - Message: `feat(docker): add Python and Node.js skill dependencies`
  - Files: `Dockerfile`
  - Pre-commit: `docker build -t picoclaw-test .`

- [ ] 6. Install Node.js Dependencies for Skills

  **What to do**:
  - Identify which skills need Node.js packages:
    - `crypto-market-data`: Node.js-based skill with zero external deps (confirmed by research) — but needs the Node.js runtime itself (already added in Task 2 via apt-get)
    - Check if any other downloaded skills have `package.json` files
  - If `crypto-market-data` has a `package.json`, install its deps:
    ```dockerfile
    COPY skills/crypto-market-data/package.json /tmp/crypto-package.json
    RUN cd /tmp && npm install --production
    ```
  - OR, if the skill is self-contained with no external npm deps (research says 'zero external dependencies'), just verify Node.js runtime is available
  - Check all 13 skill directories for package.json files and install any found deps

  **Must NOT do**:
  - Do not add a project-level package.json to the root (CDN-only frontend rule)
  - Do not install dev dependencies (--production only)
  - Do not modify the frontend (templates/index.html)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Likely minimal work — crypto-market-data has zero external deps, just needs runtime
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `docker-compose`: Overkill for a simple npm check

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 5, 8)
  - **Blocks**: Task 10
  - **Blocked By**: Task 2 (needs nodejs in image), Task 3 (need skill files to check deps)

  **References** (CRITICAL):

  **Pattern References**:
  - `Dockerfile:16-18` — apt-get section where nodejs/npm were added (Task 2)
  - After Task 3: `skills/crypto-market-data/package.json` — Check if external deps needed

  **WHY Each Reference Matters**:
  - Must verify Node.js runtime is sufficient for crypto-market-data skill
  - If package.json has deps, must install them in Docker build

  **Acceptance Criteria**:
  - [ ] Node.js runtime available: `docker run --rm picoclaw-test node --version`
  - [ ] All skills with package.json have their dependencies installed
  - [ ] `docker build` succeeds

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Node.js runtime available for skills
    Tool: Bash
    Preconditions: Docker image built with nodejs (Task 2)
    Steps:
      1. Run: docker run --rm picoclaw-test node --version
      2. Verify output shows Node.js version (e.g., v18.x or v20.x)
      3. Run: docker run --rm picoclaw-test npm --version
      4. Verify npm is available
    Expected Result: Node.js and npm both available
    Failure Indicators: Command not found
    Evidence: .sisyphus/evidence/task-6-node-runtime.log

  Scenario: crypto-market-data skill files executable
    Tool: Bash
    Preconditions: Skills downloaded (Task 3), Node.js available
    Steps:
      1. Run: docker run --rm picoclaw-test ls skills/crypto-market-data/
      2. Verify .js files present
      3. If package.json exists: docker run --rm picoclaw-test node -e 'require("/app/skills/crypto-market-data/index.js")' or similar
    Expected Result: Skill files present and loadable
    Failure Indicators: Missing files or require() errors
    Evidence: .sisyphus/evidence/task-6-crypto-skill.log
  ```

  **Commit**: YES (groups with Task 5)
  - Message: `feat(docker): add Python and Node.js skill dependencies`
  - Files: `Dockerfile`
  - Pre-commit: `docker build -t picoclaw-test .`

- [x] 7. Pre-configure Blogwatcher Medium RSS Feeds

  **What to do**:
  - After Task 3 downloads the blogwatcher skill, inspect its SKILL.md for configuration instructions
  - Create or update blogwatcher configuration to include Medium RSS feeds for user's tech stack:
    ```
    https://medium.com/feed/tag/python
    https://medium.com/feed/tag/typescript
    https://medium.com/feed/tag/reactjs
    https://medium.com/feed/tag/nextjs
    https://medium.com/feed/tag/golang
    https://medium.com/feed/tag/docker
    https://medium.com/feed/tag/kubernetes
    https://medium.com/feed/tag/artificial-intelligence
    https://medium.com/feed/tag/llm
    https://medium.com/feed/tag/devops
    https://medium.com/feed/tag/react-native
    https://medium.com/feed/tag/indie-hacker
    ```
  - The configuration approach depends on how blogwatcher stores feed lists:
    - Option A: If blogwatcher uses a config file (e.g., `blogwatcher.yaml`, `feeds.txt`), create it in the skill directory or a config location on /data
    - Option B: If blogwatcher feeds are configured via PicoClaw's SKILL.md instructions, update the SKILL.md to include pre-configured feed examples
    - Option C: If blogwatcher requires CLI commands to add feeds, document the commands in SKILL.md and add them to start.sh as a first-boot setup
  - IMPORTANT: Check the downloaded blogwatcher SKILL.md first to understand the expected config pattern

  **Must NOT do**:
  - Do not hardcode API keys in configuration files
  - Do not modify the blogwatcher SKILL.md's core instructions — only add pre-configured feeds
  - Do not add feeds for topics outside user's confirmed tech stack

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple configuration file creation based on a known list of URLs
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `docker-compose`: Not relevant — config file only

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 8
  - **Blocked By**: None (can start immediately — RSS URLs are known, feed config structure can be prepared)

  **References** (CRITICAL):

  **Pattern References**:
  - After Task 3: `skills/blogwatcher/SKILL.md` — Blogwatcher configuration instructions and feed format
  - `skills/gog/SKILL.md:10-15` — Example of skill setup instructions pattern

  **External References**:
  - Blogwatcher GitHub: `https://github.com/Hyaxia/blogwatcher` — Configuration file format documentation
  - Medium RSS feed pattern: `https://medium.com/feed/tag/<tag-name>` — Confirmed working pattern

  **WHY Each Reference Matters**:
  - blogwatcher SKILL.md: Must understand how feeds are configured to place them correctly
  - Medium RSS pattern: These are the exact URLs to pre-configure

  **Acceptance Criteria**:
  - [ ] All 12 Medium RSS feed URLs are present in the configuration
  - [ ] Feed configuration is in a location that persists across redeploys (on /data volume)
  - [ ] Blogwatcher skill can read the pre-configured feeds

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: RSS feeds configured and readable
    Tool: Bash
    Preconditions: Blogwatcher skill downloaded (Task 3)
    Steps:
      1. Check blogwatcher SKILL.md for configuration instructions
      2. Create/update feed configuration with all 12 Medium RSS URLs
      3. Verify: grep -c 'medium.com/feed/tag' <config-file> returns 12
    Expected Result: 12 Medium RSS feeds present in configuration
    Failure Indicators: Missing feeds or incorrect URLs
    Evidence: .sisyphus/evidence/task-7-rss-feeds.md

  Scenario: Feed URLs are valid and accessible
    Tool: Bash
    Preconditions: Internet access
    Steps:
      1. Run: curl -sI 'https://medium.com/feed/tag/python' | head -1
      2. Verify HTTP 200 response
      3. Repeat for 2-3 other feed URLs (typescript, golang)
    Expected Result: All tested feeds return HTTP 200
    Failure Indicators: 404 or redirect to non-RSS content
    Evidence: .sisyphus/evidence/task-7-feed-validation.log
  ```

  **Commit**: YES
  - Message: `feat(config): pre-configure Medium RSS feeds for blogwatcher`
  - Files: blogwatcher config file(s)
  - Pre-commit: Feed URL count verification

- [x] 8. Verify and Organize All 13 Skill Directories

  **What to do**:
  - After Task 3 downloads all skills and Task 7 configures RSS feeds:
    - Verify all 14 skill directories are present: `ls -d skills/*/`
    - Verify each directory has SKILL.md and _meta.json as minimum files
    - Verify the Dockerfile's `COPY skills/ /app/skills/` will capture everything (line 30)
    - Check for any skills that include additional files (Python scripts, JS files, config) and ensure they're properly structured
  - Create a summary of what's in each skill directory for documentation
  - Verify no skill directories are accidentally nested (e.g., `skills/web-search/web-search/`)

  **Must NOT do**:
  - Do not modify any skill files
  - Do not remove any files from skill directories
  - Do not reorganize skill directory structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task — listing and checking directories
  - **Skills**: []
  - **Skills Evaluated but Omitted**: None relevant

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Tasks 3, 7)
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Tasks 3, 7

  **References** (CRITICAL):

  **Pattern References**:
  - `skills/gog/` — Reference directory structure (SKILL.md + _meta.json)
  - `Dockerfile:30` — `COPY skills/ /app/skills/` — must capture all skill directories

  **WHY Each Reference Matters**:
  - `COPY skills/` in Dockerfile copies the entire directory — any new subdirectories automatically included
  - gog reference ensures consistent structure validation

  **Acceptance Criteria**:
  - [ ] `ls -d skills/*/ | wc -l` returns 14
  - [ ] Every skill directory has SKILL.md
  - [ ] Every skill directory has _meta.json
  - [ ] No nested/duplicate directories

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All 14 skill directories properly structured
    Tool: Bash
    Preconditions: Tasks 3 and 7 complete
    Steps:
      1. Run: ls -d skills/*/ | wc -l
      2. Verify count is 14
      3. Run: for d in skills/*/; do echo "$d: $(ls $d | tr '\n' ', ')"; done
      4. Verify every directory has at minimum SKILL.md and _meta.json
      5. Run: find skills -maxdepth 2 -name 'SKILL.md' | wc -l
      6. Verify count is 14
    Expected Result: 14 directories, each with SKILL.md and _meta.json
    Failure Indicators: Missing directories, missing files, nested directories
    Evidence: .sisyphus/evidence/task-8-skill-inventory.md
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `feat(skills): add 13 curated ClawHub skills`
  - Files: All `skills/*/` directories
  - Pre-commit: `ls -d skills/*/ | wc -l` (expect 14)

- [x] 9. Update start.sh for New Skills and OAuth Bootstrap

  **What to do**:
  - Add OAuth persistence directory creation to start.sh (before the skill copy):
    ```bash
    # Ensure gog OAuth token directory exists on persistent volume
    mkdir -p /data/.config/gogcli
    ```
  - Verify the existing `cp -rn /app/skills/* /data/.picoclaw/workspace/skills/` still works for all 14 skills
  - The `-rn` flag means:
    - `-r`: recursive copy
    - `-n`: no clobber (don't overwrite existing files)
  - This means skills are copied on FIRST boot only. Subsequent boots preserve any runtime changes.
  - Consider: Should we add a mechanism to update skills on redeploy? (If new Docker image has newer versions)
    - DECISION: Keep `-rn` behavior. Users who want updates can delete specific skill dirs from /data/ to get fresh copies.
  - Add a log line to indicate successful skill bootstrap:
    ```bash
    echo "Bootstrapped $(ls -d /data/.picoclaw/workspace/skills/*/ 2>/dev/null | wc -l) skills"
    ```

  **Must NOT do**:
  - Do not change the `-rn` flag behavior — preserve existing skills
  - Do not add complex logic to start.sh — keep it simple
  - Do not modify config.json in start.sh
  - Do not add network-dependent operations to start.sh (no curl/wget)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple shell script additions — 2-3 lines
  - **Skills**: []
  - **Skills Evaluated but Omitted**: None relevant

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 4, 8

  **References** (CRITICAL):

  **Pattern References**:
  - `start.sh:1-16` — Full current script (only 16 lines) — understand complete flow before modifying
  - `start.sh:4-7` — Existing `mkdir -p` pattern for persistent directories
  - `start.sh:8-10` — Skill copy mechanism: `cp -rn /app/skills/* /data/.picoclaw/workspace/skills/`

  **WHY Each Reference Matters**:
  - start.sh is only 16 lines — executor should read the entire file to understand context
  - mkdir pattern: Must add gogcli dir creation BEFORE the skill copy section
  - cp -rn: Understanding this flag is critical — skills won't overwrite existing ones

  **Acceptance Criteria**:
  - [ ] start.sh creates `/data/.config/gogcli` directory
  - [ ] start.sh logs skill count on boot
  - [ ] Existing `cp -rn` behavior preserved
  - [ ] Script runs without errors on fresh container

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: start.sh creates OAuth directory and bootstraps skills
    Tool: Bash
    Preconditions: Docker image built with all changes
    Steps:
      1. Clean test volume: rm -rf .tmpdata
      2. Run: docker run --rm -v $(pwd)/.tmpdata:/data -e PORT=8080 -e ADMIN_PASSWORD=test picoclaw-test /bin/bash -c '/app/start.sh &; sleep 5; ls /data/.config/gogcli/ && ls -d /data/.picoclaw/workspace/skills/*/'
      3. Verify /data/.config/gogcli/ directory exists
      4. Verify all 14 skill directories are in /data/.picoclaw/workspace/skills/
    Expected Result: OAuth dir exists, 14 skills bootstrapped
    Failure Indicators: Missing directory or fewer than 14 skills
    Evidence: .sisyphus/evidence/task-9-bootstrap.log

  Scenario: Existing skills not overwritten on subsequent boot
    Tool: Bash
    Preconditions: Previous scenario completed (first boot done)
    Steps:
      1. Run: docker exec or new container with same volume
      2. Modify a skill file in /data: echo 'MODIFIED' >> /data/.picoclaw/workspace/skills/gog/SKILL.md
      3. Restart container with same volume
      4. Check: tail -1 /data/.picoclaw/workspace/skills/gog/SKILL.md
    Expected Result: 'MODIFIED' line still present (not overwritten by cp -rn)
    Failure Indicators: Modified file reverted to original
    Evidence: .sisyphus/evidence/task-9-no-overwrite.log
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `fix(persistence): ensure gog OAuth tokens survive redeploys`
  - Files: `start.sh`
  - Pre-commit: `bash -n start.sh` (syntax check)

- [ ] 10. Full Docker Build and Integration Test

  **What to do**:
  - Build the complete Docker image with ALL changes from Tasks 2-9:
    ```bash
    docker build -t picoclaw-test .
    ```
  - Run comprehensive integration tests:
    1. **Build verification**: Image builds without errors
    2. **CLI binaries**: All 4 binaries accessible (picoclaw, gog, blogwatcher, summarize, gh)
    3. **Skills presence**: All 14 skill directories in /app/skills/
    4. **Gateway startup**: Container starts, gateway boots, no skill loading errors in logs
    5. **Skill bootstrap**: Skills copied to /data/.picoclaw/workspace/skills/ on first boot
    6. **OAuth persistence**: Token directory created and survives restart
    7. **Python deps**: Key imports work (yfinance, etc.)
    8. **Node.js runtime**: `node --version` succeeds
  - Capture all evidence logs
  - Report image size: `docker images picoclaw-test --format '{{.Size}}'`

  **Must NOT do**:
  - Do not fix any issues found — report them for the relevant task owner to fix
  - Do not modify any source files
  - Do not push the image to any registry

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Comprehensive integration testing requiring Docker lifecycle management and log analysis
  - **Skills**: [`docker-compose`]
    - `docker-compose`: Docker runtime, container lifecycle, log inspection
  - **Skills Evaluated but Omitted**:
    - `playwright`: Could be used for web UI testing but gateway UI testing is out of scope

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final implementation verification)
  - **Blocks**: F1-F4 (Final Verification Wave)
  - **Blocked By**: Tasks 2, 5, 6, 8, 9 (all implementation tasks)

  **References** (CRITICAL):

  **Pattern References**:
  - `Dockerfile` — Complete file (all modifications from Tasks 2, 5, 6)
  - `start.sh` — Complete file (modifications from Tasks 4, 9)
  - `skills/` — All 14 skill directories (Tasks 3, 7, 8)
  - `README.md` — Docker run commands for local testing

  **External References**:
  - README.md local testing section — Docker run command with volume mount and env vars

  **WHY Each Reference Matters**:
  - This task validates EVERYTHING — it's the integration checkpoint before final review

  **Acceptance Criteria**:
  - [ ] `docker build` succeeds (exit code 0)
  - [ ] All 5 CLI binaries present: picoclaw, gog, blogwatcher, summarize, gh
  - [ ] All 14 skill directories in /app/skills/
  - [ ] Container starts without skill-related errors
  - [ ] Skills bootstrapped to /data/ on first boot
  - [ ] OAuth directory persists across restart
  - [ ] Python skill deps importable
  - [ ] Node.js runtime available
  - [ ] Image size reported

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Complete build and binary check
    Tool: Bash
    Preconditions: All implementation tasks (2-9) complete
    Steps:
      1. Run: docker build -t picoclaw-test . 2>&1 | tail -5
      2. Verify 'Successfully built' or 'Successfully tagged' in output
      3. Run: docker images picoclaw-test --format '{{.Size}}'
      4. Run: for bin in picoclaw gog blogwatcher summarize gh; do docker run --rm picoclaw-test which $bin; done
      5. Verify all 5 binaries found
    Expected Result: Build succeeds, all binaries present, image size reasonable (<2GB)
    Failure Indicators: Build failure, missing binaries, image >3GB
    Evidence: .sisyphus/evidence/task-10-build-report.log

  Scenario: Gateway boots with all skills
    Tool: Bash
    Preconditions: Docker image built
    Steps:
      1. Run: rm -rf .tmpdata && mkdir .tmpdata
      2. Run: docker run -d --name picoclaw-integ -p 8080:8080 -e PORT=8080 -e ADMIN_PASSWORD=test -v $(pwd)/.tmpdata:/data picoclaw-test
      3. Wait: sleep 15
      4. Run: docker logs picoclaw-integ 2>&1 | grep -i 'error'
      5. Run: docker exec picoclaw-integ ls -d /data/.picoclaw/workspace/skills/*/ | wc -l
      6. Verify 14 skill directories in persistent volume
      7. Run: curl -s -u admin:test http://localhost:8080/api/status | python -m json.tool
      8. Verify gateway status is running
    Expected Result: Gateway running, 14 skills, no errors in logs
    Failure Indicators: Gateway not starting, skill loading errors, fewer than 14 skills
    Evidence: .sisyphus/evidence/task-10-gateway-boot.log

  Scenario: OAuth persistence across restart
    Tool: Bash
    Preconditions: Gateway running from previous scenario
    Steps:
      1. Run: docker exec picoclaw-integ ls /data/.config/gogcli/
      2. Verify directory exists
      3. Run: docker exec picoclaw-integ touch /data/.config/gogcli/test-token
      4. Run: docker stop picoclaw-integ && docker rm picoclaw-integ
      5. Run: docker run --rm -v $(pwd)/.tmpdata:/data picoclaw-test ls /data/.config/gogcli/test-token
      6. Verify test-token file persists
    Expected Result: Token file survives container recreation
    Failure Indicators: File not found
    Evidence: .sisyphus/evidence/task-10-oauth-persist.log

  Scenario: Python and Node.js runtimes functional
    Tool: Bash
    Preconditions: Docker image built
    Steps:
      1. Run: docker run --rm picoclaw-test python --version
      2. Run: docker run --rm picoclaw-test node --version
      3. Run: docker run --rm picoclaw-test python -c 'import yfinance; print("yfinance OK")'
      4. Run: docker run --rm picoclaw-test summarize --help || docker run --rm picoclaw-test summarize --version
    Expected Result: Python 3.12.x, Node 18+, yfinance importable, summarize CLI responds
    Failure Indicators: Version mismatch or import errors
    Evidence: .sisyphus/evidence/task-10-runtimes.log
  ```

  **Commit**: NO (verification only, no file changes)


---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run docker command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Review all changed files (Dockerfile, start.sh, skill SKILL.md files) for: syntax errors, missing dependencies, incorrect paths, commented-out code, security issues (exposed secrets). Verify Dockerfile builds clean. Check start.sh for error handling.
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Build Docker image. Run container with test volume. Verify: all 14 skills present in /data/.picoclaw/workspace/skills/, all CLI binaries accessible, gateway starts without skill loading errors, gog token persistence works across container restart. Capture evidence screenshots/logs.
  Output: `Skills [14/14] | CLIs [4/4] | Gateway [PASS/FAIL] | OAuth [PASS/FAIL] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Commit 1** (after Task 8): `feat(skills): add 13 curated ClawHub skills` — skills/*/SKILL.md, skills/*/_meta.json
- **Commit 2** (after Task 2): `feat(docker): add CLI binaries for blogwatcher, summarize, gh` — Dockerfile
- **Commit 3** (after Tasks 5,6): `feat(docker): add Python and Node.js skill dependencies` — Dockerfile, requirements.txt (if needed)
- **Commit 4** (after Task 4,9): `fix(persistence): ensure gog OAuth tokens survive redeploys` — start.sh, Dockerfile (if needed)
- **Commit 5** (after Task 7): `feat(config): pre-configure Medium RSS feeds for blogwatcher` — skills/blogwatcher/ config files
- **Commit 6** (after Task 10): `chore: verify Docker build and integration` — .sisyphus/evidence/

---

## Success Criteria

### Verification Commands
```bash
# Build succeeds
docker build -t picoclaw-test .  # Expected: successful build, exit code 0

# All skills present
docker run --rm picoclaw-test ls /app/skills/  # Expected: 14 directories

# CLI binaries present
docker run --rm picoclaw-test which blogwatcher  # Expected: /usr/local/bin/blogwatcher
docker run --rm picoclaw-test which summarize    # Expected: /usr/local/bin/summarize
docker run --rm picoclaw-test which gh           # Expected: /usr/local/bin/gh
docker run --rm picoclaw-test which gog          # Expected: /usr/local/bin/gog

# Container starts and gateway boots
docker run --rm -d --name picoclaw-test -p 8080:8080 \
  -e PORT=8080 -e ADMIN_PASSWORD=test \
  -v $(pwd)/.tmpdata:/data picoclaw-test
sleep 10
docker logs picoclaw-test 2>&1 | grep -i error  # Expected: no skill-related errors

# Skills copied to persistent volume
docker exec picoclaw-test ls /data/.picoclaw/workspace/skills/  # Expected: 14 directories

# OAuth persistence (after initial auth setup)
docker restart picoclaw-test
docker exec picoclaw-test ls /data/.gog/ 2>/dev/null || \
docker exec picoclaw-test ls /data/.config/gog/ 2>/dev/null  # Expected: token files exist
```

### Final Checklist
- [ ] All 13 new skills present in skills/ directory
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Docker build succeeds
- [ ] Gateway starts without skill errors
- [ ] CLI binaries accessible
- [ ] OAuth tokens persist across container restart
