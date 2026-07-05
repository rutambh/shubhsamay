/**
 * Shubh Samay — Time Division Engine
 * Computes Choghadiya, Hora, Rahu Kaal, Yamaganda, Gulika Kaal
 * from sunrise & sunset times at a location.
 */

import { getSunrise, getSunset, type LatLng } from "./panchang";

// ============ CHOGHADIYA ============
// Day is divided into 8 equal parts from sunrise to sunset (Day Choghadiya)
// Night is divided into 8 equal parts from sunset to next sunrise (Night Choghadiya)
// Each part has a name and a quality (Good/Bad/Mixed).
// The sequence differs between day and night and rotates by weekday.

export type ChoghadiyaQuality = "good" | "mixed" | "bad";

export const CHOGHADIYA_NAMES_EN = [
  "Udvega", "Amrit", "Rog", "Shubh", "Labh", "Char", "Kaal", "Dudh",
];

export const CHOGHADIYA_NAMES_GU = [
  "ઉદ્વેગ", "અમૃત", "રોગ", "શુભ", "લાભ", "ચર", "કાળ", "દૂધ",
];

// Quality of each choghadiya (index matches name)
export const CHOGHADIYA_QUALITY: ChoghadiyaQuality[] = [
  "bad",   // Udvega
  "good",  // Amrit
  "bad",   // Rog
  "good",  // Shubh
  "good",  // Labh
  "mixed", // Char
  "bad",   // Kaal
  "mixed", // Dudh
];

export const QUALITY_LABEL_EN: Record<ChoghadiyaQuality, string> = {
  good: "Auspicious",
  mixed: "Mixed",
  bad: "Inauspicious",
};

export const QUALITY_LABEL_GU: Record<ChoghadiyaQuality, string> = {
  good: "શુભ",
  mixed: "મિશ્ર",
  bad: "અશુભ",
};

// Starting choghadiya index for each weekday's DAY period
// (Traditional tables: Udvega=0, Amrit=1, Rog=2, Shubh=3, Labh=4, Char=5, Kaal=6, Dudh=7)
const DAY_START_INDEX = [5, 4, 3, 2, 1, 0, 7]; // Sun..Sat
// Starting choghadiya index for each weekday's NIGHT period
const NIGHT_START_INDEX = [2, 1, 0, 7, 6, 5, 4]; // Sun..Sat

export interface ChoghadiyaSlot {
  start: Date;
  end: Date;
  name_en: string;
  name_gu: string;
  quality: ChoghadiyaQuality;
  period: "day" | "night";
}

/**
 * Compute all 16 Choghadiya slots (8 day + 8 night) for a given local date.
 */
export function getChoghadiya(date: Date, loc: LatLng): ChoghadiyaSlot[] {
  const slots: ChoghadiyaSlot[] = [];
  const sunrise = getSunrise(date, loc);
  const sunset = getSunset(date, loc);
  if (!sunrise || !sunset) return slots;

  // Next day's sunrise for the night period end
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextSunrise = getSunrise(nextDay, loc) || new Date(sunset.getTime() + 12 * 3600000);

  const weekday = sunrise.getDay();

  // Day period: sunrise -> sunset, 8 equal parts
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const dayStart = DAY_START_INDEX[weekday];
  for (let i = 0; i < 8; i++) {
    const start = new Date(sunrise.getTime() + (dayDuration * i) / 8);
    const end = new Date(sunrise.getTime() + (dayDuration * (i + 1)) / 8);
    const idx = (dayStart + i) % 8;
    slots.push({
      start,
      end,
      name_en: CHOGHADIYA_NAMES_EN[idx],
      name_gu: CHOGHADIYA_NAMES_GU[idx],
      quality: CHOGHADIYA_QUALITY[idx],
      period: "day",
    });
  }

  // Night period: sunset -> next sunrise, 8 equal parts
  const nightDuration = nextSunrise.getTime() - sunset.getTime();
  const nightStart = NIGHT_START_INDEX[weekday];
  for (let i = 0; i < 8; i++) {
    const start = new Date(sunset.getTime() + (nightDuration * i) / 8);
    const end = new Date(sunset.getTime() + (nightDuration * (i + 1)) / 8);
    const idx = (nightStart + i) % 8;
    slots.push({
      start,
      end,
      name_en: CHOGHADIYA_NAMES_EN[idx],
      name_gu: CHOGHADIYA_NAMES_GU[idx],
      quality: CHOGHADIYA_QUALITY[idx],
      period: "night",
    });
  }

  return slots;
}

