# Shubh Samay — Overview

**What it is:** A mobile-first PWA that finds auspicious timing (Muhurat, Choghadiya, Hora, Tithi, Nakshatra, Yoga) for life events — weddings, housewarmings, vehicle purchases, and more — using live NASA-grade astronomy calculations with Lahiri ayanamsa.

**Target user:** Gujarati-speaking users in Gujarat, India who want traditional panchang-based auspicious timings without consulting a priest.

**Current status:** Live / feature-complete (V9). All core features implemented and verified.

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + astronomy-engine + Prisma (SQLite).

## Core constraints
- **No stored panchang data** — all calculations live from astronomy-engine on every request, always accurate.
- **Bilingual** — English + Gujarati with one-tap toggle, defaults to English.
- **Mobile-first** — responsive layout optimized for 390px+ screens, PWA installable on Android.
- **Gujarat focus** — 24 Gujarat cities + 6 major India cities; IST (UTC+5:30) timezone.
- **Light / Dark / System themes** from day one via next-themes.
- **No backend auth** — Prisma schema exists with User/Post models but is unused (scaffold only).
- **No CI/CD pipeline yet** — manual build/deploy for now.

## Out of scope
- Server-side rendering of auth or user accounts
- Calendar sync or push notifications
- API for third-party consumption
- Desktop-first or tablet-first layouts (mobile-first always)
- Any paid/pro tier
- Offline caching of panchang data (always recalculated)
