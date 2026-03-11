#!/bin/bash
set -e

mkdir -p /data/.picoclaw/workspace
mkdir -p /data/.picoclaw/sessions
mkdir -p /data/.picoclaw/cron
mkdir -p /data/.picoclaw/workspace/skills
mkdir -p /data/.config/gogcli
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

exec python /app/server.py
