# Shubh Samay — Engine Correctness & Astrological Depth Roadmap

**Purpose of this document:** This is a verified, code-level audit and execution plan for `src/lib/events.ts`, `src/lib/time-divisions.ts`, and `src/lib/panchang.ts`. It was produced by cross-checking four independent AI audits (GLM 5.2, Gemini, GPT 5.2, Grok 4.5) against the actual production TypeScript, and rejecting claims that didn't hold up. Follow this document as the source of truth for this workstream — do not re-derive priorities from the raw AI audit transcripts.

**Protocol note:** Per `docs/masterprompt.md` Section 8.2, this is non-trivial work — break it into the Phases below, and within each Phase, the listed Tasks. Do not start Phase N+1 until every Task in Phase N is verified complete. Log every task to `CHANGELOG.md` per Section 8.3. Anything touching `docs/product.md`'s claims must be corrected per Rule 25 (never let an inferred/unbuilt feature read as confirmed fact).

---

## How to use this document

1. Read every phase before starting Phase 0 — later phases depend on earlier ones (especially Phase 1 unlocking Phase 2).
2. Run the Reasoning Loop (masterprompt Section 8.1) before touching `classifySlot` — it is the single most central function in the engine and every event depends on it.
3. Do not skip the verification step at the end of each phase.
4. Phase 3 requires an explicit go/no-go decision from the product owner before any code is written — do not build ahead of that decision.

---

## Phase 0 — Correctness Bugs (ship first, no debate)

These are not astrology opinions. They are internal inconsistencies confirmed directly in the code — either the engine contradicts itself, or it contradicts what `docs/product.md` already claims.

### Task 0.1 — Fix the boundary/instant evaluation bug

**The problem:** In `classifySlot` (`src/lib/events.ts`), these calls only ever receive the slot's *start instant*:

```typescript
const tithi = getTithi(date);
const nakshatra = getNakshatra(date);
const yoga = getYoga(date);
const vara = getVara(date);
```

No `slotEnd` is ever computed or passed to `getTithi`, `getNakshatra`, `getYoga`, or `getVara`. Compare this to `classifyMuhurat`, which does it correctly:

```typescript
const slotEnd = new Date(date.getTime() + 30 * 60000);
const overlaps = (start: Date, end: Date) => date < end && slotEnd > start;
```

**Effect:** A 30-minute slot can be labeled by a Tithi/Nakshatra/Yoga that is about to expire 1–2 minutes into the slot, or that hasn't even started yet at the slot's midpoint. This is highest-risk for Surgery/Medical, where a slot marked "safe" at `10:00` could tip into a malefic Nakshatra by `10:15` while still being shown as clean.

