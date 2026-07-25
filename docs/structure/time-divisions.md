# Time Divisions Engine Module (`time-divisions.md`)

## Overview
The Time Divisions Engine (`src/lib/time-divisions.ts`) calculates daily sub-divisions: Choghadiya, Hora, Rahu Kaal, Yamaganda, and Gulika periods based on sunrise and sunset times.

## Files
- `src/lib/time-divisions.ts` — Implements planet rotation sequences, daytime/nighttime split logic, and period evaluation.

## Key Logic
- **Day / Night Split:**
  - Day duration = Sunset - Sunrise (divided into 8 equal parts for Choghadiya, 12 parts for Hora).
  - Night duration = Next Sunrise - Sunset (divided into 8 equal parts for Choghadiya, 12 parts for Hora).
- **Choghadiya Sequence:** 7 Graha Choghadiyas (`Udveg, Amrit, Rog, Labh, Shubh, Char, Kaal`). Starts with weekday lord and rotates according to Chaldean planet order (`[0, 5, 3, 1, 6, 4, 2]`).
- **Hora Sequence:** 24 hourly periods starting with planetary lord of the weekday (`Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn`).
- **Rahu Kaal & Yamaganda:** Daily 1/8th daylight sub-windows mapped to fixed weekday index offsets.

## Dependencies
- `src/lib/panchang.ts` (requires accurate Sunrise and Sunset timestamps).

