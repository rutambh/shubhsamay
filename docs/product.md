# Shubh Samay — Product Knowledge Base

The permanent record of domain logic, business rules, and product behavior for Shubh Samay, per Section 5 of the Master Prompt protocol.

## Product Overview `[Verified]`
- **Vision:** Provide instant, authentic Vedic auspicious timing (Muhurat, Choghadiya, Hora, Panchang) calculations for life events without requiring consultation with a traditional priest or complex panchang tables.
- **Target User:** Gujarati-speaking households and individuals across Gujarat and India planning significant life events (weddings, housewarmings, vehicle purchases, business launches, etc.).
- **Primary Value Proposition:** NASA-grade astronomical accuracy (Lahiri Ayanamsa) computed dynamically in real-time, presented through a modern 4-step wizard interface with bilingual support (English & Gujarati).

## Glossary & Ubiquitous Language `[Verified]`
- **Panchang (પંચાંગ):** The five limbs of Vedic time: Tithi (lunar day), Vara (weekday), Nakshatra (lunar mansion), Yoga (lunar-solar angle), Karana (half tithi).
- **Choghadiya (ચોઘડિયાં):** Division of daytime and nighttime into 8 equal parts (~1.5 hours each), ruled by 7 planetary influences (`Udveg, Amrit, Rog, Labh, Shubh, Char, Kaal`).
- **Hora (હોરા):** Planetary hours (~1 hour each) rotating through planetary lords (`Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn`).
- **Abhijit Muhurat (અભિજિત મુહૂર્ત):** Auspicious 8th Muhurat of the day (±12–24 minutes around exact solar noon).
- **Brahma Muhurat (બ્રહ્મ મુહૂર્ત):** Auspicious period occurring 96 to 48 minutes before sunrise.
- **Rahu Kaal (રાહુ કાળ):** Inauspicious daily period ruled by Rahu (approx 1/8th of daylight).
- **Yamaganda (યમગંડ):** Inauspicious daily period associated with Yama.
- **Gulika (ગુલિકા):** Neutral/inauspicious period associated with Saturn's son.
- **Ayanamsa (અયનાંશ):** Precession correction angle; Shubh Samay standardizes strictly on **Lahiri Ayanamsa** (`[Verified]`).

## User Personas & Roles `[Verified]`
- **Standard User (Guest):** Accesses all features without registration. Can select cities, choose events, configure methods, pick dates, view tiered results, and toggle language/theme preferences.
- **No Administrative / Account Roles:** The product features zero admin panels, paywalls, or user registration requirements.

## Conceptual Data Model `[Verified]`
- **Location:** City name, State, Latitude, Longitude, Timezone offset (e.g., Ahmedabad: `23.0225° N, 72.5714° E`, IST UTC+5:30).
- **Event:** Life event category (18 predefined + "Others"), default recommended methods, priority weights.
- **Slot:** 30-minute interval across a target date, evaluated against selected Panchang methods.
- **Tier:** Classification level (`Highly Auspicious`, `Auspicious`, `Good`, `Avoid`).

## Feature Catalogue (Business View) `[Verified]`
1. **Panchang Today Widget:** Displays current Tithi, Vara, Nakshatra, Yoga, Karana, Sunrise, Sunset, and Rahu Kaal for selected city (`components/wizard/panchang-today.tsx`).
2. **Event Selection Wizard (Step 1):** Grid of 18 life events with custom icons (`components/wizard/event-picker.tsx`).
3. **Method Selection (Step 2):** Toggle calculation methods (`Auto Recommended`, `All Methods`, or custom pick of Choghadiya, Hora, Tithi, Nakshatra, Yoga, Muhurat) (`components/wizard/method-picker.tsx`).
4. **Date & Window Selector (Step 3):** Individual date picker or range selection (up to 30 days) with optional time window filter (`components/wizard/date-picker.tsx`).
5. **Tiered Results Display (Step 4):** Grouped slot counts (`Highly`, `Auspicious`, `Good`) with expand/collapse cards and Smart Suggestion banner (`components/wizard/results-view.tsx`).
6. **Bilingual Toggle:** Instant EN/GU UI translation with `localStorage` persistence (`hooks/use-lang.tsx`).
7. **City Popover:** Searchable selector for 24 Gujarat cities + 6 major metros (`components/location-search.tsx`).

