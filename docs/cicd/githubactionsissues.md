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

