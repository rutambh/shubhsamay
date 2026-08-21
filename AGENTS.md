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

## Active MCP Tools & Skills for this project
- **CodeGraph MCP** (`codegraph`): Real-time AST code graph & watcher. ALWAYS prefer `codegraph_explore` for instant symbol lookup, call hierarchy tracing, and blast radius before modifying code.
- **Graphify Skill** (`graphify`): Local offline project memory & knowledge graph generator for `docs/` and architecture notes.
- **Superpowers Skills** (`superpowers`): Follow `systematic-debugging`, `test-driven-development`, and `verification-before-completion` workflows.

## Design System & Skill Routing (This Project)
- **UI/UX Stack:** Strictly **Tailwind CSS v4 + shadcn/ui**. Activate `ui-styling` and `ui-ux-pro-max` (color palettes/tokens). Strictly **DISABLE `material-3` / `@material/web` tokens**.
- **Skill Gating:**
  - Activate `nextjs-specialist` only when editing Next.js pages/components under `src/app/` or `src/components/`.
  - Activate `mobile-pwa-developer` only when editing `android-app/`, `twa-manifest.json`, or PWA service workers.
