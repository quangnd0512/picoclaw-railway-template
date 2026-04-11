FROM golang:1.25-alpine AS picoclaw-builder

RUN apk add --no-cache git make

WORKDIR /src

ARG PICOCLAW_VERSION=main

RUN git clone --depth 1 --branch ${PICOCLAW_VERSION} https://github.com/sipeed/picoclaw.git .
RUN go mod download
RUN make build
# RUN go install github.com/steipete/gogcli/cmd/gog@latest
RUN go install github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest

FROM python:3.12-slim-bookworm AS hermes-builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        ca-certificates \
        build-essential \
        && rm -rf /var/lib/apt/lists/*

# Install uv for fast Python package installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /hermes-src

# Clone Hermes Agent and initialize submodules
RUN git clone https://github.com/NousResearch/hermes-agent.git . && \
    git submodule update --init --recursive --depth 1

# Create venv and install Hermes with minimal dependencies (non-editable install)
# Non-editable allows removing /hermes-src after install to save ~200MB
RUN uv venv /opt/hermes/venv && \
    . /opt/hermes/venv/bin/activate && \
    uv pip install --no-cache ".[messaging,cron,mcp,pty]"

FROM node:24-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./

RUN npm install

COPY frontend/ ./
RUN npm run build

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates git jq bc unzip && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

COPY --from=picoclaw-builder /src/build/picoclaw /usr/local/bin/picoclaw
# COPY --from=picoclaw-builder /go/bin/gog /usr/local/bin/gog
COPY --from=picoclaw-builder /go/bin/blogwatcher /usr/local/bin/blogwatcher

COPY --from=hermes-builder /opt/hermes/venv /opt/hermes/venv

COPY requirements.txt /app/requirements.txt
COPY skills/news-aggregator-skill/requirements.txt /tmp/news-requirements.txt

RUN uv pip install --system --no-cache \
    -r /app/requirements.txt \
    -r /tmp/news-requirements.txt \
    yfinance \
    pandas \
    duckduckgo-search \
    && rm -rf /tmp/* \
    && rm -rf /root/.cache/*

RUN bun install -g @steipete/summarize && \
    rm -rf /root/.bun/install/cache

# Add wrapper for stock-analysis
RUN echo '#!/bin/sh\n\
    DIR="/data/agents/.picoclaw/workspace/skills/stock-analysis"\n\
    CMD="$1"\n\
    if [ -z "$CMD" ]; then\n\
    echo "Usage: stock-analysis <command> [args]"\n\
    echo "Commands: analyze, hot, rumor, portfolio, watchlist, dividend"\n\
    exit 1\n\
    fi\n\
    shift\n\
    case "$CMD" in\n\
    hot) exec python3 "$DIR/scripts/hot_scanner.py" "$@" ;;\n\
    rumor) exec python3 "$DIR/scripts/rumor_scanner.py" "$@" ;;\n\
    portfolio) exec python3 "$DIR/scripts/portfolio.py" "$@" ;;\n\
    watchlist) exec python3 "$DIR/scripts/watchlist.py" "$@" ;;\n\
    dividend) exec python3 "$DIR/scripts/dividends.py" "$@" ;;\n\
    analyze) exec python3 "$DIR/scripts/analyze_stock.py" "$@" ;;\n\
    *) exec python3 "$DIR/scripts/analyze_stock.py" "$CMD" "$@" ;;\n\
    esac' > /usr/local/bin/stock-analysis && chmod +x /usr/local/bin/stock-analysis

# Add wrapper for finance-news
RUN echo '#!/bin/sh\n\
    DIR="/data/agents/.picoclaw/workspace/skills/finance-news"\n\
    CMD="$1"\n\
    if [ -z "$CMD" ]; then\n\
    echo "Usage: finance-news <command> [args]"\n\
    echo "Commands: setup, config, briefing, market, portfolio, portfolio-list, portfolio-add, etc."\n\
    exit 1\n\
    fi\n\
    shift\n\
    case "$CMD" in\n\
    setup) exec python3 "$DIR/scripts/setup.py" wizard "$@" ;;\n\
    config) exec python3 "$DIR/scripts/setup.py" show "$@" ;;\n\
    briefing) exec python3 "$DIR/scripts/briefing.py" "$@" ;;\n\
    market) exec python3 "$DIR/scripts/fetch_news.py" market "$@" ;;\n\
    portfolio) exec python3 "$DIR/scripts/fetch_news.py" portfolio "$@" ;;\n\
    portfolio-list|portfolio-add|portfolio-remove|portfolio-import|portfolio-create) exec python3 "$DIR/scripts/portfolio.py" "${CMD#portfolio-}" "$@" ;;\n\
    news) echo "Ticker news not natively implemented in fetch_news.py" ;;\n\
    *) echo "Unknown command: $CMD" && exit 1 ;;\n\
    esac' > /usr/local/bin/finance-news && chmod +x /usr/local/bin/finance-news

# Add wrapper for news-aggregator-skill
RUN echo '#!/bin/sh\n\
    DIR="/data/agents/.picoclaw/workspace/skills/news-aggregator-skill"\n\
    if [ "$1" = "fetch" ]; then\n\
    shift\n\
    exec python3 "$DIR/scripts/fetch_news.py" "$@"\n\
    else\n\
    exec python3 "$DIR/scripts/fetch_news.py" "$@"\n\
    fi' > /usr/local/bin/news-aggregator-skill && chmod +x /usr/local/bin/news-aggregator-skill

RUN mkdir -p /data/agents/.picoclaw /data/agents/.hermes

COPY server.py /app/server.py
COPY --from=frontend-builder /app/dist /app/frontend/dist
COPY skills/ /app/skills/
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

RUN ln -s /opt/hermes/venv/bin/hermes /usr/local/bin/hermes

ENV HOME=/data
ENV PICOCLAW_HOME=/data/agents/.picoclaw
ENV PICOCLAW_AGENTS_DEFAULTS_WORKSPACE=/data/agents/.picoclaw/workspace
ENV HERMES_HOME=/data/agents/.hermes
ENV FINANCE_NEWS_VENV_BOOTSTRAPPED=1

# Prevent Python from writing pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

WORKDIR /app

# ENV TZ="Asia/Saigon"
# ENV GOG_KEYRING_BACKEND=file
# ENV GOG_KEYRING_PASSWORD=picoclaw_default_keyring_secret

CMD ["/app/start.sh"]
