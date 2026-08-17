# CHANGELOG

Working log for task summaries per Section 8.3 of the Master Prompt protocol. Entries here are merged into permanent documentation files upon request.

## [2026-08-17] — MINOR: Fixed CI/CD GitHub Actions Play Store Workflow for Next.js & Android
- **GitHub Actions Workflow Migration (`.github/workflows/playstore.yml`)**:
  - Removed outdated Flutter build steps and deleted `Dartrebuilt/app` directory reference causing CI action failure.
  - Replaced pipeline with automated Node.js 20 static export (`npm ci`, `npm run lint`, `npm run build:android`).
  - Added Java 17 Temurin, Gradle wrapper setup, keystore decoding, and `./gradlew bundleRelease` signed AAB packaging with automatic `VERSION_CODE` from GitHub run number.
  - Configured AAB artifact archiving and automatic upload to Google Play Store internal testing track.
- **ESLint Config**: Removed obsolete `Dartrebuilt/**` entry from ignore rules in `eslint.config.mjs`.

## [2026-08-17] — MINOR: Applied Agent Reliability Improvement Guide
- **Single Source of Truth Rule Architecture (Step 1)**:
  - Preserved global universal behavior rules (Standing Rules 1–19, Multi-location Edit Protocol, MCP & Post-edit Quality Gate) in `~/.gemini/config/rules/agents.md`.
  - Streamlined project-level `AGENTS.md` to the thin template containing only Shubh Samay project metadata, doc read order, project-specific rules, and active MCP servers.
  - Copied `AGENTS-improvement-guide.md` to `docs/AGENTS-improvement-guide.md` for permanent documentation.
- **Hook Enforcement Layer (Step 2)**:
  - Configured global Antigravity lifecycle hooks in `~/.gemini/config/hooks.json` with `PreToolUse` safety validation scripts (`~/.gemini/config/scripts/hooks/pre-edit-guard.js`) to enforce secret protection and edit verification.

## [2026-08-17] — MAJOR Update: Global Location Sync Engine, Dedicated Smooth City Selector, Android Hardware Back Navigation, Dynamic Solar Sky Track & Performance Engine
- **Global Location Engine Sync (`GLOBAL_LOCATION_CHOGHADIYA_HORA_SYNC_GUIDE.md`)**:
  - Implemented `getStartOfCivilDayInTz` and `getEndOfCivilDayInTz` in `src/lib/time-utils.ts` for timezone-safe civil boundary calculations.
  - Updated `getSunrise` and `getSunset` in `src/lib/panchang.ts` with 2-day search window from `midnightUT` for international robustness.
- **Dedicated Smooth City Selector & 33 Gujarat Districts + Top Global Cities Database (Bug Fix)**:
  - Fixed mobile Sheet scroll trap bug by creating `CitySelectModal` (`src/components/city-select-modal.tsx`) with search, category tabs (All, Gujarat 33 Districts, India, USA, UK, Canada, Australia, UAE / Gulf, Global), and smooth `touch-pan-y overscroll-contain` scrolling.
  - Expanded `CITIES` in `src/lib/events.ts` to include all 33 Gujarat districts + prominent industrial hubs (Gandhidham, Vapi, Ankleshwar), top Indian metros, and top 5 cities for major global countries.
- **Home Page Panchang Card Vertical Centering & Sub-lines**:
  - Vertically centered all values in the exact middle of the tiles in `src/components/wizard/panchang-today.tsx`.
  - Added Lord sub-lines for Vara (`Lord: Sun` / `સ્વામી: સૂર્ય`) and Nakshatra for visual balance and symmetry.
- **Dynamic Celestial Sun Tracker with Solar Progress & Time-of-Day Transitions**:
  - Upgraded `src/components/wizard/sun-tracker-card.tsx` with dynamic Sun SVG indicator traveling along the track based on solar progress `(now - sunrise) / (sunset - sunrise)`.
  - Morning: Golden glow (`#F59E0B`); Midday: Radiant bright yellow (`#FACC15`); Evening: Warm dusk orange (`#EA580C`) with softened glow. Live countdown pill ("Sunset in 3h 15m").
- **Date Picker UI Symmetrical Parity & Button Renaming**:
  - Re-aligned Individual Date UI with Date Range UI in `src/components/wizard/date-picker.tsx` with matching status helper, Add Date action button, and chip indicators.
  - Renamed action button in `src/lib/i18n.ts` and `src/app/page.tsx` to **Auspicious Timing** (`શુભ સમય`) with `Moon` icon.
- **Android Hardware Back Button Navigation & Exit Confirmation Modal**:
  - Handled `popstate` events in `src/app/page.tsx`: pressing Android hardware back on any step (dates, method, results) navigates back to Home (`event`), and pressing back on Home triggers an Exit Confirmation Modal.
- **Performance Optimization (UI Sticking / Lag Fix)**:
  - Extracted 1-second live clock into `<LiveHeaderDateTime />` component, eliminating 1-second full-tree re-renders of `ShubhSamayApp`.
- **Verified Build**: Recompiled static Next.js production build (`npm run build`) with zero errors.

