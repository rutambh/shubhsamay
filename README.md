# Shubh Samay (શુભ સમય)

A mobile-first PWA that finds auspicious Vedic timing (Muhurat, Choghadiya, Hora, Tithi, Nakshatra, Yoga) for life events — weddings, housewarmings, vehicle purchases, and more. All calculations are live from NASA-grade astronomy (Lahiri ayanamsa), so results are always accurate.

**Status:** Feature complete (V9).  
**Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui + astronomy-engine  
**Languages:** English + Gujarati (one-tap toggle)  
**Themes:** Light / Dark / System

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Documentation

AI agents: see `AGENTS.md` and `docs/INDEX.md`.  
Humans: this README tells you what it is; everything else lives in `docs/`.

## Features
- 18 event types with smart method recommendations
- 5 calculation methods: Choghadiya, Hora, Tithi, Nakshatra, Yoga, Muhurat
- Multi-date + date range selection (up to 30 days)
- Optional time window filtering
- Tiered results (Highly Auspicious / Auspicious / Good) with cumulative scoring
- Live today's panchang widget (60s auto-refresh)
- Suggestion engine: scans ±5 days for better timings
- 24 Gujarat cities + major India cities
- PWA installable on Android
- Dark/light/system themes
- Full Gujarati language support

## Package
`com.rutambh.shubhsamay`
