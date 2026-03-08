#!/bin/bash
set -e

mkdir -p /data/.picoclaw/workspace
mkdir -p /data/.picoclaw/sessions
mkdir -p /data/.picoclaw/cron
mkdir -p /data/.picoclaw/workspace/skills
if [ -d /app/skills ]; then
    cp -rn /app/skills/* /data/.picoclaw/workspace/skills/ || true
fi

if [ ! -f /data/.picoclaw/config.json ]; then
    picoclaw onboard
fi

exec python /app/server.py
