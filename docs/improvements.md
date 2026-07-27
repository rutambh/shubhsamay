# Shubh Samay — Improvements Log

Append-only log of feature and architecture improvements across the project lifecycle, per Section 5 of the Master Prompt protocol.

## 2026-07-27 — Update Android Target API Level to 36
**Improvement:** Updated `targetSdkVersion` to `36` (Android 16) in `android-app/build.gradle`.  
**Result:** Met Google Play Store requirement mandating target API level within 1 year of latest Android release for app updates.

## 2026-07-04 — Standalone Muhurat & Separate Tithi/Nakshatra/Yoga (V7 & V8)
**Improvement:** Restricted Muhurat method exclusively to Abhijit and Brahma Muhurat windows. Extracted Yoga into its own standalone calculation method. Made Muhurat non-disqualifying when selected in "All" mode.  
**Result:** Prevented strict Muhurat filtering from eliminating valid auspicious slots across 24-hour periods.

## 2026-07-04 — Cumulative Tier Classification (V6)
**Improvement:** Standardized results view tiles to cumulative tier counting (`Highly` <= `Auspicious` <= `Good`).  
**Result:** Streamlined slot selection UI and eliminated disjoint slot counts.

## 2026-07-25 — Settings Drawer Footer Text Cleanup
**Improvement:** Removed the bottom tagline ("Shubh Samay · Live panchang calculated via Lahiri ayanamsa. Astronomy-accurate timings.") from `SettingsButton` sheet drawer.  
**Result:** Cleaner Settings UI drawer layout.

## 2026-07-25 — Live Location-Based Hindu Panchang, Tithi, Hora & Choghadiya Engine Upgrade
**Improvement:** Implemented offline-first, location-aware astronomical calculation engine with zero device-local timezone mutations, wall-clock to UTC conversion, dynamic IANA timezone resolution, 50km Haversine GPS lookup, and pre-sunrise Hindu day boundary handling (`effectiveDate = date - 1 day` before sunrise).  
**Result:** Complete resilience against timezone bugs, AM/PM inversion errors, and pre-sunrise calendar boundary miscalculations globally across Android PWA and Web environments.

## 2026-07-25 — Header Marquee Animation, Today's Panchang Visual Redesign & Past Time Safeguards
**Improvement:** Added smooth CSS marquee text sliding animation for long city names in header location button, redesigned Today's Panchang widget with bold Date banner, live Clock badge (`formatTzTime`), revamped **Sunrise & Sunset Banner** into a unified glassmorphic Astronomical Horizon Track with Option 4 ultra-minimalist vector SVGs (`CustomSunriseIcon` & `CustomSunsetIcon`: base horizon line, smooth half-sun arc, clean vertical rising/setting arrow, zero ray clutter), ambient light Orbs, gradient sun trajectory arc, sleek rounded icon badges (`w-10 h-10 rounded-xl`), and extra-bold text (`text-base sm:text-lg font-black`), restricted past time options in Date step for current date, and filtered out past candidate slots (`slotEnd <= now`) in results scoring engine.  
**Result:** Fixed pill header width, high-visibility Panchang card typography, Option 4 minimalist sun SVG icons, and 100% past-slot free timing recommendations for today.

## 2026-07-25 — Revamp Sunrise & Sunset Cards with Dynamic Celestial Sun Tracker
**Improvement:** Revamped the Sunrise & Sunset section into a dynamic `<SunTrackerCard />` widget featuring a real-time SVG Sun Arc position curve, dual glassmorphic cards with amber & deep orange themes, Dawn & Dusk timestamps, Solar Noon (Madhyahna) pin, live daylight countdown pill badge, and full EN/GU translations.  
**Result:** Rich astronomical visual display, live progress tracking across the sky, and high-contrast glassmorphism presentation for Sunrise & Sunset in Panchang.

## 2026-07-25 — Streamlined Celestial Sun Tracker Layout
**Improvement:** Consolidated Sunrise and Sunset times, icons, and Dawn/Dusk metrics directly beneath the left and right endpoints of the SVG celestial curve, removing separate top card containers.  
**Result:** Unified, compact visual arc widget with direct visual alignment between the sky curve and sunrise/sunset timings.

## 2026-07-25 — Home Icon Navigation & Calendar Interaction Overhaul
**Improvement:** Added Home icon button (`Home` from lucide-react) to every non-home page (method, dates, results) so users can jump directly to the event step without multi-tapping Back. Redesigned date selection flow: clicking a date in the calendar only highlights it (visual preview), then an explicit "Add Date" / "Add Range" button must be tapped to commit. In range mode, multiple ranges can be added sequentially (each is merged into the existing dates array). Fixed calendar shape/alignment inconsistency — both individual and range modes now use `mx-auto` center alignment and outline-only "today" styling (`ring-1 ring-primary/30 rounded-full` + `rdp-today-circle`). Disabled "Add Time Window" button until at least one date is selected.  
**Result:** Faster navigation, error-proof date selection (no accidental taps), visually consistent calendars, and intuitive multi-range support.

## 2026-07-25 — Panchang Tithi Timing, Date Range Button Disable & Header/Panchang Location Layout Adjustments
**Improvement:** 
1. Added precise Tithi start/end timing calculation (`getTithiRange`) to `src/lib/panchang.ts` and displayed it on the Tithi card in `PanchangToday`.
2. Set the "Add Range" button in Date Range mode to be rendered continuously but disabled until both Start and End dates are selected.
3. Relocated `LocationSearch` from the top header into the top-right of `PanchangToday`, and combined date & live time on the top-left of `PanchangToday` (`25th July, 10:49 PM`).
**Result:** Clearer Tithi time window visibility, foolproof Date Range selection UX, and streamlined header layout.