## Business Logic & Rules `[Verified]`
- **Calculation Accuracy:** Calculations are computed server-side in UTC using `astronomy-engine`, with time formatting offset applied on the client (`lib/i18n.ts`).
- **Best Recommended Timing Engine:**
  - Evaluates candidate 30-minute slots across **ALL 6 methods** (`Choghadiya`, `Hora`, `Tithi`, `Nakshatra`, `Yoga`, `Muhurat`) for the selected date(s) and time window.
  - **Active Special Muhurat Requirement:** The recommended slot **MUST fall within an active Special Auspicious Muhurat** (`Abhijit`, `Brahma`, `Vijaya`, `Godhuli`, `Pradosh`, `Nishita`). Slots outside Special Muhurats are excluded from recommendations.
  - **Tier Priority:** Top `Highly Auspicious` slot first; falls back to top `Auspicious` slot if no `Highly` slot exists. Excludes pure `Good` slots.
  - **Card Visibility:** Hides the Best Recommended Timing card completely if no `Highly` or `Auspicious` slot with an active Special Muhurat exists.
- **Results Grid & Cumulative Tier Bucketing Engine:**
  - **Highly Auspicious Tile:** Contains strictly `Highly Auspicious` slots (`overallTier === "highly"`).
  - **Auspicious Tile:** Contains cumulative `Highly Auspicious` + `Auspicious` slots (`overallTier === "highly" || overallTier === "auspicious"`).
  - **Good Tile:** Contains cumulative sum of all acceptable slots (`overallTier === "highly" || overallTier === "auspicious" || overallTier === "good"`).
  - **Hierarchy Guarantee:** $\text{Good Count} > \text{Auspicious Count} > \text{Highly Count}$ (Good tile presents the full vast line of acceptable timing options).
- **Multi-Method Weighted Average Tier Scoring:**
  - Evaluates average tier score across active selected methods: Average $\ge 2.5 \rightarrow \text{Highly}$, Average $\ge 1.5 \rightarrow \text{Auspicious}$, Average $< 1.5 \rightarrow \text{Good}$.
  - Any major malefic factor (Rahu Kaal, malefic Choghadiya/Yoga) marks slot as `Avoid` (disqualified).
- **Vara (Weekday) Display-Only Rule:**
  - Vara is **purely informational / display-only**. It renders as a colored chip (e.g., `Vara: Tuesday (Avoid)`), but **NEVER alters or degrades** the overall calculated slot tier (`overallTier`).
- **24-Hour Continuous Astronomical Cross-Boundary Lookup:**
  - Horas and Choghadiyas astronomically begin at Sunrise of each day. Candidate slots between 00:00 AM and Sunrise (~6:00 AM) search across yesterday's night horas/choghadiyas for 100% continuous 24-hour evaluation.
- **UI & Layout Standards:**
  - Best Recommended Timing card displays `Day, Date` on Line 1 and `Time` on Line 2 with enlarged font.
  - All classification chips (`ClassChip`) are color-coded by tier (Green = Highly, Yellow = Auspicious, Blue = Good). Inactive Muhurat dash chips (`Muhurat: —`) are omitted.
  - Tile button headers (`HIGHLY AUSPICIOUS`, `AUSPICIOUS`, `GOOD`) use fixed `min-h-[26px]` flex containers centered vertically and horizontally.

## Known Product-Level Limitations `[Verified]`
- **City Scope:** Focused primarily on Gujarat cities (24) + major Indian metros (6). Custom coordinate input is not supported in the UI.
- **Offline Mode:** Requires internet connection to fetch API route responses from dev/server instance.


