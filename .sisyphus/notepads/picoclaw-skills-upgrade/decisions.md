## 2026-03-11 — Validation source choices

- Chosen source of truth for gog token/keyring path: upstream `gogcli` source files (`internal/config/paths.go`, `internal/secrets/store.go`) over README wording.
- Chosen source of truth for `gh` availability in Bookworm: `packages.debian.org/bookworm/gh` due local environment not being Debian Bookworm and no Docker daemon for isolated apt test.

## 2026-03-11 — Task 2 implementation decisions

- Kept existing two-stage Docker build architecture unchanged; only additive commands were introduced in builder/final stages.
- Placed `npm install -g @steipete/summarize` after Python dependency installation in final stage to avoid altering Python tooling behavior and to keep CLI provisioning explicit.
- Added gog keyring env vars in the existing ENV section near `HOME=/data` to align with runtime persistence paths under `/data`.