**Fix:** Compute `slotEnd = date + 30min` at the top of `classifySlot` (mirroring `classifyMuhurat`'s pattern). Change `getTithi`, `getNakshatra`, `getYoga`, and `getVara` to either:
- Accept a `[start, end]` range and return the value that's active at the *midpoint*, with a boolean flag if the value changes within the slot, OR
- Provide a companion `getXAtRange(start, end)` that returns `{ value, changesWithinSlot: boolean }`, and have `classifySlot` treat any slot where a value changes mid-slot as capped to one tier below its best value (never silently ignored).

Pick whichever pattern is less invasive to the rest of the codebase, but the "changes mid-slot" case must never be silently dropped.

**Do not skip this before Task 0.4 / 0.5.**

### Task 0.2 — Fix `findBestRecommendedTiming` ignoring the event's selected methods

**The problem:** In `findBestRecommendedTiming`:

```typescript
const ALL_METHODS: MethodId[] = ["choghadiya", "hora", "tithi", "nakshatra", "yoga", "muhurat"];
const results = findBestTimings(dates, event, ALL_METHODS, loc, { ... });
```

This is hardcoded and ignores the event's actual `recommendedMethods` (e.g. Vehicle Purchase only uses `["choghadiya", "hora", "nakshatra"]` in Auto mode). Per `docs/decisions.md` (2026-07-25 entry), this was an intentional design choice for the "Multi-Method Engine," not an accidental oversight — so this is a **product decision**, not a silent revert.

**Decision (already made — implement this):** Keep the wider `ALL_METHODS` scan for the hero card (it genuinely finds the single best moment across all Vedic factors), but make the reasoning transparent. Add a short "Also considers: {factor}" line to the Best Recommended Timing card UI whenever the winning slot includes a tier-relevant factor **outside** the event's visible `recommendedMethods` list (e.g. "Also: Tithi Dashami, Yoga Siddha"). This resolves the "why is this the best slot when I can't see why" confusion without weakening the scan.

**Files touched:** `src/lib/events.ts` (`findBestRecommendedTiming`), `src/components/wizard/results-view.tsx` (hero card display).

### Task 0.3 — Wire Karana/Bhadra (Vishti) into `classifySlot`

**The problem:** `getKarana` exists and is fully implemented in `src/lib/panchang.ts`, but `classifySlot` never calls it. Vishti Karana (Bhadra) is a real, classically significant malefic period that your engine currently silently ignores.

**Hard dependency — read before implementing:** Karana changes roughly every ~6 hours — more frequently than Tithi, Choghadiya (~90 min), or Hora (~60–70 min). **Do not wire Karana into `classifySlot` until Task 0.1's boundary/range-checking fix is complete and verified.** If you add Karana using only start-instant evaluation (as one early audit suggested with a one-line `if (getKarana(date).index === 6) return avoid`), you will introduce a *worse, higher-frequency* version of the exact bug Task 0.1 fixes.

**Fix, once 0.1 is done:**
```typescript
if (getKaranaAtRange(date, slotEnd).value === 6 /* Vishti */) {
  overallTier = "avoid";
  // add to reasons_en / reasons_gu: "Karana: Vishti (Avoid)"
}
```
Apply this as a hard disqualifier at the top of the overall-tier computation, using the same range-aware helper built in Task 0.1 — not a separate start-instant check.

### Task 0.4 — Correct `product.md` claims that don't match the code

**The problem:** `docs/product.md` and `docs/structure/events.md` currently do not claim per-event Nakshatra logic exists (this was clarified correctly in your prior Q&A round). However, two events in your original Q&A responses implied event-specific behavior (Naming Ceremony's "gentle Nakshatra subset", Buying Property's "stable/fixed Nakshatra") that **does not exist in the current `classifySlot` implementation** — `classifyNakshatra(nakshatra.index)` takes no `event` parameter anywhere in the codebase.

**Fix:** This will be resolved by Phase 2 (building the real per-event logic). Until Phase 2 ships, if any in-app copy or doc claims event-specific Nakshatra filtering for these two events, correct it to state the current (global) behavior, per masterprompt Rule 25. Do not let unbuilt behavior read as shipped.

### Phase 0 Verification (required before Phase 0.5)

Before marking Phase 0 done:
1. Pick one known date + city (recommend Ahmedabad) where a Tithi, Nakshatra, **and** Karana change occurs mid-afternoon.
2. Manually confirm a 30-minute slot straddling each boundary is now scored using the correct in-range value (or correctly capped/flagged if the value changes mid-slot).
3. Confirm the hero card's "Also considers" line appears correctly when the winning slot uses a factor outside the event's `recommendedMethods`.
4. Confirm a slot in an active Vishti Karana window is now hard-disqualified.
5. Log this as a dated entry in `docs/bugs.md` (per masterprompt Section 8.3 — this file is never deferred to a changelog merge).

---

## Phase 0.5 — Do NOT build this (explicitly killed workstream)

**Vara (weekday) table edits have zero effect on `overallTier` in the current code**, and this must not be "fixed" by editing `EVENT_VARAS` arrays.

**Evidence:**
```typescript
const varaTier = classifyVara(vara.index, event);
classification.vara = { name_en: vara.name_en, name_gu: vara.name_gu, tier: varaTier };
if (varaTier !== "avoid") {
  addReason(varaTier, ...);
}
```
`varaTier` is computed and shown as a **display chip only**. It is never pushed into the `tiers` array used for the overall-tier average. This matches `docs/decisions.md`'s 2026-07-25 entry ("Vara MUST NEVER degrade or alter overall tier") — this is working as designed, not a bug.

**Action:** Do not implement any suggestion (from any external audit) to flip specific weekdays between tiers (e.g. "Tuesday should be highly favorable for Surgery/Legal Filing," "swap Tuesday and Saturday for Surgery"). These would only recolor a cosmetic chip and would change nothing about which slots users actually see or how they're ranked. If Vara should genuinely affect scoring again, that is a separate, explicit product decision (not an engineering task) — flag it to the product owner rather than quietly re-enabling it as part of unrelated work.

**Astrological note for the product owner:** treat any claim that "Tuesday/Mars is good luck for surgery" as an unverified minority reframe, not settled guidance — most consumer panchang references and classical medical-muhurta sources treat Mars/Tuesday as a caution association for surgery (blood, injury), not a favorable one. Do not adopt this without an independent second source.

---

## Phase 1 — One Extensibility Fix (unlocks all of Phase 2)

**Decision:** Do not build a new `EventOverride` interface / `overrides/` folder / registry-map architecture. The codebase already has the correct pattern, unused on three of four classifiers:

```typescript
classifyVara(vara.index, event)      // ALREADY event-aware
classifyTithi(tithi.index)           // NOT event-aware
classifyNakshatra(nakshatra.index)   // NOT event-aware
classifyHora(slotHora.name_en)       // NOT event-aware
classifyYoga(yoga.index)             // NOT event-aware
```

### Task 1.1 — Extend `classifyTithi`, `classifyNakshatra`, `classifyYoga`, `classifyHora` to accept `event` as a second parameter

Mirror the existing shape of `classifyVara(index, event)` exactly. Internally, each function should:
1. Check for an event-specific branch/override table for the given `event`.
2. Fall back to current global tier behavior when no event-specific rule exists.

This must be a **strictly additive** change — every event without an explicit override must produce byte-identical output to today. Verify this explicitly (see Phase 1 verification below) before proceeding to Phase 2.

### Phase 1 Verification

1. For every one of the 19 events, run a spot-check date and confirm `overallTier` and all reason strings are unchanged from pre-Phase-1 behavior (since no overrides exist yet).
2. Only once this is confirmed does Phase 2 begin.

---

## Phase 2 — Event-Specific Tuning (depends on Phase 1)

Ordered by: user-facing risk if wrong, whether `docs/product.md` already (incorrectly) implies this exists, and implementation cost now that Phase 1 exists.

### Task 2.1 (P0) — Surgery/Medical: add Nakshatra with a safety-oriented override
Add `nakshatra` to Surgery's `recommendedMethods`. Using the new `classifyNakshatra(index, event)` hook, add a `surgery-medical` branch that treats classically-flagged inauspicious-for-surgery Nakshatras (e.g. Bharani, Krittika, Ashlesha) as `avoid`, overriding their global tier. This is currently the **only** event with zero Nakshatra check, and it's the highest-stakes event in the catalogue.

### Task 2.2 (P0) — Buying Property: add Nakshatra, implement the "stable/fixed" logic
Add `nakshatra` to `recommendedMethods` for `buying-property`. Add a `buying-property` branch in `classifyNakshatra` that boosts Sthira (fixed) Nakshatras (Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada) by one tier, within the bounds of their existing global tier (never override an `avoid` global tier to something better).

### Task 2.3 (P0) — Naming Ceremony: implement the real "gentle Nakshatra" whitelist
Add a `naming-ceremony` branch in `classifyNakshatra` that restricts `highly`/`auspicious` results to the actual gentle set (Rohini, Mrigashira, Hasta, Swati, Anuradha, Revati), demoting anything else (including Magha, which some traditions treat as less suitable for naming a newborn) by one tier from its global value.

### Task 2.4 (P1) — Legal Filing: Mars Hora override
Add a `filing-case` branch in `classifyHora` that reclassifies Mars Hora as `good` (not `highly`, not `avoid`) specifically for this event. Do not upgrade it further than `good` — litigation-favorable framing for Mars is real but should not override the caution generally associated with malefic-tier planets.

### Task 2.5 (P1) — Marriage: tighten Nakshatra/Tithi within the existing global tier
Add a `marriage` branch in `classifyNakshatra` and `classifyTithi`:
- Demote Magha from `highly` to `auspicious` (conditional/pitru association in several traditions).
- Demote Purnima from `highly` to `auspicious` in `classifyTithi`.
- Do not build a separate Vivah Nakshatra/Tithi whitelist system — use the same override-branch pattern as other events, just with these two specific demotions.

### Task 2.6 (P2) — Haircut/Shaving: add Nakshatra
Currently the weakest event (Choghadiya + Hora only, zero Tithi/Nakshatra despite classical Smriti guidance leaning heavily on both). Add `nakshatra` to `recommendedMethods`; no override branch required yet — global tier is an acceptable starting point here.

### Task 2.7 (P2) — Business Start: optional Nakshatra boost
Add a `business-start` branch in `classifyNakshatra` giving a one-tier boost to Hasta and Chitra (craft/trade-associated Nakshatras), bounded by existing global tier ceiling.

**Explicitly NOT in Phase 2:**
- Any `EVENT_VARAS` table edits (see Phase 0.5).
- Mercury retrograde check for Agreement Signing — no clear classical Muhurta Shastra precedent as a hard disqualifier was verified; this is Western-astrology-influenced and needs a second source check before it goes near a hard tier cap. Move to Phase 3 research list if the product owner wants to pursue it.

### Phase 2 Verification
For each event touched, confirm:
1. The event's `recommendedMethods` array reflects the added method.
2. The override branch degrades gracefully (never promotes past an existing `avoid`/global ceiling incorrectly).
3. `docs/product.md` and `docs/structure/events.md` are updated to describe only what's now actually built (Phase 4 also covers this, but do it inline here rather than deferring).

---

## Phase 3 — Classical-Depth Additions (opt-in "Advanced Mode" — requires explicit go/no-go before building)

**Product decision, already made:** Marriage does not need a dedicated module or app fork. It needs the scoped, event-keyed override branches from Phase 1/2, plus — for the items below — an explicit **opt-in toggle**, default OFF. These checks can eliminate most or all slots on a given day; silently tightening Auto mode results is a real regression in perceived usefulness even when it's more classically correct.

**Do not start any row below without an explicit go/no-go from the product owner for that specific row.**

| Feature | Applies to | Pre-build research required | Status |
|---|---|---|---|
| Guru/Shukra combustion (Asta) | Marriage | Cross-check combustion orbs (candidate values seen: Venus 10°, Jupiter 11°) against at least one additional classical source before hardcoding — these vary by text | Needs verification, then build |
| Malmas / Adhik Maas / Sankranti month blocks | Marriage, Housewarming | Requires new solar-month tracking infrastructure — the engine does not track solar month/Sankranti at all today. This is materially new scope, not a tweak. | Size as its own mini-project; do not fold into Phase 2 estimates |
| Dishashool (directional travel restriction) | Travel | Classical tables vary by regional tradition; requires new UI (ask travel direction) plus a chosen, sourced table | Needs a chosen source + UI change before building |
| Lagna Shuddhi (Ascendant purity) | Marriage | Requires a genuine Ascendant calculation (local sidereal time, oblique ascension) — a different calculation class from the existing Panchang engine | Out of scope for now; flag as a possible future "Marriage Pro" feature, not a patch |
| Mercury retrograde check | Agreement Signing | Precedent as a hard disqualifier unclear; low priority | Defer; research first |

---

## Phase 4 — Trust & Honesty Pass (cheap, run in parallel with Phase 2)

1. Reconcile `docs/product.md` and `docs/structure/events.md` against whatever Phase 2 actually ships — no feature should be described as working before its Task above is verified complete.
2. Add scope disclaimers to Marriage, Naming Ceremony, and Surgery/Medical in-app copy — e.g. "Based on Panchang timing calculations; does not include birth-chart matching or medical advice." Cheap, and directly addresses the single most common gap flagged across all four external audits.

---

## Standing QA Recommendation (run once, independent of phase)

Pick one known date and city (Ahmedabad recommended) and manually cross-check against DrikPanchang:
- Sunrise/sunset time
- Tithi end time
- Nakshatra end time
- Rahu Kaal window
- One full day's Choghadiya sequence (day + night)
- One full day's Hora sequence (day + night)

Run this **before** Phase 0's boundary-range fix, not after — confirm the baseline astronomical values are correct before changing how ranges are evaluated around them. If any of these are off, resolve that first; a boundary fix built on top of a wrong Tithi-end time just relocates the error.

**Open item:** the exact Ayanamsa formula/source used in `panchang.ts` has not yet been confirmed (linear Lahiri approximation vs. a full precession-corrected Lahiri routine). This affects long-range date accuracy. Flag for the next session if `panchang.ts`'s ephemeris/ayanamsa section can be shared.

---

## Sequencing Summary

1. **Phase 0** — ship correctness fixes (boundary bug, `findBestRecommendedTiming`, Karana wiring, docs correction). Non-negotiable.
2. **Phase 0.5** — explicitly do not touch `EVENT_VARAS` tables.
3. **Phase 1** — one extensibility change (event-aware `classifyTithi`/`classifyNakshatra`/`classifyYoga`/`classifyHora`), strictly additive, verified against all 19 events before proceeding.
4. **Phase 2** — event-specific tuning, in the priority order listed (Surgery → Property → Naming → Legal → Marriage → Haircut → Business).
5. **Phase 4** — can run in parallel with Phase 2.
6. **Phase 3** — paused pending explicit per-row go/no-go from the product owner; do not build ahead of this.

Log all Phase 0–2 and Phase 4 work per `docs/masterprompt.md` Section 8.3 (`CHANGELOG.md` immediately, `docs/bugs.md` and `docs/improvements.md` in real time, `docs/permissions.md` not applicable here). Fold into `docs/decisions.md`, `docs/product.md`, and the relevant `docs/structure/[module].md` files at the next changelog merge.
