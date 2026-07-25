# Shubh Samay — Structure Index

Map of project modules to their dedicated documentation files in `docs/structure/` and codebase paths, per Section 5 of the Master Prompt protocol.

| Module | Documentation File | Primary Codebase Files | Description |
|---|---|---|---|
| **Panchang Engine** | `docs/structure/panchang.md` | `src/lib/panchang.ts`, `src/app/api/panchang/route.ts` | Tithi, Nakshatra, Yoga, Karana, Lahiri Ayanamsa, Sunrise/Sunset calculations |
| **Time Divisions Engine** | `docs/structure/time-divisions.md` | `src/lib/time-divisions.ts` | Choghadiya, Hora, Rahu Kaal, Yamaganda, Gulika time division engines |
| **Events & Scoring Engine** | `docs/structure/events.md` | `src/lib/events.ts`, `src/app/api/timings/route.ts` | 18 life event rules, method mappings, slot evaluation, cumulative tier scoring |
| **Wizard UI** | `docs/structure/wizard.md` | `src/app/page.tsx`, `src/components/wizard/*` | 4-step SPA wizard flow (Event, Method, Date, Results, Today's Panchang) |
| **Internationalization (i18n)** | `docs/structure/i18n.md` | `src/lib/i18n.ts`, `src/hooks/use-lang.tsx` | English & Gujarati string tables, LanguageContext, timezone formatting |
| **Location & Settings UI** | `docs/structure/location-settings.md` | `src/components/location-search.tsx`, `src/components/settings-button.tsx` | City search popover (24 Gujarat cities) and Theme/Language settings sheet |

