# Shubh Samay — Bug Fix Log

Append-only log of bug fix attempts across the project lifecycle, per Section 5 of the Master Prompt protocol.

## 2026-07-25 — Past Time Selectable in Time Window for Today
**Issue:** `Math.floor` in `currentDecimalHour` calculation allowed selecting a "From" time that had already passed (e.g., selecting 7:00 PM when it's 7:18 PM).  
**Fix:** Changed `Math.floor` to `Math.ceil` so the "From" dropdown only shows slots that haven't started yet.  
**Related:** `Math.ceil` of the now-truncation-safe `currentDecimalHour` was replaced with the raw value to avoid skipping the first valid half-hour slot.  
**Files:** `date-picker.tsx` lines 153, 405.

## 2026-07-23 — Fix Choghadiya Sequence and Yamaganda Offsets
**Issue:** Choghadiya calculation contained non-existent "Dudh" entry; Yamaganda offsets had invalid index mapping.  
**Fix:** Corrected Choghadiya sequence to 7 planetary Grahas (`Udveg, Amrit, Rog, Labh, Shubh, Char, Kaal`) with weekday lord rotation. Fixed Yamaganda offset array to `[4, 3, 2, 1, 0, 6, 5]`.  
**Result:** Verified against Drik Panchang standards for IST timings.