## 2026-07-25 — Home Page Header Revamp, Location Prompt/Truncation, Compact Cards & 12-Hour AM/PM Time Format
**Improvement:** Replaced logo and app name in the top sticky header with **Today's Panchang** title and live date/time (`25th July, 10:59 PM` in 12-hour AM/PM format). Converted location button to auto fetch GPS on tap with loading spinner, text truncation (`City name...`) to prevent UI overflow, and a system notice dialog if GPS is off or denied (removed tooltip as city name is displayed beside icon). Removed duplicate header banner inside `PanchangToday`, added active Rahu Kaal alert banner, compacted all 6 Panchang cards (Tithi, Vara, Nakshatra, Yoga/Karana, Hora, Choghadiya) with tight padding and clean typography, and strictly enforced 12-hour AM/PM time formatting across the entire application (`formatTzTime`).  
**Result:** Sleek, modern mobile-first header, 1-tap location auto-fetch with truncation safeguards, zero header duplication, compact Panchang card layout, and 100% 12-hour AM/PM time display throughout the app.
## 2026-07-25 — Expansion of All Special Auspicious Muhurats (Abhijit, Brahma, Vijaya, Godhuli, Pradosh, Nishita)
**Improvement:** Expanded `classifyMuhurat` in `src/lib/events.ts` to calculate all 6 Special Auspicious Muhurats (**Abhijit**, **Brahma**, **Vijaya**, **Godhuli**, **Pradosh**, and **Nishita**) dynamically from local solar coordinates.  
## 2026-07-25 — Single-Method Tier Evaluation, 24-Hour Scan Range & Suggestion Generator Fix
**Improvement:** Fixed tier calculation in `classifySlot` so single-method selections (e.g. `Muhurat` method) evaluate the active method's tier directly without being degraded by unselected factors. Expanded default scan range from 4–21 to 0–24 hours (full 24-hour cycle) to include late-night Special Muhurats (Nishita Muhurat), and added fallback to `auspicious` candidate slots in `findBetterSuggestion` when no `highly` slots are available on neighboring dates.  
## 2026-07-25 — Unrequested Yoga Removal in Muhurat-Only Results
**Improvement:** Fixed `useYoga` check in `classifySlot` (`const useYoga = methods.includes("yoga")`) to remove legacy alias (`methods.includes("muhurat")`), ensuring Yoga is only evaluated and displayed when explicitly selected.  
## 2026-07-25 — Results View Tile Tabs Reactivity & Strict Tier Bucketing
**Improvement:** Converted server-side tier bucketing in `findBestTimings` from cumulative overlap to strict tier separation (`highly`, `auspicious`, `good`) and added reactive `useEffect` state sync to `ResultsView` for `selectedTier`.  
## 2026-07-25 — Featured Best Recommended Timing Hero Card Component
## 2026-07-25 — Results View Layout Optimization: Compact Best Card, Tight Spacing & Nearby Card Removal
## 2026-07-25 — Results View Typography Optimization: Increased Time Font Size & Weight
## 2026-07-25 — Multi-Method Engine: All-Methods Best Recommended Timing Calculation & Strict Tier Rule
## 2026-07-25 — Color-Coded ClassChips in Best Recommended Timing Card
## 2026-07-26 — App Icon Assets, Panchang Spinner Loading State & Local Storage Caching
**Improvement:** 
1. Replaced all app icon assets (`public/logo.png`, `icon-192.png`, `icon-512.png`, `apple-icon.png`, `store_icon.png`, and Android `ic_launcher` resources) with the new `unnamed.png` brand icon.
2. Updated `PanchangToday` loading UI to display an explicit spinning `Loader2` icon with localized text (`(Loader) Today's Panchang` / `(Loader) આજનું પંચાંગ`).
3. Added `localStorage` caching (`shubh_samay_panchang_${city}_${date}`) on mount for 0ms instant Panchang display on subsequent app launches with background revalidation.
**Result:** Instant PWA app launch, offline readiness, and clear loading UX.

## 2026-07-26 — Best Recommended Timing Card & Results View "Change date and time" Direct Step Jump
**Improvement:** Added `"Change date and time"` (`"તારીખ અને સમય બદલો"`) button to `ResultsView` in two contexts:
- **CASE 1 (Results Available)**: Placed right beneath the Best Recommended timing card to let users jump straight back to Step 3 (Choose Date & Time) without losing their chosen event or methods.
- **CASE 2 (No Timings Available)**: Rendered prominently in the center of the empty result grid alongside friendly guidance and "Start Over".
**Result:** Streamlined navigation, zero extra clicks to tweak date ranges, and improved conversion flow when scanning auspicious timings.

## 2026-07-26 — Best Timings Page UI Clean-Up: Removal of Duplicate Home Button
**Improvement:** Removed the extra Home button from the bottom of the Results (`Best Timings`) page in `src/app/page.tsx`. Since "Start Over" and "Change date and time" buttons are already rendered inside `ResultsView`, eliminating the bottom Home button prevents UI duplication. Maintained the Home icon button for Method and Dates steps.  
**Result:** Cleaner Results layout without button clutter.



















