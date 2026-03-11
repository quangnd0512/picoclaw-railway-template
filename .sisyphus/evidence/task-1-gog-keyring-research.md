## Task 1 Evidence: gog keyring/token storage research

Date: 2026-03-11

### Sources checked
- `https://raw.githubusercontent.com/steipete/gogcli/main/internal/config/paths.go`
- `https://raw.githubusercontent.com/steipete/gogcli/main/internal/secrets/store.go`
- `https://raw.githubusercontent.com/steipete/gogcli/main/README.md`

### Findings
1. `gogcli` config root directory resolves from `config.Dir()`:
   - Uses `$XDG_CONFIG_HOME/gogcli` when `XDG_CONFIG_HOME` is set.
   - Otherwise uses `os.UserConfigDir()/gogcli`, which on Linux is `~/.config/gogcli`.
2. File keyring backend directory is built by `config.KeyringDir()` as:
   - `<config-dir>/keyring`
   - Linux default effective path: `~/.config/gogcli/keyring`
3. Therefore, saying gog uses `~/.config/gogcli/` for config/keyring storage is correct; the encrypted file-keyring entries are specifically under `~/.config/gogcli/keyring/`.
4. Keyring env vars are present in source (`internal/secrets/store.go`):
   - `GOG_KEYRING_BACKEND`
   - `GOG_KEYRING_PASSWORD`
5. README confirms file backend behavior and env var usage:
   - `export GOG_KEYRING_BACKEND=file`
   - `GOG_KEYRING_PASSWORD` required for non-interactive file backend usage.

### Container persistence implication for this project
- Project Dockerfile sets `HOME=/data`.
- Linux default config dir resolves to `$HOME/.config/gogcli`.
- Effective persisted path in container: `/data/.config/gogcli/` (keyring files in `/data/.config/gogcli/keyring/`).

### Validated env var pair
```bash
GOG_KEYRING_BACKEND=file
GOG_KEYRING_PASSWORD=<value>
```

---

## Additional dependency validation (Task 1 scope)

### blogwatcher
- Verified module: `github.com/Hyaxia/blogwatcher`
- Verified command folder: `cmd/blogwatcher`
- Install command:
```bash
go install github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest
```

### summarize
- npm package page exists: `@steipete/summarize`
- Install command:
```bash
npm install -g @steipete/summarize
```

### gh (GitHub CLI)
- Debian bookworm package page exists for package `gh` (version listed as `2.23.0+dfsg1-1`).
- Debian install command:
```bash
apt-get install gh
```

### gog (existing binary already used in Dockerfile)
- Source module: `github.com/steipete/gogcli`
- Install command:
```bash
go install github.com/steipete/gogcli/cmd/gog@latest
```
