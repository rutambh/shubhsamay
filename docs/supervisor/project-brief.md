# Shubh Samay — Project Brief

## What it is
Mobile-first PWA for finding auspicious Vedic timing (Muhurat, Choghadiya, Hora, Tithi, Nakshatra, Yoga) for life events — weddings, housewarmings, vehicle purchases, etc. Bilingual EN/GU, Gujarat-focused.

## Stack
- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + framer-motion
- **Astronomy:** astronomy-engine (NASA-grade, Lahiri ayanamsa)
- **State:** React Context (lang) + next-themes (theme) + useState (wizard)
- **Database:** Prisma/SQLite (scaffold only — app calculates everything live)
- **Auth:** next-auth installed but not used
- **PWA:** manifest.webmanifest with `com.rutambh.shubhsamay` id

## Key structure
```
src/
├── app/                    — layout, page (4-step wizard), API routes
├── components/
│   ├── ui/                 — 48 shadcn primitives
│   └── wizard/             — event-picker, method-picker, date-picker, results-view, panchang-today
├── hooks/                  — use-lang, use-mobile, use-toast
└── lib/                    — panchang.ts, time-divisions.ts, events.ts (rules), i18n.ts
```

## Current status
V9 — feature complete. All bugs fixed (timezone double-offset, Muhurat visibility, Vara over-disqualification, Muhurat in All mode, hydration mismatch, date-range results).

## CI/CD
Not yet configured. No `.github/` directory.

## Key conventions
- All calculations live (no stored panchang data)
- Tier buckets are cumulative: Good >= Auspicious >= Highly
- Vara "avoid" caps at "good" (doesn't disqualify)
- Muhurat only disqualifies when selected alone
- Timezone: raw UTC everywhere, format helpers on client
- Default location: Ahmedabad (Gujarat)
