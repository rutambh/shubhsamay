# CHANGELOG

Working log for task summaries per Section 8.3 of the Master Prompt protocol. Entries here are merged into permanent documentation files upon request.

## [2026-07-27] — MINOR Fix: Update Android Target API Level to 36
- **MINOR fix**: Updated `targetSdkVersion` from `35` to `36` (Android 16) in `android-app/build.gradle` to comply with Google Play Store target API level requirements.

## [2026-07-27] — MINOR Fix: Remove Old Splash Screen on App Launch
- **MINOR fix**: Removed `SPLASH_IMAGE_DRAWABLE`, `SPLASH_SCREEN_BACKGROUND_COLOR`, and `SPLASH_SCREEN_FADE_OUT_DURATION` meta-data from `AndroidManifest.xml` so the old kalash icon no longer shows on launch — TWA now goes straight to the website.

## [2026-07-27] — MAJOR Fix: TWA Host Misconfiguration (404 Blocker on Mobile)

- **MAJOR fix**: Corrected Android TWA host pointing to `raw.githubusercontent.com` instead of `shubhsamay.app`, causing the app to be stuck on a 404 error screen on mobile.
- `twa-manifest.json`: Changed `host` → `shubhsamay.app`, `startUrl` → `/`, `iconUrl` and `maskableIconUrl` → `https://shubhsamay.app/icon-512.png`.
- `android-app/build.gradle`: Changed `hostName` → `shubhsamay.app`, `launchUrl` → `/`, `webManifestUrl` → `https://shubhsamay.app/manifest.webmanifest`.
- `android-app/src/main/res/values/strings.xml`: Changed Digital Asset Links `site` → `https://shubhsamay.app`.
- **Action required**: Push to `main` to trigger a new build and deploy to Play Store.

## [2026-07-26] — CI/CD Play Store Production Release & Build Fix

- **MINOR fix**: Fixed AAB file path mismatch in `.github/workflows/playstore.yml` by updating `path` and `releaseFiles` to `android-app/build/outputs/bundle/release/*.aab` (matching Gradle's `android-app-release.aab` output).
- Updated `.github/workflows/playstore.yml` to deploy signed AAB directly to Google Play Store **Production Track**.
- Updated `android-app/build.gradle` to dynamically compute `versionCode` from `twa-manifest.json` / `VERSION_CODE` environment variable so GitHub Actions auto-increments build numbers on every release run.
- Configured `eslint.config.mjs` to ignore `scratch/**` and updated `docs/cicd/cicd.md` documentation.
- Verified clean build (`npm run build`) and lint checks (`npm run lint`).

## [2026-07-26] — CI/CD Pipeline Setup
- Created `.github/workflows/playstore.yml` for automated GitHub Actions build and Google Play Store release.
- Configured Bubblewrap TWA manifest (`twa-manifest.json`) with package ID and keystore alias `com.rutambh.shubhsamay`.
- Added automatic `appVersionCode` increment step using `${{ github.run_number }}` on every build run.
- Updated `docs/cicd/cicd.md` with pipeline workflow and secret requirements.

## [2026-07-26] — App Icon, Panchang Loader & Change Date & Time UX
- **MINOR update**: Updated Panchang loading state UI to display spinning `Loader2` icon + `Today's Panchang` / `આજનું પંચાંગ`.
- Implemented `localStorage` caching (`shubh_samay_panchang_${city}_${date}`) for instant 0ms startup on subsequent app opens with silent background revalidation.
- Replaced app icon assets (`public/logo.png`, `icon-192.png`, `icon-512.png`, `apple-icon.png`, `store_icon.png`, and Android `ic_launcher` resources) with new icon from `unnamed.png`.
- Added `"Change date and time"` (`"તારીખ અને સમય બદલો"`) button in `ResultsView` under Best Recommended timing card (CASE 1) and in the middle of empty result grid (CASE 2) to jump back to Step 3 directly.
## [2026-07-26] — Fix EventPicker TypeError: onChange is not a function
- **MINOR fix**: Updated `EventPicker` (`src/components/wizard/event-picker.tsx`) props definition to accept both `onChange` and `onSelect` optional handlers.
- Updated `src/app/page.tsx` to pass `value`, `onChange`, and `onSelect` props to `EventPicker`.
## [2026-07-26] — Fix MethodPicker & DateRangePicker Prop Aliases (Cannot read properties of undefined 'includes')
- **MINOR fix**: Standardized prop interfaces across `MethodPicker` (`src/components/wizard/method-picker.tsx`) and `DateRangePicker` (`src/components/wizard/date-picker.tsx`) to support all prop aliases (`value`/`selected`, `dates`/`selectedDates`, `onChange`/`onSelect`/`onDatesChange`).
- Added safe array fallback initializations (`value ?? selected ?? []`) to eliminate any possibility of `undefined.includes()` or `undefined.filter()` runtime errors during wizard step transitions.
## [2026-07-26] — Fix Standalone Muhurat Selection Suggesting Non-Muhurat Slots
- **MINOR fix**: Fixed `classifySlot()` in `src/lib/events.ts` so that when `Muhurat` is selected standalone (`muhuratOnlyMethod`), slots without an active Special Muhurat period (Abhijit, Brahma, Vijaya, Godhuli, Pradosh, Nishita) evaluate to `overallTier = "avoid"` and are filtered out instead of defaulting to `"good"`.
## [2026-07-26] — Remove Redundant Home Button on Best Timings Page
- **MINOR update**: Removed the bottom Home button from the Results step in `src/app/page.tsx` since "Start Over" and "Change date and time" buttons are already present. Maintained the Home icon button for Method and Dates steps.
- Verified clean compilation via `npm run build`.
