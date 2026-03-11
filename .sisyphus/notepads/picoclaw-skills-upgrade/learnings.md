
## Skill Download & Extraction (Task 3)

**Successfully downloaded and packaged all 13 skills from ClawHub API**

- **API Endpoint:** `https://wry-manatee-359.convex.site/api/v1/download?slug=<slug>`
- **Method:** Used `curl -L -o` to download ZIP files, then `unzip -q` to extract
- **Total Skills:** 14 (13 new + 1 existing `gog`)
- **Verification:** All skills contain required `SKILL.md` and `_meta.json` files

**Downloaded Skills:**
1. blogwatcher
2. crypto-market-data
3. finance-news
4. find-skills
5. gemini-deep-research
6. github
7. news-aggregator-skill
8. reddit-insights
9. self-improving-agent
10. stock-analysis
11. summarize
12. web-search
13. x-research

**File Structures Observed:**
- Minimal skills: 2 files (SKILL.md + _meta.json)
- Complex skills: up to 14 files (finance-news), 8 files (x-research)
- Additional files include auxiliary configs, scripts, or documentation

**Automation Pattern:**
```bash
for zip in *.zip; do 
  slug="${zip%.zip}"
  mkdir -p "skills/$slug"
  unzip -q "$zip" -d "skills/$slug"
done
```

**Evidence Generated:**
- `skill-count.txt`: Total directory count (14)
- `installed-skills.txt`: Sorted list of all skill names
- `skill-file-counts.txt`: File counts per skill for verification
## 2026-03-11 — Task 1 CLI/keyring research

- `gogcli` keyring file backend path is derived from config dir: `<config-dir>/keyring`.
- On Linux defaults, config dir is `~/.config/gogcli`, so encrypted keyring entries are under `~/.config/gogcli/keyring/`.
- With `HOME=/data` in container, effective persisted path is `/data/.config/gogcli/` (and `/data/.config/gogcli/keyring/`).
- Required env vars for non-interactive file backend are confirmed: `GOG_KEYRING_BACKEND=file` and `GOG_KEYRING_PASSWORD=<value>`.
- Verified install commands:
  - `go install github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest`
  - `npm install -g @steipete/summarize`
  - `apt-get install gh`

## 2026-03-11 — Task 2 Dockerfile integration learnings

- Builder-stage pattern remains stable when adding extra Go CLI binaries via additional `go install` lines.
- Final image apt dependencies can be safely extended in a single `apt-get install --no-install-recommends` line with `nodejs npm gh`.
- For no-build frontend constraints, `npm install -g @steipete/summarize` in Dockerfile avoids introducing `package.json` while making CLI available.
- Added `GOG_KEYRING_BACKEND=file` and `GOG_KEYRING_PASSWORD=...` under existing Docker ENV block to keep keyring persistence behavior explicit and container-friendly.

## 2026-03-11 — Task 7 Blogwatcher Pre-configuration

- `blogwatcher` stores its configuration in a SQLite database (`~/.blogwatcher/blogwatcher.db`), not a plain text file.
- Because of this, feeds cannot be pre-configured by simply dropping a config file into the workspace.
- The correct approach for pre-configuring `blogwatcher` feeds is to run the `blogwatcher add` CLI commands during the container's first-boot setup.
- Added 12 `blogwatcher add` commands to `start.sh` inside the `if [ ! -f /data/.picoclaw/config.json ]; then` block.
- Documented the pre-configured feeds in `skills/blogwatcher/SKILL.md` under a new "Pre-configured Feeds" section.
- Added yfinance and pandas for stock-analysis skill, and requests and beautifulsoup4 for news-aggregator-skill to Dockerfile.

## Skill Directories Verification
- Verified all 14 skill directories are present in `skills/`.
- Verified each directory contains `SKILL.md` and `_meta.json`.
- Verified no nested skill directories exist (e.g., `skills/web-search/web-search/`).
- Verified `Dockerfile` correctly copies all skills using `COPY skills/ /app/skills/` (line 36).
- Created evidence file at `.sisyphus/evidence/skill_verification.txt`.
