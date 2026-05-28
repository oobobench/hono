# Project Context

This is the Hono web framework — a lightweight, ultrafast TypeScript web framework for the Edge.

## REQUIRED: Check Engineering Memory First

This project has engineering memory with patterns from 50+ recent commits.
**You MUST call `mcp__oobo__recall` before writing any code** — it will show you
exactly how similar features were implemented, saving you from guessing at patterns.

Example queries that work well:
- `mcp__oobo__recall` with query "compress middleware contentTypeFilter options"
- `mcp__oobo__recall` with query "cors credentials wildcard origin fix"
- `mcp__oobo__search` with query "MiddlewareHandler factory pattern"

## Established Patterns (from memory)

- Middleware lives in `src/middleware/<name>/index.ts` with tests in `index.test.ts`
- All middleware exports a factory function returning `MiddlewareHandler`
- Options interfaces use TypeScript strict patterns with sensible defaults
- Types imported from `../../types`
- Test files use the framework internal test utilities
- Strong ETags must be converted to weak when content is modified (compression, etc.)
- CORS: reflect actual request values instead of wildcards when credentials are enabled
- Compression: check Accept-Encoding before applying forced encoding options

## Available Memory Tools

| Tool | Use for |
|------|---------|
| `mcp__oobo__recall` | Find prior implementations matching your task |
| `mcp__oobo__search` | Search code by intent (faster than Grep) |
| `mcp__oobo__get_context` | Get full context for specific files |
| `mcp__oobo__ask` | Ask about architecture decisions |
