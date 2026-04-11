#!/bin/bash
set -e

# Allow custom Hermes home directory via HERMES_HOME env var (default: /data/.hermes)
HERMES_HOME="${HERMES_HOME:-/data/.hermes}"
PICOCLAW_HOME="${PICOCLAW_HOME:-/data/agents/.picoclaw}"

mkdir -p ${PICOCLAW_HOME}/workspace
mkdir -p ${PICOCLAW_HOME}/sessions
mkdir -p ${PICOCLAW_HOME}/cron
mkdir -p ${PICOCLAW_HOME}/workspace/skills
# mkdir -p /data/.config/gogcli
if [ -d /app/skills ]; then
    cp -rn /app/skills/* ${PICOCLAW_HOME}/workspace/skills/ || true
fi
echo "Bootstrapped $(ls -d ${PICOCLAW_HOME}/workspace/skills/*/ 2>/dev/null | wc -l) skills"

if [ ! -f ${PICOCLAW_HOME}/config.json ]; then
    picoclaw onboard

    # Pre-configure blogwatcher feeds
    blogwatcher add "Medium Python" https://medium.com/feed/tag/python || true
    blogwatcher add "Medium TypeScript" https://medium.com/feed/tag/typescript || true
    blogwatcher add "Medium ReactJS" https://medium.com/feed/tag/reactjs || true
    blogwatcher add "Medium NextJS" https://medium.com/feed/tag/nextjs || true
    blogwatcher add "Medium Golang" https://medium.com/feed/tag/golang || true
    blogwatcher add "Medium Docker" https://medium.com/feed/tag/docker || true
    blogwatcher add "Medium Kubernetes" https://medium.com/feed/tag/kubernetes || true
    blogwatcher add "Medium AI" https://medium.com/feed/tag/artificial-intelligence || true
    blogwatcher add "Medium LLM" https://medium.com/feed/tag/llm || true
    blogwatcher add "Medium DevOps" https://medium.com/feed/tag/devops || true
    blogwatcher add "Medium React Native" https://medium.com/feed/tag/react-native || true
    blogwatcher add "Medium Indie Hacker" https://medium.com/feed/tag/indie-hacker || true
fi

# Ensure Hermes directory exists
mkdir -p "$HERMES_HOME"

# Hermes skill discovery path remediation
# Keep ${PICOCLAW_HOME}/workspace/skills as canonical source-of-truth
# Create symlink $HERMES_HOME/skills -> ${PICOCLAW_HOME}/workspace/skills
HERMES_SKILLS_PATH="$HERMES_HOME/skills"
PICOCLAW_SKILLS_PATH="${PICOCLAW_HOME}/workspace/skills"

# Handle edge case: if $HERMES_HOME/skills exists as a real directory (not symlink)
# Merge missing entries into canonical path, then archive the legacy directory
if [ -d "$HERMES_SKILLS_PATH" ] && [ ! -L "$HERMES_SKILLS_PATH" ]; then
    echo "Found legacy Hermes skills directory, migrating to canonical path..."

    # Copy any skills from legacy location that don't exist in canonical path (non-clobber)
    cp -rn "$HERMES_SKILLS_PATH"/* "$PICOCLAW_SKILLS_PATH"/ 2>/dev/null || true

    # Archive legacy directory with timestamp
    LEGACY_ARCHIVE="$HERMES_HOME/skills.backup.$(date +%Y%m%d%H%M%S)"
    mv "$HERMES_SKILLS_PATH" "$LEGACY_ARCHIVE"
    echo "Archived legacy skills to $LEGACY_ARCHIVE"
fi

# Create or refresh symlink idempotently
if [ -L "$HERMES_SKILLS_PATH" ]; then
    # Symlink exists - remove it to refresh
    rm "$HERMES_SKILLS_PATH"
elif [ -d "$HERMES_SKILLS_PATH" ]; then
    # This shouldn't happen after the migration above, but handle defensively
    rmdir "$HERMES_SKILLS_PATH"
fi

# Create symlink from Hermes discovery path to canonical picoclaw path
ln -s "$PICOCLAW_SKILLS_PATH" "$HERMES_SKILLS_PATH"
echo "Linked Hermes skills path to canonical location"

# Create default Hermes config if not exists
if [ ! -f "$HERMES_HOME/config.yaml" ]; then
    cat > "$HERMES_HOME/config.yaml" << 'EOF'
model:
  provider: "auto"
  default: "anthropic/claude-3.5-sonnet"
auxiliary:
  vision:
    provider: "auto"
  web_extract:
    provider: "auto"
EOF
fi

# Create empty .env if not exists
if [ ! -f "$HERMES_HOME/.env" ]; then
    touch "$HERMES_HOME/.env"
fi

# Create gateway meta file if not exists
if [ ! -f /data/.gateway-meta.json ]; then
    echo '{"backend": "picoclaw"}' > /data/.gateway-meta.json
fi

exec /usr/local/bin/python3 /app/server.py