// ============ HORA ============
// Each day has 24 horas (12 day + 12 night). Each hora is ruled by a planet.
// Day starts at sunrise. The first hora of the day is ruled by the day's lord.
// Sequence (planetary order from slowest to fastest): Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon
// Then it repeats.

export const HORA_NAMES_EN = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
export const HORA_NAMES_GU = ["સૂર્ય", "ચંદ્ર", "મંગળ", "બુધ", "ગુરુ", "શુક્ર", "શનિ"];

// Planet order for hora (Chaldean order, slowest to fastest)
const HORA_ORDER = [5, 4, 2, 0, 6, 3, 1]; // indices into HORA_NAMES: Saturn=6, Jupiter=4... mapped
// Actually let's index planets: 0=Sun,1=Moon,2=Mars,3=Mercury,4=Jupiter,5=Venus,6=Saturn
// Hora sequence: Saturn(6), Jupiter(4), Mars(2), Sun(0), Venus(5), Mercury(3), Moon(1) then repeat.
const HORA_SEQUENCE = [6, 4, 2, 0, 5, 3, 1];

export interface HoraSlot {
  start: Date;
  end: Date;
  lord_index: number;
  name_en: string;
  name_gu: string;
  isGood: boolean;
  period: "day" | "night";
}

// Benefic horas: Sun (wealth/health), Moon (joy), Mercury (intellect), Jupiter (wisdom), Venus (love)
// Malefic horas: Mars (conflict), Saturn (delay/obstacles)
const BENEFIC_HORAS = new Set([0, 1, 3, 4, 5]);

export function getHoras(date: Date, loc: LatLng): HoraSlot[] {
  const slots: HoraSlot[] = [];
  const sunrise = getSunrise(date, loc);
  const sunset = getSunset(date, loc);
  if (!sunrise || !sunset) return slots;

  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextSunrise = getSunrise(nextDay, loc) || new Date(sunset.getTime() + 12 * 3600000);

  const weekday = sunrise.getDay();
  // First hora lord = day lord (Sun=0, Moon=1, Mars=2, Mercury=3, Jupiter=4, Venus=5, Saturn=6)
  const firstHoraLord = weekday; // 0-6 (Sun..Sat) matches our planet index

  // Find starting position in HORA_SEQUENCE
  const startPos = HORA_SEQUENCE.indexOf(firstHoraLord);

  const dayDuration = sunset.getTime() - sunrise.getTime();
  const nightDuration = nextSunrise.getTime() - sunset.getTime();

  let seqPos = startPos;
  // Day horas (12)
  for (let i = 0; i < 12; i++) {
    const start = new Date(sunrise.getTime() + (dayDuration * i) / 12);
    const end = new Date(sunrise.getTime() + (dayDuration * (i + 1)) / 12);
    const lord = HORA_SEQUENCE[seqPos % 7];
    slots.push({
      start,
      end,
      lord_index: lord,
      name_en: HORA_NAMES_EN[lord],
      name_gu: HORA_NAMES_GU[lord],
      isGood: BENEFIC_HORAS.has(lord),
      period: "day",
    });
    seqPos++;
  }
  // Night horas (12) - continue sequence
  for (let i = 0; i < 12; i++) {
    const start = new Date(sunset.getTime() + (nightDuration * i) / 12);
    const end = new Date(sunset.getTime() + (nightDuration * (i + 1)) / 12);
    const lord = HORA_SEQUENCE[seqPos % 7];
    slots.push({
      start,
      end,
      lord_index: lord,
      name_en: HORA_NAMES_EN[lord],
      name_gu: HORA_NAMES_GU[lord],
      isGood: BENEFIC_HORAS.has(lord),
      period: "night",
    });
    seqPos++;
  }

  return slots;
}

