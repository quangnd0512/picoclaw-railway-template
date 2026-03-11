## Task 2 Evidence: Dockerfile CLI binaries and system dependencies

Date: 2026-03-11

### Dockerfile changes applied
1. Added blogwatcher install in builder stage:
   - `RUN go install github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest`
2. Extended apt dependencies in final stage:
   - Added `nodejs npm gh` to `apt-get install` list
3. Copied blogwatcher binary into final image:
   - `COPY --from=builder /go/bin/blogwatcher /usr/local/bin/blogwatcher`
4. Installed summarize CLI globally:
   - `RUN npm install -g @steipete/summarize`
5. Added gog keyring env vars:
   - `ENV GOG_KEYRING_BACKEND=file`
   - `ENV GOG_KEYRING_PASSWORD=picoclaw_default_keyring_secret`

### Build verification command run
```bash
docker build -t picoclaw-test .
```

### Build command output in this execution environment
```text
ERROR: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

### Verification status
- Dockerfile edits completed as required.
- Local `docker build` execution is blocked by missing/unavailable Docker daemon in this environment.
