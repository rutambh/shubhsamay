/**
 * Shubh Samay — Panchang Calculation Engine
 * Computes Tithi, Nakshatra, Yoga, Karana, Sunrise/Sunset using astronomy-engine.
 * Uses Lahiri (Chitrapaksha) Ayanamsa — standard for Gujarat & most of India.
 *
 * All calculations are done live from astronomy — no stored data, always accurate.
 */

import {
  EclipticGeoMoon,
  SunPosition,
  SearchAltitude,
  Observer,
  Body,
} from "astronomy-engine";

/**
 * Lahiri (Chitrapaksha) Ayanamsa in degrees.
 * Reference: at J2000.0 (2000-01-01 12:00 UT) ≈ 23.853° (23°51'11").
 * Annual precession rate ≈ 50.29 arcsec/year.
 */
function lahiriAyanamsa(date: Date): number {
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const days = (date.getTime() - j2000) / 86400000;
  const years = days / 365.25;
  return 23.853 + (50.29 / 3600) * years;
}

/**
 * Returns the sidereal (Vedic) ecliptic longitude of the Moon in degrees [0, 360).
 */
export function getMoonSiderealLongitude(date: Date): number {
  const moon = EclipticGeoMoon(date);
  const ayan = lahiriAyanamsa(date);
  return ((moon.lon - ayan) % 360 + 360) % 360;
}

/**
 * Returns the sidereal (Vedic) ecliptic longitude of the Sun in degrees [0, 360).
 */
export function getSunSiderealLongitude(date: Date): number {
  const sun = SunPosition(date);
  const ayan = lahiriAyanamsa(date);
  return ((sun.elon - ayan) % 360 + 360) % 360;
}

// ============ TITHI ============
// Tithi = (Moon longitude - Sun longitude) / 12, each tithi = 12°
// 30 tithis in a lunar month. 15 per paksha (Shukla + Krishna).

export const TITHI_NAMES_EN = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

export const TITHI_NAMES_GU = [
  "પડવો", "બીજ", "તૃતીયા", "ચોથ", "પાંચમ",
  "છઠ", "સાતમ", "આઠમ", "નવમી", "દશમ",
  "એકાદશી", "બારસ", "તેરસ", "ચૌદસ", "પૂનમ",
  "પડવો", "બીજ", "તૃતીયા", "ચોથ", "પાંચમ",
  "છઠ", "સાતમ", "આઠમ", "નવમી", "દશમ",
  "એકાદશી", "બારસ", "તેરસ", "ચૌદસ", "અમાસ",
];

export interface TithiInfo {
  index: number;        // 0-29
  name_en: string;
  name_gu: string;
  paksha: "Shukla" | "Krishna";
  paksha_gu: string;
  percentage: number;   // how far into the tithi (0-100)
  isPurnima: boolean;
  isAmavasya: boolean;
}

export function getTithi(date: Date): TithiInfo {
  const moonLon = getMoonSiderealLongitude(date);
  const sunLon = getSunSiderealLongitude(date);
  let diff = moonLon - sunLon;
  if (diff < 0) diff += 360;
  const tithiFloat = diff / 12; // 0 to 30
  const index = Math.floor(tithiFloat) % 30;
  const percentage = (tithiFloat - Math.floor(tithiFloat)) * 100;
  const paksha = index < 15 ? "Shukla" : "Krishna";
  return {
    index,
    name_en: TITHI_NAMES_EN[index],
    name_gu: TITHI_NAMES_GU[index],
    paksha,
    paksha_gu: paksha === "Shukla" ? "શુક્લ" : "કૃષ્ણ",
    percentage,
    isPurnima: index === 14,
    isAmavasya: index === 29,
  };
}

// ============ NAKSHATRA ============
// 27 nakshatras, each 13°20' (13.333°)
export const NAKSHATRA_NAMES_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
];