## [2026-08-16] — MAJOR Update: Icon-Only Location Header, Android GPU Hardware Acceleration, Results Home Button & Zero Horizontal Scroll
- **Icon-Only Header Location**: Updated `LocationSearch` to a circular icon button (`MapPin` / `Loader2`), removing the city text from the header for an uncluttered and spacious top bar.
- **Android GPU Hardware Acceleration**: Enabled `mWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null)` and `hardwareAccelerated="true"` in `MainActivity.java` and `AndroidManifest.xml` for 60-120fps smooth animations and zero UI lag on mobile.
- **Results Page Quick Home**: Added Home button at top header of `ResultsView` and alongside "Change date and time" button for 1-tap instant return to start.
- **"Others" as 1st Event Tile**: Reordered `EVENTS` in `src/lib/events.ts` so "Others" appears as the very first tile in the event selection grid.
- **Event Card Sub-text Cleanup**: Removed secondary description subtitle text from `EventPicker` cards, leaving clean emoji + title cards.
- **Full Tithi Timings Display**: Removed `truncate` on `sub` in `panchang-today.tsx` `Cell` component so time ranges like `5:29 PM – 4:18 PM` display fully without clipping.
- **Zero Horizontal Scrollbar**: Enforced `overflow-x: hidden; width: 100%; max-width: 100vw;` on `html`, `body`, and adaptive button widths in `page.tsx` and `globals.css`.
- **Verified Build**: Recompiled static export and Android APK with Gradle (`assembleDebug`) — 100% clean build.

## [2026-08-16] — MAJOR Update: Android Launcher Icons, Geolocation Runtime Permissions, DayNight Theme & Header Responsiveness
- **App Icons Everywhere**: Generated crisp, multi-density launcher icons (`ic_launcher.png` and `ic_maskable.png` across mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi mipmaps and drawables) from `store_icon.png`, removing all legacy icons on APK installation popups and app launchers.
- **Android Runtime Geolocation Permissions**: Implemented native `ActivityCompat.requestPermissions` and `onRequestPermissionsResult` in `MainActivity.java` for `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION` so tapping "Get current location" prompts the Android OS permission dialog properly.
- **Day/Night System Theme Detection**: Switched Android application theme to `Theme.AppCompat.DayNight.NoActionBar` in `AndroidManifest.xml` so WebView `prefers-color-scheme` correctly follows system Light Mode and Dark Mode.
- **Responsive Header Layout**: Adjusted `LocationSearch` button max-width (`max-w-[105px]` on mobile) and font sizes in `src/app/page.tsx` and `location-search.tsx` so "Today's Panchang" and the date never truncate or get cramped on small phone screens.
- **Verified Build**: Recompiled static export and Android APK with Gradle (`assembleDebug`) — 100% clean build.

## [2026-08-16] — MAJOR Fix: Native Android WebViewAssetLoader & AAPT Underscore Directory Packaging
- **AAPT Asset Packaging Fix**: Added `aaptOptions { ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~' }` to `android-app/build.gradle`. Android's default AAPT packaging rules silently strip any directory starting with `_` (like Next.js `_next`), causing all CSS and chunk stylesheets to be dropped from the APK. Overriding the pattern ensured all 41 assets, CSS stylesheets (`0ljfm4fzpkbbb.css`, `3ai9y4h5qepc9.css`), and JS chunks are packaged into the APK.
- **WebViewAssetLoader**: Implemented `WebViewAssetLoader` with `AssetsPathHandler` in `MainActivity.java` to intercept `https://appassets.androidplatform.net/` requests and serve bundled Next.js static files locally with full HTTPS origin security.
- **Root-relative pathing**: Removed `assetPrefix: './'` from `next.config.ts` so Next.js generates standard root-relative paths (`/_next/static/...`), cleanly resolved by the asset handler without CORS or routing errors.
- **Verified Build**: Successfully compiled Next.js export (`npm run build:android`) and assembled native Android debug APK (`android-app-debug.apk` 6.49 MB) via Gradle with all CSS stylesheets present.

## [2026-08-15] — MINOR Fix: Global Rules Plugin Setup & ESLint Configuration Ignore
- **Global Rules Packaging**: Packaged universal engineering guidelines (`coding-style.md`, `git-workflow.md`, `hooks.md`, `patterns.md`, `performance.md`, `security.md`, `testing.md`, `agents.md`) into `~/.gemini/config/plugins/global-engineering-rules/` with a standard `plugin.json` manifest for automatic global ingestion.
- **ESLint Ignores [MINOR]**: Updated `eslint.config.mjs` to ignore compiled Android asset files (`android-app/**`) and `Dartrebuilt/**` from lint scanning, resulting in 0 errors on `npm run lint`.

## [2026-07-29] — MAJOR Fix: Standalone Local Android WebView Conversion & Asset Path Handler Fix
- **MAJOR fix**: Converted Android app from a Bubblewrap TWA pointing to `https://shubhsamay.app/` into a Standalone Local Android WebView Application using `WebViewAssetLoader`.
- **CSS & Image asset path fix**: Fixed unstyled plain text UI issue by updating `WebViewAssetLoader` in `MainActivity.java` to map path handler to `/` (`https://appassets.androidplatform.net/index.html`). This allows `/_next/static/css/...`, JS chunks, and `/logo.png` to resolve 1:1 against `android-app/src/main/assets/`.
- `src/lib/client-api.ts`: Implemented `computePanchangClient` and `computeTimingsClient` to execute all calculations client-side using `astronomy-engine`.
- `next.config.ts`: Set `output: 'export'` and `images: { unoptimized: true }` for static HTML export.
- `android-app/src/main/java/com/rutambh/shubhsamay/MainActivity.java`: Created native `WebView` launcher loading `https://appassets.androidplatform.net/index.html` with Geolocation permission support.
- `android-app/src/main/AndroidManifest.xml`: Registered `MainActivity` as `LAUNCHER` activity and removed TWA activities (`LauncherActivity`, `DelegationService`).
- `package.json`: Updated `build:android` script to export static files and sync into `android-app/src/main/assets/`.
- `twa-manifest.json` & `android-app/build.gradle`: Updated host to `appassets.androidplatform.net` and removed `shubhsamay.app` URLs.
- `.github/workflows/playstore.yml`: Updated CI/CD step to run `npm run build:android` before Gradle bundle compilation.

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
