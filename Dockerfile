FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git make

WORKDIR /src

ARG PICOCLAW_VERSION=main

RUN git clone --depth 1 --branch ${PICOCLAW_VERSION} https://github.com/sipeed/picoclaw.git .
RUN go mod download
RUN make build
# RUN go install github.com/steipete/gogcli/cmd/gog@latest
RUN go install github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates git nodejs npm gh && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /src/build/picoclaw /usr/local/bin/picoclaw
# COPY --from=builder /go/bin/gog /usr/local/bin/gog
COPY --from=builder /go/bin/blogwatcher /usr/local/bin/blogwatcher

COPY requirements.txt /app/requirements.txt
RUN uv pip install --system --no-cache -r /app/requirements.txt
COPY skills/news-aggregator-skill/requirements.txt /tmp/news-requirements.txt
RUN uv pip install --system --no-cache -r /tmp/news-requirements.txt
RUN uv pip install --system --no-cache yfinance pandas
RUN npm install -g @steipete/summarize

RUN mkdir -p /data/.picoclaw

COPY server.py /app/server.py
COPY templates/ /app/templates/
COPY skills/ /app/skills/
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV HOME=/data
ENV PICOCLAW_AGENTS_DEFAULTS_WORKSPACE=/data/.picoclaw/workspace
# ENV GOG_KEYRING_BACKEND=file
# ENV GOG_KEYRING_PASSWORD=picoclaw_default_keyring_secret

CMD ["/app/start.sh"]
