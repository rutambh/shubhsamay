# Shubh Samay — Architecture Decision Log

*(Append-only. New entries at the top.)*

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

## 2026-07-01: Skyfield rejected, astronomy-engine chosen

Decision: Evaluated Skyfield (Python) for panchang calculations. Rejected because this is a Next.js (Node.js/TypeScript) project. astronomy-engine is a pure JS/TS library with NASA-grade ephemeris calculations, no native dependencies, and supports all required functions (Sun/Moon positions, rise/set times).
