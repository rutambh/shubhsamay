# Master Architectural & Calculation Blueprint: Global Location Sync, Choghadiya, Hora & Panchang Engine

> **Origin Codebase:** `Tithi_App` (Tithi Mitra)  
> **Target Application:** `shubh_samay`  
> **Purpose:** Exhaustive reference and implementation guide to replicate high-precision astronomical calculations (Choghadiya, Hora, Mahurat, Tithi) with offline-first global location and timezone synchronization.

---

## Table of Contents
1. [Core Architectural Philosophy](#1-core-architectural-philosophy)
2. [Global Location & Timezone System](#2-global-location--timezone-system)
   - [Location Data Schema](#location-data-schema)
   - [The Timezone-Aware Math Problem & Solution (`wallClockToUtc`)](#the-timezone-aware-math-problem--solution-wallclocktoutc)
   - [GPS Acquisition, Curated City List & Haversine Matching](#gps-acquisition-curated-city-list--haversine-matching)
   - [Travel Detection & Timezone Mismatch Banner](#travel-detection--timezone-mismatch-banner)
3. [Solar Engine: Sunrise, Sunset & True Day Boundaries](#3-solar-engine-sunrise-sunset--true-day-boundaries)
   - [Civil Day (00:00–24:00) vs Astronomical Solar Day (Sunrise–Sunrise)](#civil-day-00002400-vs-astronomical-solar-day-sunrisesunrise)
   - [Astronomy.js Observer Integration & Polar Day/Night Handling](#astronomyjs-observer-integration--polar-daynight-handling)
   - [Calculation Caching Layer](#calculation-caching-layer)
4. [Choghadiya Calculation Engine (8 Day / 8 Night Segments)](#4-choghadiya-calculation-engine-8-day--8-night-segments)
   - [The 7 Choghadiya Types, Qualities & Colors](#the-7-choghadiya-types-qualities--colors)
   - [Planetary Sequences (Day & Night)](#planetary-sequences-day--night)
   - [The Pre-Sunrise (Yesterday Night) Rollover Algorithm](#the-pre-sunrise-yesterday-night-rollover-algorithm)
   - [Segment Duration & Active Index Calculation](#segment-duration--active-index-calculation)
5. [Hora Calculation Engine (12 Day / 12 Night Segments)](#5-hora-calculation-engine-12-day--12-night-segments)
   - [The 7 Planetary Horas & Qualities](#the-7-planetary-horas--qualities)
   - [Chaldean Planetary Order & Weekday Starting Formulas](#chaldean-planetary-order--weekday-starting-formulas)
   - [Day vs Night Offsets and 24-Hora Solar Day Subdivision](#day-vs-night-offsets-and-24-hora-solar-day-subdivision)
6. [Mahurat Calculation Engine (15 Day / 15 Night Segments)](#6-mahurat-calculation-engine-15-day--15-night-segments)
   - [The 30 Muhuratas & Abhijit Muhurat](#the-30-muhuratas--abhijit-muhurat)
   - [Subdivision & Active Segment Logic](#subdivision--active-segment-logic)
7. [Tithi & Lunar Engine](#7-tithi--lunar-engine)
   - [Real-Time Instantaneous Tithi vs Udaya (Sunrise) Tithi](#real-time-instantaneous-tithi-vs-udaya-sunrise-tithi)
   - [Moon-Sun Elongation & Continuous Segment Tracking](#moon-sun-elongation--continuous-segment-tracking)
   - [Gujarati Amanta Calendar, Hindu Months & Festival Overrides](#gujarati-amanta-calendar-hindu-months--festival-overrides)
8. [Global State Management & Reactive UI Integration](#8-global-state-management--reactive-ui-integration)
   - [Zustand Store Architecture](#zustand-store-architecture)
   - [Reactive Calculation Pipeline & Progress Percentages](#reactive-calculation-pipeline--progress-percentages)
   - [Live Clock Ticks & Transition Timers](#live-clock-ticks--transition-timers)
9. [Complete Code Reference Implementations](#9-complete-code-reference-implementations)
   - [`utils/time.js`](#utilstimejs)
   - [`utils/nearestCity.js`](#utilsnearestcityjs)
   - [`utils/locationService.js`](#utilslocationservicejs)
   - [`utils/panchangEngine.js` (Unified Choghadiya, Hora, Mahurat, Tithi)](#utilspanchangenginejs)
10. [Critical Pitfalls & Edge Cases To Avoid](#10-critical-pitfalls--edge-cases-to-avoid)

---

## 1. Core Architectural Philosophy

1. **100% Offline & Zero-Backend**: All calculations run locally on the client using astronomical equations (`astronomy-engine`). No network dependency for Panchang, Choghadiya, Hora, or Tithi.
2. **True Astronomical Anchoring**: Time segments in traditional Indian astrology (Choghadiya, Hora, Muhurat) are **NOT** fixed 60-minute or 90-minute clock blocks. They are dynamic solar divisions:
   - Day segments divide the interval from **actual local Sunrise to local Sunset** into equal parts.
   - Night segments divide the interval from **local Sunset to the next day's local Sunrise** into equal parts.
3. **Timezone Decoupling**: The user's target calculation location (e.g., Ahmedabad, London, New York) has its own IANA timezone. The calculation engine must compute civil days and sunrise times based on the **target location's timezone**, never polluted by the device's current system timezone.
4. **Single Source of Truth**: Location state in the central store (`useStore`) cascades to all views, widgets, notifications, and time-cycle displays automatically.

---

## 2. Global Location & Timezone System

### Location Data Schema

Store location state with full IANA timezone support and acquisition metadata:

```typescript
export interface AppLocation {
  state: string;           // e.g. "Gujarat" or "New York"
  district: string;        // e.g. "Ahmedabad" or "New York"
  city: string;            // e.g. "Ahmedabad"
  lat: number;             // e.g. 23.0225
  lng: number;             // e.g. 72.5714
  timezone: string;        // IANA identifier, e.g. "Asia/Kolkata", "America/New_York"
  label: string;           // e.g. "Ahmedabad, Gujarat, India"
  country: string;         // e.g. "India"
  source: 'gps' | 'manual' | 'default';
  lastSynced: string | null; // ISO timestamp
}
```

### The Timezone-Aware Math Problem & Solution (`wallClockToUtc`)

#### Why `date.setHours(0, 0, 0, 0)` Fails
Calling `date.setHours(...)` modifies the date in the **device's local timezone**. If a user in New York (`America/New_York`, UTC-4) selects Ahmedabad (`Asia/Kolkata`, UTC+5:30), calling `date.setHours(0, 0, 0, 0)` sets midnight New York time, shifting all sunrise and Choghadiya calculations by 9.5 hours.

#### The `wallClockToUtc` Pattern
Using standard JavaScript `Intl.DateTimeFormat` (available in modern JS engines including Hermes and V8), we extract civil date parts in the target timezone and calculate the exact UTC offset:

```javascript
/**
 * Convert a "wall clock" time in a target timezone to its true UTC instant.
 * Example: "6:00 AM on 2026-08-17 in Asia/Kolkata" -> exact Date object
 */
export function wallClockToUtc(date, hours, minutes, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
  const year = get('year');
  const month = get('month');
  const day = get('day');

  const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const offsetMs = getTimezoneOffsetMs(utcMidnight, tz);
  const wallMs = hours * 3600000 + minutes * 60000;
  
  return new Date(utcMidnight.getTime() + wallMs + offsetMs);
}

export function getStartOfCivilDayInTz(date, tz) {
  return wallClockToUtc(date, 0, 0, tz);
}

export function getEndOfCivilDayInTz(date, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
  const nextUtcMidnight = new Date(Date.UTC(get('year'), get('month') - 1, get('day') + 1, 0, 0, 0, 0));
  const offsetMs = getTimezoneOffsetMs(nextUtcMidnight, tz);
  return new Date(nextUtcMidnight.getTime() + offsetMs);
}
```

### GPS Acquisition, Curated City List & Haversine Matching

When acquiring location via GPS:
1. Obtain latitude and longitude from device GPS.
2. Check against a curated list of global/Indian cities using the **Haversine formula**.
3. If a city is within threshold (e.g. 50 km), assign the city's metadata, exact name, and verified IANA timezone.
4. If no city matches, fall back to raw coordinates + the device's reported timezone.

```javascript
const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_KM = 6371;

export function haversine(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLng = (lng2 - lng1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function findNearestCity(lat, lng, citiesList, maxDistanceKm = 50) {
  let best = null;
  let bestDist = Infinity;

  for (const city of citiesList) {
    const dist = haversine(lat, lng, city.lat, city.lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }

  if (!best || bestDist > maxDistanceKm) return null;
  return { city: best, distanceKm: Math.round(bestDist * 10) / 10 };
}
```

### Travel Detection & Timezone Mismatch Banner

When a user travels across timezones:
- Check device timezone on app launch and foreground resume: `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- If `storedLocation.source !== 'manual'` and `deviceTimezone !== storedLocation.timezone`, display a non-intrusive dismissible banner:
  > *"Your phone is in America/New_York, but calculations are for Asia/Kolkata. [Dismiss] [Update]"*
- Tapping **Update** triggers one-tap GPS acquisition and recalculates all Panchang timings instantly.

---

## 3. Solar Engine: Sunrise, Sunset & True Day Boundaries

### Civil Day (00:00–24:00) vs Astronomical Solar Day (Sunrise–Sunrise)

- **Civil Day**: Begins at 00:00:00 local midnight and ends at 23:59:59. Used for calendar date selection.
- **Vedic Solar Day (Ahoratra)**: Begins at the instant of **local Sunrise** and ends at the **following day's Sunrise**.
- All Hindu time systems (Choghadiya, Hora, Muhurat) operate strictly on the **Vedic Solar Day**. Any time between 00:00 midnight and local Sunrise belongs astrologically to the **previous calendar day's night cycle**.

```
Vedic Solar Day Timeline:
[ Yesterday Sunset ] ──── Night Cycle Part 1 (Pre-midnight) ───► [ 00:00 Midnight ]
[ 00:00 Midnight ]   ──── Night Cycle Part 2 (Post-midnight) ──► [ Today Sunrise ]
[ Today Sunrise ]    ──── Day Cycle (8 Choghadiyas / 12 Horas) ─► [ Today Sunset ]
[ Today Sunset ]     ──── Night Cycle (8 Choghadiyas / 12 Horas)► [ Tomorrow Sunrise ]
```

### Astronomy.js Observer Integration & Polar Day/Night Handling

```javascript
import * as Astronomy from 'astronomy-engine';

export const calculateSunRiseSet = (date, latitude, longitude, tz = 'Asia/Kolkata') => {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const dayStart = getStartOfCivilDayInTz(date, tz);
  const time = new Astronomy.AstroTime(dayStart);

  // Search forward 2 days with limitDays=2 to ensure capture
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, time, 2);
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, time, 2);

  let polarCondition = 'normal';
  if (!rise || !set) {
    polarCondition = detectPolarCondition(latitude, date);
  }

  return {
    sunrise: rise ? rise.date : null,
    sunset: set ? set.date : null,
    polarCondition,
  };
};
```

---

## 4. Choghadiya Calculation Engine (8 Day / 8 Night Segments)

### The 7 Choghadiya Types, Qualities & Colors

| Key | Name (EN) | Name (GU) | Quality | Color | Hex Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AMRIT** | Amrit | અમૃત | Auspicious | Amber / Orange | `#F59E0B` |
| **SHUBH** | Shubh | શુભ | Auspicious | Purple | `#8B5CF6` |
| **LABH** | Labh | લાભ | Auspicious | Emerald Green | `#10B981` |
| **CHAR** | Chal | ચલ | Neutral | Blue | `#3B82F6` |
| **UDVEG** | Udveg | ઉદ્વેગ | Inauspicious | Red | `#EF4444` |
| **KAAL** | Kaal | કાળ | Inauspicious | Dark Red | `#DC2626` |
| **ROG** | Rog | રોગ | Inauspicious | Pink / Rose | `#EC4899` |

### Planetary Sequences (Day & Night)

Day sequences start with the weekday's planetary ruler. Night sequences follow their respective astrological ruler shift:

```javascript
export const DAY_CHOGHADIYA_SEQUENCES = [
  ['UDVEG', 'CHAR', 'LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG'], // 0: Sunday (Sun = Udveg)
  ['AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAR', 'LABH', 'AMRIT'], // 1: Monday (Moon = Amrit)
  ['ROG', 'UDVEG', 'CHAR', 'LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG'],   // 2: Tuesday (Mars = Rog)
  ['LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAR', 'LABH'],   // 3: Wednesday (Mercury = Labh)
  ['SHUBH', 'ROG', 'UDVEG', 'CHAR', 'LABH', 'AMRIT', 'KAAL', 'SHUBH'], // 4: Thursday (Jupiter = Shubh)
  ['CHAR', 'LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAR'],   // 5: Friday (Venus = Char)
  ['KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAR', 'LABH', 'AMRIT', 'KAAL'],   // 6: Saturday (Saturn = Kaal)
];

export const NIGHT_CHOGHADIYA_SEQUENCES = [
  ['SHUBH', 'AMRIT', 'CHAR', 'ROG', 'KAAL', 'LABH', 'UDVEG', 'SHUBH'], // 0: Sunday
  ['CHAR', 'ROG', 'KAAL', 'LABH', 'UDVEG', 'SHUBH', 'AMRIT', 'CHAR'],   // 1: Monday
  ['KAAL', 'LABH', 'UDVEG', 'SHUBH', 'AMRIT', 'CHAR', 'ROG', 'KAAL'],   // 2: Tuesday
  ['UDVEG', 'SHUBH', 'AMRIT', 'CHAR', 'ROG', 'KAAL', 'LABH', 'UDVEG'], // 3: Wednesday
  ['AMRIT', 'CHAR', 'ROG', 'KAAL', 'LABH', 'UDVEG', 'SHUBH', 'AMRIT'], // 4: Thursday
  ['ROG', 'KAAL', 'LABH', 'UDVEG', 'SHUBH', 'AMRIT', 'CHAR', 'ROG'],   // 5: Friday
  ['LABH', 'UDVEG', 'SHUBH', 'AMRIT', 'CHAR', 'ROG', 'KAAL', 'LABH'],   // 6: Saturday
];
```

### The Pre-Sunrise (Yesterday Night) Rollover Algorithm

This is the most critical logic for preventing Choghadiya calculation bugs between 00:00 and Sunrise:

```javascript
export const calculateChoghadiya = (currentTime = new Date(), latitude, longitude, tz = 'Asia/Kolkata') => {
  // 1. Determine day of week in target timezone (0 = Sunday, 6 = Saturday)
  const dayOfWeekStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(currentTime);
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = dayMap[dayOfWeekStr] ?? 0;

  // 2. Calculate sunrises and sunsets for Today, Yesterday, and Tomorrow
  const { sunrise: todaySunrise, sunset: todaySunset } = calculateSunRiseSet(currentTime, latitude, longitude, tz);

  const yesterdayTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
  const { sunrise: yesterdaySunrise, sunset: yesterdaySunset } = calculateSunRiseSet(yesterdayTime, latitude, longitude, tz);

  const tomorrowTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
  const { sunrise: tomorrowSunrise } = calculateSunRiseSet(tomorrowTime, latitude, longitude, tz);

  let isDay = false;
  let startTime, endTime;
  let sequence = [];

  if (currentTime >= todaySunrise && currentTime < todaySunset) {
    // A. Day Time (Sunrise -> Sunset)
    isDay = true;
    startTime = todaySunrise;
    endTime = todaySunset;
    sequence = DAY_CHOGHADIYA_SEQUENCES[dayOfWeek];
  } else if (currentTime >= todaySunset) {
    // B. Night Time after Sunset (Sunset -> Tomorrow Sunrise)
    isDay = false;
    startTime = todaySunset;
    endTime = tomorrowSunrise;
    sequence = NIGHT_CHOGHADIYA_SEQUENCES[dayOfWeek];
  } else {
    // C. Night Time before Sunrise (00:00 -> Today Sunrise)
    // Astrologically belongs to yesterday's night cycle!
    isDay = false;
    startTime = yesterdaySunset;
    endTime = todaySunrise;
    const yesterdayDayOfWeek = (dayOfWeek + 6) % 7;
    sequence = NIGHT_CHOGHADIYA_SEQUENCES[yesterdayDayOfWeek];
  }

  // 3. Divide time span into 8 equal segments
  const totalDuration = endTime.getTime() - startTime.getTime();
  const segmentDuration = totalDuration / 8;
  const elapsed = currentTime.getTime() - startTime.getTime();
  const currentSegmentIndex = Math.floor(elapsed / segmentDuration);
  const segmentIndex = Math.max(0, Math.min(7, currentSegmentIndex));

  const segments = [];
  for (let i = 0; i < 8; i++) {
    const segStart = new Date(startTime.getTime() + i * segmentDuration);
    const segEnd = new Date(startTime.getTime() + (i + 1) * segmentDuration);
    const typeKey = sequence[i];
    const typeInfo = CHOGHADIYA_TYPES[typeKey];

    segments.push({
      index: i,
      nameEn: typeInfo.nameEn,
      nameGu: typeInfo.nameGu,
      qualityEn: typeInfo.qualityEn,
      qualityGu: typeInfo.qualityGu,
      color: typeInfo.color,
      startTime: segStart,
      endTime: segEnd,
      isActive: i === segmentIndex,
    });
  }

  return {
    isDay,
    currentSegment: segments[segmentIndex],
    segments,
    sunrise: todaySunrise,
    sunset: todaySunset,
  };
};
```

---

## 5. Hora Calculation Engine (12 Day / 12 Night Segments)

### The 7 Planetary Horas & Qualities

Each planetary hora has specific astrological qualities and UI color assignments:

```javascript
export const HORA_TYPES = {
  SUN: { nameEn: 'Sun', nameGu: 'સૂર્ય', qualityEn: 'Neutral', qualityGu: 'સામાન્ય', color: '#3B82F6' },
  MON: { nameEn: 'Moon', nameGu: 'ચંદ્ર', qualityEn: 'Auspicious', qualityGu: 'શુભ', color: '#10B981' },
  MAR: { nameEn: 'Mars', nameGu: 'મંગળ', qualityEn: 'Inauspicious', qualityGu: 'અશુભ', color: '#EF4444' },
  MER: { nameEn: 'Mercury', nameGu: 'બુધ', qualityEn: 'Auspicious', qualityGu: 'શુભ', color: '#10B981' },
  JUP: { nameEn: 'Jupiter', nameGu: 'ગુરુ', qualityEn: 'Auspicious', qualityGu: 'શુભ', color: '#10B981' },
  VEN: { nameEn: 'Venus', nameGu: 'શુક્ર', qualityEn: 'Auspicious', qualityGu: 'શુભ', color: '#10B981' },
  SAT: { nameEn: 'Saturn', nameGu: 'શનિ', qualityEn: 'Inauspicious', qualityGu: 'અશુભ', color: '#EF4444' }
};
```

### Chaldean Planetary Order & Weekday Starting Formulas

Horas repeat in the **ancient Chaldean planetary order** (from slowest to fastest geocentric planetary speed):
`SUN` (0) → `VEN` (1) → `MER` (2) → `MON` (3) → `SAT` (4) → `JUP` (5) → `MAR` (6)

1. The **1st Hora at local Sunrise** is always ruled by the planetary lord of that weekday:
   - Sunday (0) → Sun (Index 0)
   - Monday (1) → Moon (Index 3)
   - Tuesday (2) → Mars (Index 6)
   - Wednesday (3) → Mercury (Index 2)
   - Thursday (4) → Jupiter (Index 5)
   - Friday (5) → Venus (Index 1)
   - Saturday (6) → Saturn (Index 4)
   - `WEEKDAY_HORA_START_INDEX = [0, 3, 6, 2, 5, 1, 4]`

2. **Day vs Night Division**:
   - **Day Horas (1 to 12)**: Divide `[Sunrise, Sunset]` into **12 equal segments**.
   - **Night Horas (13 to 24)**: Divide `[Sunset, Next Sunrise]` into **12 equal segments**.
   - Offset for Night Horas is `+12` in the Chaldean sequence.

```javascript
const HORA_PLANET_KEYS = ['SUN', 'VEN', 'MER', 'MON', 'SAT', 'JUP', 'MAR'];
const WEEKDAY_HORA_START_INDEX = [0, 3, 6, 2, 5, 1, 4];

export const calculateHora = (currentTime = new Date(), latitude, longitude, tz = 'Asia/Kolkata') => {
  const dayOfWeekStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(currentTime);
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  let dayOfWeek = dayMap[dayOfWeekStr] ?? 0;

  const { sunrise: todaySunrise, sunset: todaySunset } = calculateSunRiseSet(currentTime, latitude, longitude, tz);

  const yesterdayTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
  const { sunrise: yesterdaySunrise, sunset: yesterdaySunset } = calculateSunRiseSet(yesterdayTime, latitude, longitude, tz);

  const tomorrowTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
  const { sunrise: tomorrowSunrise } = calculateSunRiseSet(tomorrowTime, latitude, longitude, tz);

  let isDay = false;
  let startTime, endTime;

  if (currentTime >= todaySunrise && currentTime < todaySunset) {
    isDay = true;
    startTime = todaySunrise;
    endTime = todaySunset;
  } else if (currentTime >= todaySunset) {
    isDay = false;
    startTime = todaySunset;
    endTime = tomorrowSunrise;
  } else {
    isDay = false;
    startTime = yesterdaySunset;
    endTime = todaySunrise;
    dayOfWeek = (dayOfWeek + 6) % 7; // Shift to yesterday's lord for pre-sunrise hours
  }

  const startIndex = WEEKDAY_HORA_START_INDEX[dayOfWeek];
  const totalDuration = endTime.getTime() - startTime.getTime();
  const segmentDuration = totalDuration / 12; // 12 Horas per day/night
  const elapsed = currentTime.getTime() - startTime.getTime();
  const currentSegmentIndex = Math.floor(elapsed / segmentDuration);
  const segmentIndex = Math.max(0, Math.min(11, currentSegmentIndex));

  const segments = [];
  for (let i = 0; i < 12; i++) {
    const segStart = new Date(startTime.getTime() + i * segmentDuration);
    const segEnd = new Date(startTime.getTime() + (i + 1) * segmentDuration);
    const offset = isDay ? 0 : 12;
    const typeKey = HORA_PLANET_KEYS[(startIndex + offset + i) % 7];
    const typeInfo = HORA_TYPES[typeKey];

    segments.push({
      index: i,
      nameEn: typeInfo.nameEn,
      nameGu: typeInfo.nameGu,
      qualityEn: typeInfo.qualityEn,
      qualityGu: typeInfo.qualityGu,
      color: typeInfo.color,
      startTime: segStart,
      endTime: segEnd,
      isActive: i === segmentIndex,
    });
  }

  return {
    isDay,
    currentSegment: segments[segmentIndex],
    segments,
    sunrise: todaySunrise,
    sunset: todaySunset,
  };
};
```

---

## 6. Mahurat Calculation Engine (15 Day / 15 Night Segments)

The traditional Vedic day divides the day into **15 Muhuratas** and the night into **15 Muhuratas** (each roughly 48 minutes):

- **Day Muhurats (1–15)**: Rudra, Ahi, Mitra, Pitri, Vasu, Vara, Vishvedeva, **Abhijit** (8th, highly auspicious midday period), Vidhi, Sutamukhi, Puruhuta, Vahni, Naktanchara, Varuna, Aryaman.
- **Night Muhurats (1–15)**: Girish, Ajapad, Ahirbudhnya, Pusa, Ashwini, Yama, Agni, Vidhata, Chandra, Aditi, Jiva, Vishnu, Yumigadyuti, Bhaga, Aryaman.
- Subdivided into 15 equal parts: `segmentDuration = totalDuration / 15`.

---

## 7. Tithi & Lunar Engine

### Real-Time Instantaneous Tithi vs Udaya (Sunrise) Tithi

1. **Real-Time Astronomical Tithi (`calculateTithiNumber`)**:
   - Tithi is defined as every **12° increment of Moon-Sun longitude separation (elongation)**:
     $$\text{Elongation} = (\lambda_{\text{Moon}} - \lambda_{\text{Sun}}) \pmod{360^\circ}$$
     $$\text{Tithi Number} = \lfloor \frac{\text{Elongation}}{12^\circ} \rfloor + 1 \quad (1 \le \text{Tithi} \le 30)$$
   - Evaluates at the **exact instantaneous moment of `Date()`**. This ensures live countdowns, home screen widgets, and progress bars remain 100% accurate throughout the day.

2. **Udaya Tithi (`getSunriseTithi`)**:
   - The Tithi prevailing at the exact moment of local **Sunrise**. Used for determining the primary calendar day's religious observance and festival day.

```javascript
export const calculateTithiNumber = (date = new Date()) => {
  const time = new Astronomy.AstroTime(date);
  let diff = Astronomy.PairLongitude(Astronomy.Body.Moon, Astronomy.Body.Sun, time);
  if (diff < 0) diff += 360;
  return Math.floor(diff / 12) + 1;
};

export const getSunriseTithi = (date = new Date(), lat, lng, tz) => {
  const { sunrise } = calculateSunRiseSet(date, lat, lng, tz);
  return calculateTithiNumber(sunrise || date);
};
```

### Continuous Segment Tracking & Exact Boundary Search

To render remaining minutes and percentage progress for a Tithi:
- `findNextTithiBoundary(date)` uses root-finding (`Astronomy.Search`) to find the exact millisecond where Moon-Sun elongation crosses a multiple of 12°.
- `calculateTithiTimings(refDate, tz)` yields past, active, and upcoming Tithi segments covering the full 24-hour civil window.

---

## 8. Global State Management & Reactive UI Integration

### Zustand Store Architecture

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set, get) => ({
      location: {
        state: 'Gujarat',
        district: 'Ahmedabad',
        city: 'Ahmedabad',
        lat: 23.0225,
        lng: 72.5714,
        timezone: 'Asia/Kolkata',
        label: 'Ahmedabad, Gujarat, India',
        source: 'default',
        lastSynced: null,
      },
      calculationPref: 'Hora', // 'Choghadiya' | 'Hora' | 'Mahurat'
      language: 'en',          // 'en' | 'gu'
      themeMode: 'tithi',      // 'punam' (light) | 'amas' (dark) | 'tithi' (system)

      setLocation: (location) => {
        set({ location });
      },

      setCalculationPref: (calculationPref) => {
        set({ calculationPref });
      },

      setLanguage: (language) => {
        set({ language });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Reactive Calculation Pipeline & UI Hooks

In your React screens/components:

```typescript
// 1. Extract state from store
const { location, calculationPref, language } = useStore();

// 2. 1-second live clock for UI fluidity
const [currentDate, setCurrentDate] = useState(new Date());
useEffect(() => {
  const interval = setInterval(() => setCurrentDate(new Date()), 1000);
  return () => clearInterval(interval);
}, []);

// 3. Unified Choghadiya / Hora / Mahurat Memo
const timeCycleData = useMemo(() => {
  const lat = location?.lat || 23.0225;
  const lng = location?.lng || 72.5714;
  const tz = location?.timezone || 'Asia/Kolkata';

  if (calculationPref === 'Hora') {
    return calculateHora(currentDate, lat, lng, tz);
  } else if (calculationPref === 'Mahurat') {
    return calculateMahurat(currentDate, lat, lng, tz);
  }
  return calculateChoghadiya(currentDate, lat, lng, tz);
}, [currentDate, location, calculationPref]);

// 4. Progress percentage and remaining minutes
const cycleProgress = useMemo(() => {
  if (!timeCycleData?.currentSegment) return { percent: 0, remainingMins: 0 };
  const { startTime, endTime } = timeCycleData.currentSegment;
  const totalMs = endTime.getTime() - startTime.getTime();
  const elapsedMs = currentDate.getTime() - startTime.getTime();
  const remainingMs = Math.max(0, endTime.getTime() - currentDate.getTime());

  return {
    percent: Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)),
    remainingMins: Math.ceil(remainingMs / 60000),
  };
}, [timeCycleData, currentDate]);
```

---

## 9. Complete Code Reference Implementations

*(Use the ready-to-copy code blocks below directly in `shubh_samay`)*

### `utils/time.js`
```javascript
export const TIMEZONE_INDIA = 'Asia/Kolkata';

function getDatePartsInTz(date, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
  return { year: get('year'), month: get('month'), day: get('day') };
}

function getTimezoneOffsetMs(date, tz) {
  const tzParts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const tzH = parseInt(tzParts.find((p) => p.type === 'hour').value, 10);
  const tzM = parseInt(tzParts.find((p) => p.type === 'minute').value, 10);
  const utcH = date.getUTCHours();
  const utcM = date.getUTCMinutes();

  let offsetMin = (utcH * 60 + utcM) - (tzH * 60 + tzM);
  if (offsetMin > 780) offsetMin -= 1440;
  if (offsetMin < -780) offsetMin += 1440;

  return offsetMin * 60 * 1000;
}

export function wallClockToUtc(date, hours, minutes, tz) {
  const { year, month, day } = getDatePartsInTz(date, tz);
  const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const offsetMs = getTimezoneOffsetMs(utcMidnight, tz);
  const wallMs = hours * 3600000 + minutes * 60000;
  return new Date(utcMidnight.getTime() + wallMs + offsetMs);
}

export function getStartOfCivilDayInTz(date, tz) {
  return wallClockToUtc(date, 0, 0, tz);
}

export function getEndOfCivilDayInTz(date, tz) {
  const { year, month, day } = getDatePartsInTz(date, tz);
  const nextUtcMidnight = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
  const offsetMs = getTimezoneOffsetMs(nextUtcMidnight, tz);
  return new Date(nextUtcMidnight.getTime() + offsetMs);
}

export function getDeviceTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```

---

## 10. Critical Pitfalls & Edge Cases To Avoid

1. ⚠️ **Do Not Use `date.setHours(0,0,0,0)`**: This mutates the date in device-local time and causes massive time-shifts for users traveling or viewing international cities. Always use `getStartOfCivilDayInTz`.
2. ⚠️ **Do Not Forget the Pre-Sunrise Night Rollover**: Between 00:00:00 and local Sunrise, the time belongs to the *previous* weekday's night sequence. Failure to shift weekday back by 1 (`(dayOfWeek + 6) % 7`) causes wrong Choghadiya/Hora during early morning hours.
3. ⚠️ **Always Calculate Solar Sunrise-to-Sunset Proportions**: Never hardcode Choghadiyas to 90 minutes or Horas to 60 minutes. Day and night lengths vary significantly depending on latitude and season (e.g. 14-hour summer days vs 10-hour winter days).
4. ⚠️ **Store Persistence Flush Before Widget Update**: If using background services or widgets, allow a brief delay (~300ms) after updating location or preferences in Zustand to ensure disk write completes before reading storage in background tasks.

---
*Created for seamless integration into `shubh_samay`.*
