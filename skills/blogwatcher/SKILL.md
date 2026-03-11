---
name: blogwatcher
description: Monitor blogs and RSS/Atom feeds for updates using the blogwatcher CLI.
homepage: https://github.com/Hyaxia/blogwatcher
metadata: {"clawdbot":{"emoji":"📰","requires":{"bins":["blogwatcher"]},"install":[{"id":"go","kind":"go","module":"github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest","bins":["blogwatcher"],"label":"Install blogwatcher (go)"}]}}
---

# blogwatcher

Track blog and RSS/Atom feed updates with the `blogwatcher` CLI.

Install
- Go: `go install github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest`

Quick start
- `blogwatcher --help`

Common commands
- Add a blog: `blogwatcher add "My Blog" https://example.com`
- List blogs: `blogwatcher blogs`
- Scan for updates: `blogwatcher scan`
- List articles: `blogwatcher articles`
- Mark an article read: `blogwatcher read 1`
- Mark all articles read: `blogwatcher read-all`
- Remove a blog: `blogwatcher remove "My Blog"`

Example output
```
$ blogwatcher blogs
Tracked blogs (1):

  xkcd
    URL: https://xkcd.com
```
```
$ blogwatcher scan
Scanning 1 blog(s)...

  xkcd
    Source: RSS | Found: 4 | New: 4

Found 4 new article(s) total!
```

Pre-configured Feeds
The following Medium RSS feeds are pre-configured for your tech stack:
- `blogwatcher add "Medium Python" https://medium.com/feed/tag/python`
- `blogwatcher add "Medium TypeScript" https://medium.com/feed/tag/typescript`
- `blogwatcher add "Medium ReactJS" https://medium.com/feed/tag/reactjs`
- `blogwatcher add "Medium NextJS" https://medium.com/feed/tag/nextjs`
- `blogwatcher add "Medium Golang" https://medium.com/feed/tag/golang`
- `blogwatcher add "Medium Docker" https://medium.com/feed/tag/docker`
- `blogwatcher add "Medium Kubernetes" https://medium.com/feed/tag/kubernetes`
- `blogwatcher add "Medium AI" https://medium.com/feed/tag/artificial-intelligence`
- `blogwatcher add "Medium LLM" https://medium.com/feed/tag/llm`
- `blogwatcher add "Medium DevOps" https://medium.com/feed/tag/devops`
- `blogwatcher add "Medium React Native" https://medium.com/feed/tag/react-native`
- `blogwatcher add "Medium Indie Hacker" https://medium.com/feed/tag/indie-hacker`

Notes
- Use `blogwatcher <command> --help` to discover flags and options.
