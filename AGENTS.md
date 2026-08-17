# AGENTS.md

This file is read automatically at the start of every AI session for THIS project.
Global behavior rules live in config-level `~/.gemini/config/rules/agents.md` — do not repeat them here.

## Project
- Name: Shubh Samay
- One line: PWA for finding auspicious Vedic timings (Muhurat/Choghadiya/Hora) — live from NASA-grade astronomy, bilingual EN/GU.
- Stack: Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui (existing — do not migrate to Flutter).

Full details: `docs/INDEX.md` → start there before touching anything. Full rulebook: `docs/masterprompt.md`.

## Read order
Read one doc at a time, in this order:  
`docs/overview.md` → `docs/product.md` → `docs/architecture.md` → `docs/structure/INDEX.md` → `docs/environment.md` → `docs/ui.md` → `docs/database.md` → `docs/permissions.md` → `docs/cicd/cicd.md` → `docs/decisions.md` → supervisor docs (only when escalating).

## Project-specific rules
- Existing Next.js static export + Android WebView app with `WebViewAssetLoader` (`android-app/`). Do not migrate to Flutter or remote Bubblewrap TWA.
- Astronomy calculations are 100% client-side via `astronomy-engine` in `src/lib/panchang.ts` and `src/lib/client-api.ts`.
- Timezone safety: Always use `getStartOfCivilDayInTz` and `getEndOfCivilDayInTz` from `src/lib/time-utils.ts` for civil day boundaries.

## Active MCP Knowledge Servers for this project
- Both `codebase-memory-mcp` and `notebooklm` MCP servers are configured in `mcp_config.json` to launch automatically whenever this IDE starts.
- **Codebase Memory MCP** (`codebase-memory-mcp`): ALWAYS prefer MCP graph tools (`search_graph`, `trace_path`, `get_code_snippet`) over grep/glob for code discovery, symbol lookup, and call path tracing. Cross-check with grep/ripgrep for symbol count verification.
- **NotebookLM MCP** (`notebooklm` / `.notebooklm`): Read `.notebooklm` at session start. Query project memory via `notebook_query` for domain rules, business logic, and architectural context before writing code. Save new decisions/bug resolutions via `note`.