export const NAKSHATRA_NAMES_GU = [
  "અશ્વિની", "ભરણી", "કૃત્તિકા", "રોહિણી", "મૃગશિર",
  "અર્દ્રા", "પુનર્વસુ", "પુષ્ય", "આશ્લેષા", "મઘ",
  "પૂર્વા ફાલ્ગુની", "ઉત્તરા ફાલ્ગુની", "હસ્ત", "ચિત્રા", "સ્વાતિ",
  "વિશાખા", "અનુરાધા", "જ્યેષ્ઠ", "મૂળ", "પૂર્વા અષાઢ",
  "ઉત્તરા અષાઢ", "શ્રવણ", "ધનિષ્ઠા", "શતભિષા", "પૂર્વા ભાદ્રપદ",
  "ઉત્તરા ભાદ્રપદ", "રેવતી",
];

export const NAKSHATRA_LORD = [
  "Ketu", "Venus", "Sun", "Moon", "Mars",
  "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu",
  "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury", "Ketu", "Venus",
  "Sun", "Moon", "Mars", "Rahu", "Jupiter",
  "Saturn", "Mercury",
];

export interface NakshatraInfo {
  index: number;          // 0-26
  name_en: string;
  name_gu: string;
  lord: string;
  percentage: number;
}

export function getNakshatra(date: Date): NakshatraInfo {
  const moonLon = getMoonSiderealLongitude(date);
  const nakFloat = moonLon / (360 / 27); // 13.3333° each
  const index = Math.floor(nakFloat) % 27;
  const percentage = (nakFloat - Math.floor(nakFloat)) * 100;
  return {
    index,
    name_en: NAKSHATRA_NAMES_EN[index],
    name_gu: NAKSHATRA_NAMES_GU[index],
    lord: NAKSHATRA_LORD[index],
    percentage,
  };
}

// ============ YOGA ============
// Yoga = (Sun lon + Moon lon) / 13°20'
export const YOGA_NAMES_EN = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
  "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
  "Indra", "Vaidhriti",
];

export const YOGA_NAMES_GU = [
  "વિષ્કંભ", "પ્રીતિ", "આયુષ્માન", "સૌભાગ્ય", "શોભન",
  "અતિગંડ", "સુકર્મ", "ધૃતિ", "શૂલ", "ગંડ",
  "વૃદ્ધિ", "ધ્રુવ", "વ્યાઘાત", "હર્ષણ", "વજ્ર",
  "સિદ્ધિ", "વ્યતિપાત", "વરિયાન", "પરિઘ", "શિવ",
  "સિદ્ધ", "સાધ્ય", "શુભ", "શુક્લ", "બ્રહ્મ",
  "ઇન્દ્ર", "વૈધૃતિ",
];

export interface YogaInfo {
  index: number;
  name_en: string;
  name_gu: string;
  percentage: number;
}

export function getYoga(date: Date): YogaInfo {
  const moonLon = getMoonSiderealLongitude(date);
  const sunLon = getSunSiderealLongitude(date);
  let sum = moonLon + sunLon;
  sum = ((sum % 360) + 360) % 360;
  const yogaFloat = sum / (360 / 27);
  const index = Math.floor(yogaFloat) % 27;
  const percentage = (yogaFloat - Math.floor(yogaFloat)) * 100;
  return {
    index,
    name_en: YOGA_NAMES_EN[index],
    name_gu: YOGA_NAMES_GU[index],
    percentage,
  };
}

// ============ KARANA ============
// Karana = half of a Tithi. 11 distinct karanas (7 movable + 4 fixed).
export const KARANA_NAMES_EN = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja",
  "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna",
];

export const KARANA_NAMES_GU = [
  "બવ", "બલવ", "કૌલવ", "તૈતિલ", "ગરજ",
  "વનિજ", "વિષ્ટિ", "શકુનિ", "ચતુષ્પાદ", "નાગ", "કિંસ્તુઘ્ન",
];

