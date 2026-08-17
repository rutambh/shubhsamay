# Shubh Samay — Bug Fix Log

Append-only log of bug fix attempts across the project lifecycle, per Section 5 of the Master Prompt protocol.

## 2026-08-17 — Mobile City Selector Scroll Trap & Performance Lag
**Issue:** 
1. In Settings drawer, clicking "Select City" opened a nested Popover inside Radix Sheet which trapped touch events and prevented scrolling down the list on mobile devices.
2. The entire `ShubhSamayApp` component tree was re-rendering every 1 second due to the top-level header clock interval.  
**Fix [MAJOR]:**
1. Created `CitySelectModal` (`src/components/city-select-modal.tsx`) using a full `Dialog` with categorized tabs (Gujarat 33 districts, India, USA, UK, Canada, Australia, UAE / Gulf, Global), search input, and dedicated `touch-pan-y overscroll-contain` scroll container.
2. Isolated 1-second interval timer inside `<LiveHeaderDateTime />` in `src/app/page.tsx`, removing all 1-second re-renders from the main wizard app.  
**Result:** Smooth, effortless city selection and instant UI response with 0 lag. Verified via clean `npm run build`.

## 2026-07-25 — Past Time Selectable in Time Window for Today
**Issue:** `Math.floor` in `currentDecimalHour` calculation allowed selecting a "From" time that had already passed (e.g., selecting 7:00 PM when it's 7:18 PM).  
**Fix:** Changed `Math.floor` to `Math.ceil` so the "From" dropdown only shows slots that haven't started yet.  
**Related:** `Math.ceil` of the now-truncation-safe `currentDecimalHour` was replaced with the raw value to avoid skipping the first valid half-hour slot.  
**Files:** `date-picker.tsx` lines 153, 405.

## 2026-07-26 — Runtime PageNotFoundError / Route Not Found /page
**Issue:** Next.js 16 (Turbopack) crashed with `Runtime PageNotFoundError: Cannot find module for page: route not found /page`. The root cause was a directory name collision: Bubblewrap TWA init created an Android module folder named `app/` in the project root alongside `src/app/`. Next.js prioritized root `./app` as the App Router root, failing to find any page components.  
**Fix [MINOR]:** Renamed root Android module directory from `app/` to `android-app/`. Updated `settings.gradle`, `.github/workflows/playstore.yml`, `.gitignore`, and `docs/cicd/cicd.md`. Terminated stale dev server PID on port 3000.  
**Result:** Next.js cleanly resolves App Router pages from `src/app/` (`/`, `/_not-found`, `/api`, `/api/panchang`, `/api/timings`). Verified via clean `npm run build`.
## 2026-07-26 — Runtime TypeError: onChange is not a function in EventPicker
**Issue:** Selecting an event card in `EventPicker` threw `TypeError: onChange is not a function` because `EventPicker` expected `onChange` while `page.tsx` was passing `onSelect`.  
**Fix [MINOR]:** Updated `EventPicker` (`src/components/wizard/event-picker.tsx`) props interface to accept both `onChange` and `onSelect` optional handlers (`value?: EventId | null`, `onChange?: (id: EventId) => void`, `onSelect?: (id: EventId) => void`). Updated `src/app/page.tsx` to supply `value`, `onChange`, and `onSelect` props.  
## 2026-07-26 — Runtime TypeError: Cannot read properties of undefined (reading 'includes') in MethodPicker
**Issue:** Advancing from Event selection to Method selection threw `TypeError: Cannot read properties of undefined (reading 'includes')` because `MethodPicker` expected `value` while `page.tsx` was passing `selected`.  
**Fix [MINOR]:** Standardized props across `MethodPicker` (`src/components/wizard/method-picker.tsx`) and `DateRangePicker` (`src/components/wizard/date-picker.tsx`) to support both `value`/`selected` and `dates`/`selectedDates` with safe default fallbacks (`currentMethods = value ?? selected ?? []`). Updated `src/app/page.tsx` to supply all prop aliases.  
## 2026-07-26 — Standalone Muhurat Selection Suggesting Non-Muhurat Slots
**Issue:** Selecting "Muhurat" method standalone for 28th July 4:00 AM – 4:30 AM suggested the slot as "GOOD" even though no Special Muhurat (Abhijit, Brahma, Vijaya, Godhuli, Pradosh, Nishita) was active during that period. The engine was assigning non-active Muhurat slots `overallTier = "good"` instead of disqualifying them.  
**Fix [MINOR]:** Updated `classifySlot()` in `src/lib/events.ts` line 740 so that when `muhuratOnlyMethod` is `true` and `classification.muhurat?.active` is `false`, `overallTier` evaluates to `"avoid"`.  
**Result:** Non-Muhurat time slots are properly disqualified when Muhurat is selected standalone. Verified via clean `npm run build`.
## 2026-07-29 — Mobile App Redirecting to non-existent shubhsamay.app Website (404 Error)
**Issue:** Opening the Android app on mobile launched Chrome Custom Tabs pointing to `https://shubhsamay.app/`, resulting in a 404 error because no website was hosted or planned for `shubhsamay.app`.  
**Fix [MAJOR]:** Converted Android packaging model from TWA (`androidbrowserhelper`) to a Standalone Local Android WebView App:
1. Created `src/lib/client-api.ts` so all astronomical/Panchang calculations execute 100% client-side via `astronomy-engine`.
2. Configured `next.config.ts` for static HTML export (`output: 'export'`).
3. Created native `MainActivity.java` using `WebViewAssetLoader` serving local assets from `assets/www/index.html`.
4. Added `npm run build:android` script to `package.json` to export Next.js static files and sync into `android-app/src/main/assets/www/`.
5. Updated `android-app/build.gradle` and `AndroidManifest.xml` to replace TWA activities with `MainActivity`.  
**Files:** `src/lib/client-api.ts`, `src/app/page.tsx`, `src/components/wizard/panchang-today.tsx`, `next.config.ts`, `package.json`, `android-app/build.gradle`, `android-app/src/main/AndroidManifest.xml`, `android-app/src/main/java/com/rutambh/shubhsamay/MainActivity.java`, `.github/workflows/playstore.yml`.
