# GitHub Actions Issues Log

*(Append-only. Log CI/CD problems and fixes here.)*

## [2026-07-26] Unable to resolve action rhais/upload-google-play
- **Error:** `Unable to resolve action rhais/upload-google-play, repository not found`
- **Cause:** Action reference `rhais/upload-google-play` was unavailable or non-existent in GitHub Marketplace.
- **Fix:** Switched to standard Marketplace action `rskress/play-store-api-action@v1` which accepts `serviceAccountJson`, `packageName`, `aabFile`, and `track`.

