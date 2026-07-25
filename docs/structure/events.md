# Events & Scoring Engine Module (`events.md`)

## Overview
The Events & Scoring Engine (`src/lib/events.ts` and `src/app/api/timings/route.ts`) defines rules for 18 life event categories, maps event requirements to panchang calculation methods, evaluates 30-minute time slots, and assigns cumulative tiers (`Highly Auspicious`, `Auspicious`, `Good`).

## Files
- `src/lib/events.ts` — Event catalog, default method recommendations, method weight maps, slot evaluation algorithms, and cumulative tier bucketing.
- `src/app/api/timings/route.ts` — POST endpoint receiving event parameters and returning best timing recommendations.

## Event Categories (18 Total)
1. Marriage / Wedding (લગ્ન)
2. Housewarming / Griha Pravesh (ગૃહ પ્રવેશ)
3. Vehicle Purchase (વાહન ખરીદી)
4. Property / Real Estate Purchase (મિલકત ખરીદી)
5. Business / Office Opening (વેપાર / દુકાન ઉદ્ઘાટન)
6. Gold / Jewelry Purchase (સોનું / દાગીના ખરીદી)
7. Naming Ceremony / Namkaran (નામકરણ)
8. Engagement / Ring Ceremony (સગાઈ)
9. Job / Career Start (નોકરી / કાર્ય પ્રારંભ)
10. Medical / Surgery (તબીબી / ઓપરેશન)
11. Travel / Journey Start (યાત્રા / પ્રવાસ પ્રારંભ)
12. Education / Vidyarambha (વિદ્યારંભ)
13. Mundan / Head Shaving (મુંડન સંસ્કાર)
14. Foundation Stone / Bhumi Pujan (ભૂમિ પૂજન)
15. Agreement / Contract Signing (કરાર હેતુ)
16. Investment / Financial Start (રોકાણ / નાણાકીય શરૂઆત)
17. Temple Visit / Puja (પૂજા / ધાર્મિક કાર્ય)
18. Other Important Event (અન્ય મહત્વપૂર્ણ કાર્ય)

## Cumulative Tier Rule
- Slots are classified into `Highly`, `Auspicious`, `Good`, or `Avoid`.
- **Cumulative Bucketing:**
  - `Highly` count = slots with `overallTier === "highly"`
  - `Auspicious` count = `Highly` + slots with `overallTier === "auspicious"`
  - `Good` count = `Auspicious` + slots with `overallTier === "good"`

