# GitHub Actions Issues Log

*(Append-only. Log CI/CD problems and fixes here.)*

## [2026-07-26] Unable to resolve action rhais/upload-google-play
- **Error:** `Unable to resolve action rhais/upload-google-play, repository not found`
- **Cause:** Action reference `rhais/upload-google-play` was unavailable or non-existent in GitHub Marketplace.
- **Fix:** Switched to standard Marketplace action `rskress/play-store-api-action@v1` which accepts `serviceAccountJson`, `packageName`, `aabFile`, and `track`.

## [2026-07-26] Unable to resolve action rskress/play-store-api-action
- **Error:** `Unable to resolve action rskress/play-store-api-action, repository not found`
- **Cause:** Action `rskress/play-store-api-action` was missing or non-existent in GitHub Marketplace.
- **Fix:** Switched to `r0adkll/upload-google-play@v1`, the official standard GitHub Action for Google Play Store uploads with `serviceAccountJsonPlainText`, `packageName`, `releaseFiles`, `track`, and `status`.

## [2026-07-26] npm ci package-lock.json out of sync
- **Error:** `npm error 'npm ci' can only install packages when your package.json and package-lock.json are in sync.`
- **Cause:** `package-lock.json` was missing entries for packages like `yjs` and `@swc/helpers`.
- **Fix:** Ran `npm install` locally to update `package-lock.json` and updated workflow step to `npm install` for CI resilience.

## [2026-07-26] sh: 1: powershell: not found during npm run build in Linux CI
- **Error:** `sh: 1: powershell: not found (exit code 127)`
- **Cause:** `package.json` build script used Windows-specific `powershell` command to copy standalone files.
- **Fix:** Replaced `powershell` command in `package.json` with cross-platform Node.js `fs.cpSync` script that works identically on Windows, Linux, and macOS.

## [2026-07-26] Bubblewrap JDK interactive prompt in headless CI
- **Error:** `? Do you want Bubblewrap to install the JDK (recommended)? (exit code 130)`
- **Cause:** `@bubblewrap/cli build` requested interactive user confirmation to configure JDK path on headless runner.
- **Fix:** Pre-created `~/.bubblewrap/config.json` with `jdkPath` ($JAVA_HOME) and `androidSdkPath` ($ANDROID_HOME) and piped `yes 'n'` to build non-interactively.

## [2026-07-26] Bubblewrap twa-manifest.json checksum prompt loop
- **Error:** `No checksum file was found to verify the state of the twa-manifest.json file. Would you like to regenerate your project?`
- **Cause:** `@bubblewrap/cli build` expected `twa-manifest-checksum.json` containing `{"checksum": "<sha256-hash>"}`.
- **Fix:** Updated workflow step to generate `twa-manifest-checksum.json` with `{ checksum: hash }` matching `twa-manifest.json` on every build run.

## [2026-07-26] Transition to direct Gradle build & signing action
- **Issue:** `@bubblewrap/cli build` continuously prompted for interactive input in headless CI environments.
- **Cause:** `@bubblewrap/cli` wrapper CLI is designed for interactive CLI wizards.
- **Fix:** Switched to direct `./gradlew bundleRelease` compilation and `r0adkll/sign-android-release@v1` signing, eliminating all interactive CLI prompts.

## [2026-07-26] Play Store upload releaseFiles glob pattern
- **Issue:** `r0adkll/upload-google-play@v1` step failed during artifact resolution.
- **Cause:** Specific relative file path vs glob pattern match.
- **Fix:** Updated `releaseFiles` to `app/build/outputs/bundle/release/*.aab` glob pattern with direct `serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT_JSON }}` input.


