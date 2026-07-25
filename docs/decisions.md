# Shubh Samay — Architecture Decision Log

## 2026-07-23: Fix Choghadiya and Yamaganda Vedic calculation logic

Decision: Aligned Choghadiya calculation rules and Yamaganda offsets with Drik Panchang Vedic standards.
- Choghadiya sequence: Fixed from broken 8-item array (which included non-existent "Dudh") to standard 7 Graha Choghadiyas (Udveg, Amrit, Rog, Labh, Shubh, Char, Kaal). Day sequence rotates by Chaldean planet order starting with weekday lord (`[0, 5, 3, 1, 6, 4, 2]`). Night sequence starts with weekday-specific planet (`[4, 5, 3, 2, 1, 6, 0]`) and rotates (`[1, 5, 2, 6, 3, 0, 4]`).
- Yamaganda offsets: Fixed weekday index mapping to standard 0-indexed offsets `[4, 3, 2, 1, 0, 6, 5]`.
- Build/Dev scripts: Updated npm scripts in `package.json` for cross-platform Windows compatibility (removed Unix `tee` and `cp`).

## 2026-07-05: Switch from ab-initio Flutter to Next.js

The masterprompt mandates Flutter for new projects. However, this is an existing Next.js project that was built before this protocol was introduced. Per Section 3 Rule 82: "If this project uses a different stack... do not migrate it to Flutter. Leave the stack exactly as it is." The project stays on Next.js 16 + TypeScript + Tailwind CSS v4.

## 2026-07-04: Muhurat made standalone (V7)

Decision: Muhurat method now only considers Abhijit (±12 min around solar noon) and Brahma (96-48 min before sunrise) muhurat periods. It no longer includes Tithi/Nakshatra/Yoga under "Muhurat" — those are separate standalone methods. Yoga was added as its own method. Reason: the traditional definition of Muhurat is specific daily periods, not a bundle of panchang elements.

## 2026-07-04: Vara no longer disqualifies (V8)

Decision: Vara tier "avoid" now caps the overall tier at "good" instead of disqualifying the slot entirely. Reason: strict Vara filtering meant entire weekdays (Tuesdays, Saturdays) showed "No slots" for most events, which was confusing to users. Slots on those days still show — just at a lower tier.

## 2026-07-04: Muhurat optional in "All" mode (V8)

Decision: When Muhurat is selected alongside other methods (e.g., "All" mode), Muhurat periods contribute a "highly" bonus if active but do NOT disqualify non-Muhurat slots. Only when Muhurat is the **sole** method do non-Muhurat slots get disqualified. Reason: "All" mode with strict Muhurat filtering killed almost every slot since Muhurat periods are only ~72 min/day.

## 2026-07-04: Cumulative tier logic (V6)

Decision: The three tier buckets are cumulative: "Highly" = only slots with overallTier==="highly"; "Auspicious" = highly + auspicious; "Good" = highly + auspicious + good. This means Good count >= Auspicious >= Highly always. Reason: the user explicitly requested this formula — it avoids confusion where a "Good" tile might have disjoint/confusing counts.

## 2026-07-03: Server-UTC timezone architecture (V4)

Decision: All astronomy calculations return raw UTC. The server does NOT add timezone offsets. Client-side format helpers (`formatTzTime`, `formatTzDate`) apply the offset for display. Reason: previous approach of adding tzOffset server-side caused double-offset bugs when the client (in IST) applied it again. Centralizing tz formatting in client helpers avoids UTC/IST confusion entirely.

## 2026-07-03: Live calculation over stored data

Decision: No panchang data is stored in the database. All Tithi/Nakshatra/Yoga/Karana/Sunrise/Sunset/Choghadiya/Hora/Rahu Kaal calculations are done live from astronomy-engine with Lahiri ayanamsa. Reason: (1) Always accurate — no stale data, no drift from precession corrections. (2) No sync/deployment needed when festival dates change. (3) Less database complexity.

## 2026-07-02: LanguageProvider initializes with "en"

Decision: LanguageProvider starts with `useState<Lang>("en")` and loads saved preference from localStorage in a `useEffect` after mount. Reason: fixes hydration mismatch between SSR (which has no localStorage access) and client. Per spec: "On Landing it will be English."

## 2026-07-25: Multi-Method Engine for Best Recommended Timing & Special Muhurat Requirement

Decision: Redesigned `findBestRecommendedTiming` to evaluate candidate slots across ALL 6 methods (`Choghadiya`, `Hora`, `Tithi`, `Nakshatra`, `Yoga`, `Muhurat`) within user dates/timeframe. Added strict requirement that the recommended slot MUST fall within an active Special Auspicious Muhurat (`Abhijit`, `Brahma`, `Vijaya`, `Godhuli`, `Pradosh`, `Nishita`). Excludes pure "Good" slots and hides the recommendation hero card if no Highly or Auspicious slot with an active Special Muhurat exists.

## 2026-07-25: Weighted Average Tier Scoring for Multi-Method Slots

Decision: Replaced strict `MIN` tier reduction in `classifySlot` with weighted average tier scoring across selected active methods ($\ge 2.5 \rightarrow \text{highly}, \ge 1.5 \rightarrow \text{auspicious}, < 1.5 \rightarrow \text{good}$). Reason: strict `MIN` degraded any slot with a single neutral factor to `"good"` and caused `Auspicious` count to equal `Good` count. Weighted average ensures `Good` cumulative bucket contains the full vast set of acceptable timing slots (`Good count > Auspicious count > Highly count`).

## 2026-07-25: Vara (Weekday) Made Purely Informational (Display-Only)

Decision: Removed all Vara capping and disqualification logic from `overallTier` calculation in `classifySlot`. Reason: per product owner directive, Vara is purely for display/show on timing cards (e.g. `Vara: Tuesday (Avoid)`) and MUST NEVER degrade or alter a slot's overall calculated tier.

## 2026-07-25: 24-Hour Continuous Astronomical Cross-Boundary Lookup for Hora & Choghadiya

Decision: Added `getHoraForTime` and `getChoghadiyaForTime` helpers to search across astronomical day boundaries. Reason: Horas and Choghadiyas astronomically begin at Sunrise of each day. Candidate slots between 00:00 AM and Sunrise (~6:00 AM) previously returned `undefined` because `getHoras(date)` starts at today's Sunrise. Searching yesterday's night sequence ensures 100% continuous 24-hour Hora and Choghadiya evaluation for all slots.

