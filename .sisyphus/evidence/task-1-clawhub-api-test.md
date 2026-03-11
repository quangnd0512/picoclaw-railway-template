## Task 1 Evidence: ClawHub download API header test

Date: 2026-03-11

### Command run
```bash
curl -sI "https://wry-manatee-359.convex.site/api/v1/download?slug=web-search"
```

### Response highlights
- HTTP status: `HTTP/2 200`
- `content-type: application/zip`
- `content-disposition: attachment; filename="web-search-1.0.0.zip"`

### Conclusion
- Endpoint is reachable and returns ZIP content as expected.