export interface KaranaInfo {
  index: number;     // 0-10 (index into the 11 distinct karanas)
  name_en: string;
  name_gu: string;
}

export function getKarana(date: Date): KaranaInfo {
  const moonLon = getMoonSiderealLongitude(date);
  const sunLon = getSunSiderealLongitude(date);
  let diff = moonLon - sunLon;
  if (diff < 0) diff += 360;
  const karanaAbs = Math.floor(diff / 6); // 0-59 karana index
  let kIndex = 0;
  if (karanaAbs === 0) kIndex = 10; // Kimstughna
  else if (karanaAbs >= 57) {
    // 57=Shakuni, 58=Chatushpada, 59=Naga
    kIndex = 7 + (karanaAbs - 57);
  } else {
    // 1-56 -> cycle Bava(0)..Vishti(6)
    kIndex = (karanaAbs - 1) % 7;
  }
  return {
    index: kIndex,
    name_en: KARANA_NAMES_EN[kIndex],
    name_gu: KARANA_NAMES_GU[kIndex],
  };
}

// ============ SUNRISE / SUNSET ============
export interface LatLng {
  lat: number;
  lng: number;
  tzOffsetHours: number;
}

/**
 * Compute local midnight (00:00 in user's tz) as a UTC Date.
 * tzOffsetHours = hours ahead of UTC (e.g., 5.5 for IST).
 * Returns a Date whose underlying ms is the UTC instant of local midnight.
 */
export function localMidnightUTC(date: Date, tzOffsetHours: number): Date {
  // Shift to local, read Y/M/D, then construct UTC midnight and shift back
  const localMs = date.getTime() + tzOffsetHours * 3600000;
  const local = new Date(localMs);
  return new Date(
    Date.UTC(
      local.getUTCFullYear(),
      local.getUTCMonth(),
      local.getUTCDate()
    ) - tzOffsetHours * 3600000
  );
}

/**
 * Find sunrise for a given local date at a location.
 * Uses -0.833° altitude (standard sunrise: accounts for refraction + sun's semi-diameter).
 * Returns a Date in raw UTC (caller formats using tzOffset).
 */
export function getSunrise(date: Date, loc: LatLng): Date | null {
  const midnightUT = localMidnightUTC(date, loc.tzOffsetHours);
  const observer = new Observer(loc.lat, loc.lng, 0);
  try {
    // direction = +1 means altitude increasing (rising); altitude = -0.833° for true sunrise
    const result = SearchAltitude(Body.Sun, observer, +1, midnightUT, 1, -0.833);
    return result ? result.date : null;
  } catch {
    return null;
  }
}

/**
 * Find sunset for a given local date at a location.
 * Uses -0.833° altitude (standard sunset).
 * Returns a Date in raw UTC (caller formats using tzOffset).
 */
export function getSunset(date: Date, loc: LatLng): Date | null {
  const midnightUT = localMidnightUTC(date, loc.tzOffsetHours);
  // Start search from local noon (midnight + 12h) to find evening sunset
  const noonUT = new Date(midnightUT.getTime() + 12 * 3600000);
  const observer = new Observer(loc.lat, loc.lng, 0);
  try {
    // direction = -1 means altitude decreasing (setting); altitude = -0.833° for true sunset
    const result = SearchAltitude(Body.Sun, observer, -1, noonUT, 1, -0.833);
    return result ? result.date : null;
  } catch {
    return null;
  }
}

// ============ WEEKDAY / VARA ============
export const VARA_NAMES_EN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
export const VARA_NAMES_GU = [
  "રવિવાર", "સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર",
];
export const VARA_LORD = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

export function getVara(date: Date) {
  const idx = date.getDay();
  return {
    index: idx,
    name_en: VARA_NAMES_EN[idx],
    name_gu: VARA_NAMES_GU[idx],
    lord: VARA_LORD[idx],
  };
}