// ============ RAHU KAAL / YAMAGANDA / GULIKA ============
// Each is 1/8th of the day period (sunrise to sunset).
// Rahu Kaal start offset (in eighths) by weekday (Sun..Sat):
const RAHU_KAAL_OFFSET = [8, 2, 7, 5, 6, 4, 3]; // Sun=8th(0-indexed 7), Mon=2nd(1), ...
// Recompute properly: standard table
// Sun: 8th part (index 7), Mon: 2nd (1), Tue: 7th (6), Wed: 5th (4), Thu: 6th (5), Fri: 4th (3), Sat: 3rd (2)
const RAHU_OFFSETS = [7, 1, 6, 4, 5, 3, 2];
// Yamaganda offsets (Sun..Sat): 5th, 4th, 3rd, 1st, 7th (or 6th), 8th (or 7th), 2nd
const YAMAGANDA_OFFSETS = [4, 3, 2, 0, 5, 7, 1];
// Gulika offsets: 7th, 6th, 5th (or 1st), 4th, 3rd (or 2nd), 2nd (or 5th), 8th
// Standard: Sun=7th(6), Mon=6th(5), Tue=5th(4), Wed=4th(3) [non-day], Thu=3rd(2) [non-day], Fri=2nd(1) [non-day], Sat=1st(0)
const GULIKA_OFFSETS = [6, 5, 4, 3, 2, 1, 0];

export interface InauspiciousPeriod {
  name_en: string;
  name_gu: string;
  start: Date;
  end: Date;
}

export function getInauspiciousPeriods(date: Date, loc: LatLng): InauspiciousPeriod[] {
  const result: InauspiciousPeriod[] = [];
  const sunrise = getSunrise(date, loc);
  const sunset = getSunset(date, loc);
  if (!sunrise || !sunset) return result;

  const dayDuration = sunset.getTime() - sunrise.getTime();
  const part = dayDuration / 8;
  const weekday = sunrise.getDay();

  const push = (offsets: number[], name_en: string, name_gu: string) => {
    const idx = offsets[weekday];
    result.push({
      name_en,
      name_gu,
      start: new Date(sunrise.getTime() + idx * part),
      end: new Date(sunrise.getTime() + (idx + 1) * part),
    });
  };

  push(RAHU_OFFSETS, "Rahu Kaal", "રાહુ કાળ");
  push(YAMAGANDA_OFFSETS, "Yamaganda", "યમગંધ");
  push(GULIKA_OFFSETS, "Gulika Kaal", "ગુલિકા કાળ");

  return result;
}

// ============ AUSPICIOUS PERIOD FINDER ============
// Given a date and location, find time slots that avoid Rahu/Yamaganda/Gulika
// AND fall within a good choghadiya OR good hora.
export interface AuspiciousSlot {
  start: Date;
  end: Date;
  source: "choghadiya" | "hora";
  name_en: string;
  name_gu: string;
  quality: ChoghadiyaQuality | "good" | "mixed" | "bad";
  reason_en: string;
  reason_gu: string;
}

/**
 * Find all auspicious time slots on a given date.
 * Combines good Choghadiya + good Hora, minus inauspicious periods.
 */
export function findAuspiciousSlots(date: Date, loc: LatLng): AuspiciousSlot[] {
  const result: AuspiciousSlot[] = [];
  const choghadiya = getChoghadiya(date, loc);
  const horas = getHoras(date, loc);
  const bad = getInauspiciousPeriods(date, loc);

  const isBad = (start: Date, end: Date) =>
    bad.some((b) => start < b.end && end > b.start);

  // Good choghadiya slots (Shubh, Amrit, Labh)
  for (const slot of choghadiya) {
    if (slot.quality === "good" && !isBad(slot.start, slot.end)) {
      result.push({
        start: slot.start,
        end: slot.end,
        source: "choghadiya",
        name_en: slot.name_en,
        name_gu: slot.name_gu,
        quality: "good",
        reason_en: `${slot.name_en} Choghadiya (auspicious)`,
        reason_gu: `${slot.name_gu} ચોઘડિયા (શુભ)`,
      });
    }
  }
  // Good hora slots (benefic planets)
  for (const slot of horas) {
    if (slot.isGood && !isBad(slot.start, slot.end)) {
      result.push({
        start: slot.start,
        end: slot.end,
        source: "hora",
        name_en: `${slot.name_en} Hora`,
        name_gu: `${slot.name_gu} હોરા`,
        quality: "good",
        reason_en: `${slot.name_en} Hora (benefic)`,
        reason_gu: `${slot.name_gu} હોરા (શુભ)`,
      });
    }
  }

  return result.sort((a, b) => a.start.getTime() - b.start.getTime());
}
