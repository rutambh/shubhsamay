# Shubh Samay — CI/CD

**Status:** Configured & Active. Pipeline uses GitHub Actions → Bubblewrap TWA → signed AAB → Google Play Store.

## Conventions (from masterprompt)
- Repository: `https://github.com/rutambh/shubhsamay`
- Keystore: `rutambhapps.jks`
- Keystore alias: `com.rutambh.shubhsamay`
- Package name: `com.rutambh.shubhsamay`
- Pipeline: GitHub Actions (`.github/workflows/playstore.yml`) → signed AAB → Play Store (Internal Track)

## Configured Workflow
Workflow File: `.github/workflows/playstore.yml`
- Triggers on push to `main` branch or manual execution (`workflow_dispatch`).
- Verifies Next.js web application (`npm run lint` & `npm run build`).
- Sets up Java 17 and Android SDK.
- **Automatically increments `versionCode`** using `${{ github.run_number }}` in `app/build.gradle` on every run.
- Builds Android App Bundle via `./gradlew bundleRelease`.
- Signs `.aab` using `r0adkll/sign-android-release@v1`.
- Deploys `.aab` to Google Play Store internal track via `r0adkll/upload-google-play@v1`.

## Repository Secret Names
Configure these in GitHub Repository Settings (`Settings -> Secrets and variables -> Actions`):
- `KEYSTORE_BASE64` — base64-encoded content of `rutambhapps.jks`
- `KEYSTORE_PASSWORD` — keystore password
- `KEY_ALIAS` — `com.rutambh.shubhsamay`
- `KEY_PASSWORD` — key password
- `PLAY_STORE_SERVICE_ACCOUNT_JSON` — Google Play Developer API service account JSON key content

## Local Web Build
```bash
npm run build
```
Outputs standalone Next.js server build to `.next/standalone/`.

