#!/bin/bash
set -e

mkdir -p /data/.picoclaw/workspace
mkdir -p /data/.picoclaw/sessions
mkdir -p /data/.picoclaw/cron
mkdir -p /data/.picoclaw/workspace/skills
# mkdir -p /data/.config/gogcli
if [ -d /app/skills ]; then
    cp -rn /app/skills/* /data/.picoclaw/workspace/skills/ || true
fi
echo "Bootstrapped $(ls -d /data/.picoclaw/workspace/skills/*/ 2>/dev/null | wc -l) skills"

if [ ! -f /data/.picoclaw/config.json ]; then
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
mkdir -p /data/.hermes

# Hermes skill discovery path remediation
# Keep /data/.picoclaw/workspace/skills as canonical source-of-truth
# Create symlink /data/.hermes/skills -> /data/.picoclaw/workspace/skills
HERMES_SKILLS_PATH="/data/.hermes/skills"
PICOCLAW_SKILLS_PATH="/data/.picoclaw/workspace/skills"

# Handle edge case: if /data/.hermes/skills exists as a real directory (not symlink)
# Merge missing entries into canonical path, then archive the legacy directory
if [ -d "$HERMES_SKILLS_PATH" ] && [ ! -L "$HERMES_SKILLS_PATH" ]; then
    echo "Found legacy Hermes skills directory, migrating to canonical path..."
    
    # Copy any skills from legacy location that don't exist in canonical path (non-clobber)
    cp -rn "$HERMES_SKILLS_PATH"/* "$PICOCLAW_SKILLS_PATH"/ 2>/dev/null || true
    
    # Archive legacy directory with timestamp
    LEGACY_ARCHIVE="/data/.hermes/skills.backup.$(date +%Y%m%d%H%M%S)"
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
if [ ! -f /data/.hermes/config.yaml ]; then
    cat > /data/.hermes/config.yaml << 'EOF'
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
if [ ! -f /data/.hermes/.env ]; then
    touch /data/.hermes/.env
fi

# Create gateway meta file if not exists
if [ ! -f /data/.gateway-meta.json ]; then
    echo '{"backend": "picoclaw"}' > /data/.gateway-meta.json
fi

exec python /app/server.py
