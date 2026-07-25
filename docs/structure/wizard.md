# Wizard UI Module (`wizard.md`)

## Overview
The Wizard UI (`src/app/page.tsx` and `src/components/wizard/`) orchestrates the 4-step auspicious timing selection experience.

## Files & Steps
- `src/app/page.tsx` — Main SPA container managing wizard state (`step`, `event`, `methods`, `dates`, `timeWindow`, `results`).
- `src/components/wizard/panchang-today.tsx` — Today's Live Panchang banner widget (6 cards with 60s auto-refresh).
- `src/components/wizard/event-picker.tsx` — **Step 1:** Grid of 18 life event categories with smart default badge indicators.
- `src/components/wizard/method-picker.tsx` — **Step 2:** Toggle calculation modes (Auto Recommended, All, or custom checkboxes).
- `src/components/wizard/date-picker.tsx` — **Step 3:** Select single/multiple dates or date ranges (up to 30 days) and optional time window filters.
- `src/components/wizard/results-view.tsx` — **Step 4:** Tiered result cards (`Highly`, `Auspicious`, `Good`) with expand/collapse detailed time slot tiles and Smart Suggestion banner.

## UX State Rules
- Step progression is validated at each step (must select event → must select at least 1 method → must select at least 1 date).
- Back button preserves all selected step parameters.

