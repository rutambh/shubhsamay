# Shubh Samay — Access Control & Data Visibility Ground Truth

This document defines the permanent data access and visibility rules for Shubh Samay, per Section 5 of the Master Prompt protocol.

## Architecture Overview
Shubh Samay is a client-side mobile-first Next.js PWA. All astronomical calculations (Panchang, Choghadiya, Hora, Tithi, Nakshatra, Yoga, Muhurat) are generated on-the-fly per request using `astronomy-engine`. 

No user account data, private notes, or multi-tenant database state is persisted or transmitted to external servers.

## Access Control Matrix

| Entity | Read Access | Write Access | Enforcement Mechanism | Status | Negative Test Verified |
|---|---|---|---|---|---|
| **Location & Coordinates** | Client device only | Client user (city search / popover) | In-memory React state + ephemeral API payload (`/api/timings`, `/api/panchang`) | `[Verified]` | N/A (Client-only) |
| **Language Preference** | Client device only | Client user | Browser `localStorage` key `shubh_samay_lang` | `[Verified]` | N/A (Client-only) |
| **Theme Preference** | Client device only | Client user | Browser `localStorage` (via `next-themes`) | `[Verified]` | N/A (Client-only) |
| **Panchang Calculations** | Public / Any client | None (Read-only API) | Pure function calculation in Next.js API routes (`/api/panchang`, `/api/timings`) | `[Verified]` | N/A (Public API) |
| **User & Post Models** (Prisma) | None (Unused scaffold) | None (Unused scaffold) | Unused database models in `prisma/schema.prisma` | `[Inferred from code]` | N/A (Unused scaffold) |

## Data Sharing Policy
- **Multi-user sharing:** None. There are currently no user accounts, shared family groups, or stored user profiles.
- **Third-party telemetry / ads:** None. No analytics, tracking pixels, or external database persistence.

