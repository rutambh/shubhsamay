# Panchang Engine Module (`panchang.md`)

## Overview
The Panchang Engine (`src/lib/panchang.ts`) handles low-level astronomical calculations using the `astronomy-engine` package with Lahiri Ayanamsa corrections.

## Files
- `src/lib/panchang.ts` — Core calculation functions for Sun/Moon longitudes, Tithi, Nakshatra, Yoga, Karana, and Sunrise/Sunset times.
- `src/app/api/panchang/route.ts` — API endpoint returning current Panchang details for a requested city and date.

## Key Calculations
- **Tithi:** Computed from difference between Moon's ecliptic longitude and Sun's ecliptic longitude divided by 12°.
- **Nakshatra:** Computed from Moon's ecliptic longitude divided by 13° 20' (13.3333°).
- **Yoga:** Computed from sum of Sun's and Moon's ecliptic longitudes divided by 13° 20'.
- **Karana:** Half-tithi periods (6° intervals).
- **Sunrise & Sunset:** Solar elevation angle calculation (`SearchRiseSet` via `astronomy-engine`).

## Dependencies
- `astronomy-engine` (v2.1.19)
- `src/lib/i18n.ts` (for timezone display helpers)

