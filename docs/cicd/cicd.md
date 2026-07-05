# Shubh Samay — CI/CD

**Status:** Not yet configured. Pipeline will use GitHub Actions → signed AAB → Play Store.

## Conventions (from masterprompt)
- Keystore: `rutambhapps.jks`
- Keystore alias: `rutambh-shubhsamay`
- Package name: `com.rutambh.shubhsamay`
- Pipeline: GitHub Actions → signed AAB → Play Store

## Before setting up CI/CD
Ask the human for:
1. App name (confirmed: Shubh Samay)
2. Package name (confirmed: `com.rutambh.shubhsamay`)
3. GitHub repo URL

## Secret names (values go in `docs/cicd/secrets/`, never committed)
- `KEYSTORE_BASE64` — base64-encoded `rutambhapps.jks`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`
- `PLAY_STORE_SERVICE_ACCOUNT_JSON`

## Build (non-PWA web deploy)
```bash
npm run build
```
Outputs to `.next/standalone/`. This is a Next.js web app, not a native Android app — CI/CD will deploy the web build, not an AAB.
