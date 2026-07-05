# Shubh Samay — Architecture

## Folder structure
```
shubh_samay/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── panchang/route.ts     — GET today's panchang for a location
│   │   │   ├── timings/route.ts      — POST compute best timings for event+dates
│   │   │   └── route.ts              — health check
│   │   ├── globals.css               — Tailwind v4 + theme CSS variables
│   │   ├── layout.tsx                — root layout (fonts, ThemeProvider, metadata)
│   │   └── page.tsx                  — main SPA wizard (4 steps)
│   ├── components/
│   │   ├── ui/                       — 48 shadcn/ui primitives (button, card, sheet, etc.)
│   │   ├── wizard/
│   │   │   ├── event-picker.tsx      — step 1: choose event (18 types + Others)
│   │   │   ├── method-picker.tsx     — step 2: choose methods (Auto/All/6 methods)
│   │   │   ├── date-picker.tsx       — step 3: pick dates (individual/range) + time window
│   │   │   ├── results-view.tsx      — step 4: tiered results with tiles UI
│   │   │   └── panchang-today.tsx    — today's live panchang widget (6 cards)
│   │   ├── location-search.tsx       — popover city selector (Gujarat first, searchable)
│   │   ├── settings-button.tsx       — sheet with Language + Theme selectors
│   │   └── theme-provider.tsx        — next-themes wrapper
│   ├── hooks/
│   │   ├── use-lang.tsx              — language context (EN/GU, localStorage persistence)
│   │   ├── use-mobile.ts             — mobile detection hook
│   │   └── use-toast.ts              — shadcn toast hook
│   └── lib/
│       ├── events.ts                 — event catalog, method defs, tier classification, slot scoring
│       ├── panchang.ts               — Tithi/Nakshatra/Yoga/Karana/Sunrise/Sunset calculations
│       ├── time-divisions.ts         — Choghadiya/Hora/Rahu Kaal/Yamaganda/Gulika
│       ├── i18n.ts                   — EN+GU string table + formatTz helpers
│       ├── utils.ts                  — cn() utility (clsx + tailwind-merge)
│       └── db.ts                     — Prisma client (unused scaffold)
├── prisma/
│   └── schema.prisma                 — User + Post models (scaffold, not used by app)
├── public/
│   ├── logo.png, icon-192.png, icon-512.png, apple-icon.png
│   └── manifest.webmanifest          — PWA manifest (com.rutambh.shubhsamay)
├── docs/                             — project documentation set
├── mini-services/                    — empty placeholder
├── .zscripts/                        — dev/build helper scripts
├── next.config.ts                    — standalone output, TS errors ignored in build
├── tailwind.config.ts                — shadcn theme config
├── tsconfig.json                     — strict TS, path alias @/ -> src/
└── components.json                   — shadcn config
```

## State management
- **React state** (useState) for wizard flow — no global store needed for single-page wizard.
- **Zustand** is installed (v5.0.6) but unused — available if cross-component state grows.
- **TanStack React Query** installed but unused — API calls use plain fetch.
- **Language** via React Context (LanguageProvider in use-lang.tsx) with localStorage persistence.
- **Theme** via next-themes ThemeProvider (class-based dark mode).

## Module boundaries
- `lib/panchang.ts` + `lib/time-divisions.ts` — pure calculation engines, no React dependency.
- `lib/events.ts` — rules engine (event→method mapping, tier classification, slot scoring).
- `lib/i18n.ts` — strings + time formatting helpers (tz-independent).
- `components/wizard/` — one component per wizard step; page.tsx orchestrates flow.
- No circular dependencies between lib modules.

## How data flows
1. User selects event → methods → dates → "Find Auspicious Timings"
2. POST to `/api/timings` with {event, methods[], dates[], city, tzOffsetHours, lang, timeWindow?}
3. Server calls `findBestTimings()` → classifies each 30-min slot across all selected methods → computes overall tier (min across categories with cumulative bucketing)
4. Returns {highly[], auspicious[], good[], suggestion?}
5. Client renders tiered tiles with expand/collapse, sorted by highly-count desc

## Known tech debt
- Prisma User/Post models are unused scaffold (leftover from starter template)
- `next.config.ts` has `ignoreBuildErrors: true` and `reactStrictMode: false` — should be fixed
- `tsconfig.json` has `noImplicitAny: false` — should be fixed
- No unit tests for calculation engines (panchang, time-divisions, events)
- No CI/CD pipeline configured
- The `mini-services/` directory is an empty placeholder
