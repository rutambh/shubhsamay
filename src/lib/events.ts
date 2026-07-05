/**
 * Shubh Samay — Event Rules Engine
 * Maps user events to recommended methods (Tithi/Choghadiya/Hora/Muhurat/Nakshatra).
 *
 * The "smart default" auto-selects the most appropriate method(s) for each event,
 * based on traditional Gujarati / Vedic panchang conventions.
 *
 * Quality scoring: each candidate time slot gets a score (0-100).
 * Higher = more auspicious.
 */

import {
  getTithi,
  getNakshatra,
  getYoga,
  getKarana,
  getVara,
  getSunrise,
  getSunset,
  TITHI_NAMES_EN,
} from "./panchang";
import {
  getChoghadiya,
  getHoras,
  getInauspiciousPeriods,
  type ChoghadiyaQuality,
} from "./time-divisions";
import type { LatLng } from "./panchang";

// ============ EVENT CATALOG ============
export type EventId =
  | "marriage"
  | "housewarming"
  | "vehicle-purchase"
  | "gold-jewelry"
  | "business-start"
  | "travel"
  | "joining-job"
  | "filing-case"
  | "education-start"
  | "pooja-havan"
  | "buying-property"
  | "opening-account"
  | "agreement-signing"
  | "cooking-first-roti"
  | "planting-tree"
  | "shaving-haircut"
  | "naming-ceremony"
  | "surgery-medical"
  | "others";

export interface EventDef {
  id: EventId;
  name_en: string;
  name_gu: string;
  emoji: string;
  description_en: string;
  description_gu: string;
  /** Recommended methods (always at least 2). "Auto" mode uses all of these. */
  recommendedMethods: MethodId[];
  /** Major event flag (stricter weekday rules apply) */
  isMajor?: boolean;
}

export const EVENTS: EventDef[] = [
  {
    id: "marriage",
    name_en: "Marriage / Wedding",
    name_gu: "લગ્ન",
    emoji: "💍",
    description_en: "Find the best Muhurat for marriage ceremony",
    description_gu: "લગ્ન વિધિ માટે શ્રેષ્ઠ મુહૂર્ત શોધો",
    recommendedMethods: ["muhurat", "nakshatra", "tithi"],
    isMajor: true,
  },
  {
    id: "housewarming",
    name_en: "House Warming (Griha Pravesh)",
    name_gu: "ઘર પ્રવેશ",
    emoji: "🏠",
    description_en: "Auspicious time to enter a new home",
    description_gu: "નવા ઘરમાં પ્રવેશવાનો શુભ સમય",
    recommendedMethods: ["muhurat", "choghadiya", "tithi"],
    isMajor: true,
  },
  {
    id: "vehicle-purchase",
    name_en: "Buy Vehicle (Car/Bike)",
    name_gu: "વાહન ખરીદી",
    emoji: "🚗",
    description_en: "Best time to bring home a new vehicle",
    description_gu: "નવું વાહન લાવવાનો શુભ સમય",
    recommendedMethods: ["choghadiya", "hora", "nakshatra"],
  },
  {
    id: "gold-jewelry",
    name_en: "Buy Gold / Jewelry",
    name_gu: "સોનું ખરીદી",
    emoji: "🥇",
    description_en: "Auspicious time to purchase gold or jewelry",
    description_gu: "સોનું કે દાગીના ખરીદવાનો સમય",
    recommendedMethods: ["choghadiya", "hora"],
  },
  {
    id: "business-start",
    name_en: "Start New Business",
    name_gu: "નવો વ્યવસાય શરૂ",
    emoji: "🏢",
    description_en: "Opening a new shop or business venture",
    description_gu: "નવું દુકાન કે વ્યવસાય શરૂ કરવા",
    recommendedMethods: ["muhurat", "choghadiya", "nakshatra"],
    isMajor: true,
  },
  {
    id: "travel",
    name_en: "Travel / Journey",
    name_gu: "પ્રવાસ",
    emoji: "✈️",
    description_en: "Auspicious time to begin a journey",
    description_gu: "પ્રવાસ શરૂ કરવાનો શુભ સમય",
    recommendedMethods: ["choghadiya", "hora"],
  },
  {
    id: "joining-job",
    name_en: "Join New Job",
    name_gu: "નવી નોકરી જોડાવવી",
    emoji: "💼",
    description_en: "First day at a new job or position",
    description_gu: "નવી નોકરીનો પ્રથમ દિવસ",
    recommendedMethods: ["choghadiya", "hora", "nakshatra"],
  },
  {
    id: "filing-case",
    name_en: "File Legal Case",
    name_gu: "કેસ દાખલ કરવો",
    emoji: "⚖️",
    description_en: "Filing a court case or legal action",
    description_gu: "કોર્ટ કેસ દાખલ કરવા",
    recommendedMethods: ["choghadiya", "hora"],
  },
  {
    id: "education-start",
    name_en: "Start Education",
    name_gu: "અભ્યાસ શરૂ",
    emoji: "📚",
    description_en: "Begin a new course, school, or learning",
    description_gu: "નવો અભ્યાસ કે શાળા શરૂ કરવા",
    recommendedMethods: ["choghadiya", "nakshatra", "hora"],
  },
  {
    id: "pooja-havan",
    name_en: "Pooja / Havan",
    name_gu: "પૂજા / હવન",
    emoji: "🪔",
    description_en: "Conducting a pooja or fire ritual",
    description_gu: "પૂજા કે હવન કરવા",
    recommendedMethods: ["muhurat", "choghadiya"],
  },
  {
    id: "buying-property",
    name_en: "Buy Property / Land",
    name_gu: "જમીન ખરીદી",
    emoji: "🏞️",
    description_en: "Register purchase of land or property",
    description_gu: "જમીન કે મકાન ખરીદવા",
    recommendedMethods: ["muhurat", "choghadiya", "tithi"],
    isMajor: true,
  },
  {
    id: "opening-account",
    name_en: "Open Bank Account",
    name_gu: "બેંક ખાતું ખોલવું",
    emoji: "🏦",
    description_en: "Opening a new bank or trading account",
    description_gu: "નવું બેંક ખાતું ખોલવા",
    recommendedMethods: ["choghadiya", "hora"],
  },
  {
    id: "agreement-signing",
    name_en: "Sign Agreement",
    name_gu: "કરાર પર સહી",
    emoji: "📝",
    description_en: "Signing contracts, deals, or partnerships",
    description_gu: "કરાર, ડીલ કે ભાગીદારી પર સહી",
    recommendedMethods: ["choghadiya", "hora"],
  },
  {
    id: "cooking-first-roti",
    name_en: "First Meal / New Stove",
    name_gu: "પ્રથમ ભોજન / નવી ચૂલી",
    emoji: "🍲",
    description_en: "First cooking on a new stove / in new home",
    description_gu: "નવી ચૂલી પર પ્રથમ રસોઈ",
    recommendedMethods: ["choghadiya", "hora"],
  },
  {
    id: "planting-tree",
    name_en: "Plant Tree / Crop",
    name_gu: "ઝાડ વાવવું",
    emoji: "🌱",
    description_en: "Planting trees, crops, or starting a garden",
    description_gu: "ઝાડ, પાક વાવવા",
    recommendedMethods: ["choghadiya", "nakshatra"],
  },
  {
    id: "shaving-haircut",
    name_en: "Haircut / Shaving",
    name_gu: "વાળ કપાવવા",
    emoji: "💈",
    description_en: "Personal grooming — avoid inauspicious times",
    description_gu: "વાળ કપાવવા કે દાઢી બનાવવા",
    recommendedMethods: ["choghadiya", "hora"],
  },
  {
    id: "naming-ceremony",
    name_en: "Naming Ceremony (Naamkaran)",
    name_gu: "નામકરણ",
    emoji: "👶",
    description_en: "Naming ceremony for a newborn",
    description_gu: "નવજાત શિશુનું નામકરણ",
    recommendedMethods: ["muhurat", "nakshatra", "tithi"],
    isMajor: true,
  },
  {
    id: "surgery-medical",
    name_en: "Medical / Surgery",
    name_gu: "સારવાર / શસ્ત્રક્રિયા",
    emoji: "🏥",
    description_en: "Avoid Rahu Kaal & inauspicious times for medical procedures",
    description_gu: "સારવાર માટે રાહુ કાળ ટાળો",
    recommendedMethods: ["choghadiya", "hora"],
  },
  {
    id: "others",
    name_en: "Others",
    name_gu: "અન્ય",
    emoji: "✨",
    description_en: "Not sure? We'll find general auspicious timing",
    description_gu: "ખાતરી નથી? સામાન્ય શુભ સમય શોધીએ",
    recommendedMethods: ["choghadiya", "hora"],
  },
];

// ============ METHOD CATALOG ============
export type MethodId = "auto" | "all" | "choghadiya" | "hora" | "tithi" | "nakshatra" | "yoga" | "muhurat";

export interface MethodDef {
  id: MethodId;
  name_en: string;
  name_gu: string;
  description_en: string;
  description_gu: string;
}

export const METHODS: MethodDef[] = [
  {
    id: "auto",
    name_en: "Auto (Smart)",
    name_gu: "ઓટો (સ્માર્ટ)",
    description_en: "Let the app pick the best method mix for your event",
    description_gu: "એપ્લિકેશન શ્રેષ્ઠ પદ્ધતિ મિશ્રણ સ્વયં પસંદ કરે",
  },
  {
    id: "all",
    name_en: "All (Comprehensive)",
    name_gu: "સર્વ (સંપૂર્ણ)",
    description_en: "Consider every method together for maximum thoroughness",
    description_gu: "અધિકતમ ચોકસાઈ માટે બધી પદ્ધતિઓ એકસાથે",
  },
  {
    id: "choghadiya",
    name_en: "Choghadiya",
    name_gu: "ચોઘડિયા",
    description_en: "Day divided into 8 parts; good for daily tasks",
    description_gu: "દિવસના ૮ ભાગ; દૈનિક કાર્યો માટે",
  },
  {
    id: "hora",
    name_en: "Hora",
    name_gu: "હોરા",
    description_en: "Planetary hours; each ruled by a planet",
    description_gu: "ગ્રહ-શાસિત કલાક",
  },
  {
    id: "tithi",
    name_en: "Tithi",
    name_gu: "તિથિ",
    description_en: "Lunar day; some tithis are very auspicious",
    description_gu: "ચંદ્ર દિવસ; કેટલીક તિથિઓ અત્યંત શુભ",
  },
  {
    id: "nakshatra",
    name_en: "Nakshatra",
    name_gu: "નક્ષત્ર",
    description_en: "Lunar mansion the Moon occupies",
    description_gu: "ચંદ્ર નક્ષત્ર",
  },
  {
    id: "yoga",
    name_en: "Yoga",
    name_gu: "યોગ",
    description_en: "Sun-Moon angular combination",
    description_gu: "સૂર્ય-ચંદ્ર કોણીય સંયોજન",
  },
  {
    id: "muhurat",
    name_en: "Muhurat",
    name_gu: "મુહૂર્ત",
    description_en: "Daily Muhurat periods (Abhijit, Brahma)",
    description_gu: "દૈનિક મુહૂર્ત સમય (અભિજિત, બ્રહ્મ)",
  },
];

// ============ AUSPICIOUSNESS RULES ============
// Favorable tithis for major events (Shukla 2,3,5,7,10,11,13; Purnima)
export const FAVORABLE_TITHIS = new Set([1, 2, 4, 6, 9, 10, 12, 14]);
// Inauspicious tithis (Chaturthi=3,18; Ashtami=7,22; Navami=8,23; Chaturdashi=13,28; Amavasya=29)
export const INAUSPICIOUS_TITHIS = new Set([3, 7, 8, 13, 18, 22, 23, 28, 29]);

// Favorable nakshatras for auspicious events
// Rohini, Mrigashira, Magha, Hasta, Swati, Anuradha, Uttara Ashadha, Uttara Phalguni, Uttara Bhadrapada, Revati
export const FAVORABLE_NAKSHATRAS = new Set([3, 4, 9, 12, 14, 16, 20, 11, 25, 26]);
// Inauspicious nakshatras: Bharani, Krittika, Ardra, Ashlesha, Jyeshtha, Mula
export const INAUSPICIOUS_NAKSHATRAS = new Set([1, 2, 5, 8, 17, 18]);

// Favorable weekdays for major events: Mon, Wed, Thu, Fri
export const FAVORABLE_VARAS = new Set([1, 3, 4, 5]);
// Inauspicious: Tuesday (Mars) for major events; Saturday for some
export const INAUSPICIOUS_VARAS = new Set([2]); // Tuesday

// Favorable yogas: Priti, Ayushman, Saubhagya, Shobhana, Sukarma, Dhriti, Vriddhi, Dhruva, Harshana, Siddhi, Shiva, Siddha, Sadhya, Shubha, Shukla, Brahma
export const FAVORABLE_YOGAS = new Set([1, 2, 3, 4, 6, 7, 10, 11, 13, 15, 19, 20, 21, 22, 23, 24]);
// Inauspicious yogas: Vishkambha, Atiganda, Shula, Ganda, Vyaghata, Vajra, Vyatipata, Variyana, Parigha, Indra, Vaidhriti
export const INAUSPICIOUS_YOGAS = new Set([0, 5, 8, 9, 12, 14, 16, 17, 18, 25, 26]);

// ============ TIER CLASSIFICATION (KNOWLEDGE BASE) ============
// Each value in each panchang category is classified into a tier:
//   "highly"    = Highly Auspicious (best)
//   "auspicious" = Auspicious (good)
//   "good"      = Good (acceptable)
//   "avoid"     = Inauspicious (disqualifies the slot)
export type Tier = "highly" | "auspicious" | "good" | "avoid";

export const TIER_LABEL_EN: Record<Tier, string> = {
  highly: "Highly Auspicious",
  auspicious: "Auspicious",
  good: "Good",
  avoid: "Avoid",
};
export const TIER_LABEL_GU: Record<Tier, string> = {
  highly: "અત્યંત શુભ",
  auspicious: "શુભ",
  good: "સારો",
  avoid: "ટાળો",
};

// --- Choghadiya ---
// Amrit, Shubh, Labh → Highly Auspicious
// Char → Auspicious (movable, good for travel)
// Dudh → Good (neutral)
// Udvega, Rog, Kaal → Avoid
export function classifyChoghadiya(name_en: string): Tier {
  switch (name_en) {
    case "Amrit":
    case "Shubh":
    case "Labh":
      return "highly";
    case "Char":
      return "auspicious";
    case "Dudh":
      return "good";
    case "Udvega":
    case "Rog":
    case "Kaal":
      return "avoid";
    default:
      return "good";
  }
}

// --- Hora (by ruling planet) ---
// Jupiter, Venus → Highly Auspicious (greatest benefics)
// Mercury, Moon → Auspicious (benefic)
// Sun → Good (fiery but life-giving)
// Mars, Saturn → Avoid (malefic)
export function classifyHora(lord_en: string): Tier {
  switch (lord_en) {
    case "Jupiter":
    case "Venus":
      return "highly";
    case "Mercury":
    case "Moon":
      return "auspicious";
    case "Sun":
      return "good";
    case "Mars":
    case "Saturn":
      return "avoid";
    default:
      return "good";
  }
}

// --- Tithi (index 0-29, 0=Shukla Pratipada ... 14=Purnima, 15=Krishna Pratipada ... 29=Amavasya) ---
// Highly Auspicious: Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, Trayodashi, Purnima
// Auspicious: Pratipada, Shashthi, Dwadashi
// Avoid: Chaturthi, Ashtami, Navami, Chaturdashi, Amavasya
export function classifyTithi(index: number): Tier {
  if (index === 14) return "highly"; // Purnima
  if (index === 29) return "avoid";  // Amavasya
  const mod = index % 15;
  switch (mod) {
    case 1: return "highly";  // Dwitiya
    case 2: return "highly";  // Tritiya
    case 4: return "highly";  // Panchami
    case 6: return "highly";  // Saptami
    case 9: return "highly";  // Dashami
    case 10: return "highly"; // Ekadashi
    case 12: return "highly"; // Trayodashi
    case 0: return "auspicious"; // Pratipada
    case 5: return "auspicious"; // Shashthi
    case 11: return "auspicious"; // Dwadashi
    case 3: return "avoid";   // Chaturthi
    case 7: return "avoid";   // Ashtami
    case 8: return "avoid";   // Navami
    case 13: return "avoid";  // Chaturdashi
    default: return "good";
  }
}

// --- Nakshatra (index 0-26) ---
// 0=Ashwini, 1=Bharani, 2=Krittika, 3=Rohini, 4=Mrigashira, 5=Ardra,
// 6=Punarvasu, 7=Pushya, 8=Ashlesha, 9=Magha, 10=Purva Phalguni,
// 11=Uttara Phalguni, 12=Hasta, 13=Chitra, 14=Swati, 15=Vishakha,
// 16=Anuradha, 17=Jyeshtha, 18=Mula, 19=Purva Ashadha, 20=Uttara Ashadha,
// 21=Shravana, 22=Dhanishta, 23=Shatabhisha, 24=Purva Bhadrapada,
// 25=Uttara Bhadrapada, 26=Revati
export function classifyNakshatra(index: number): Tier {
  const highly = new Set([3, 4, 7, 9, 11, 12, 14, 16, 20, 25, 26]); // Rohini, Mrigashira, Pushya, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati
  const auspicious = new Set([0, 6, 21, 22, 23]); // Ashwini, Punarvasu, Shravana, Dhanishta, Shatabhisha
  const good = new Set([1, 2, 13, 15]); // Bharani, Krittika, Chitra, Vishakha
  // Avoid: Ardra(5), Ashlesha(8), Jyeshtha(17), Mula(18), Purva Ashadha(19), Purva Bhadrapada(24), Purva Phalguni(10)
  if (highly.has(index)) return "highly";
  if (auspicious.has(index)) return "auspicious";
  if (good.has(index)) return "good";
  return "avoid";
}

// --- Yoga (index 0-26) ---
// 0=Vishkambha, 1=Priti, 2=Ayushman, 3=Saubhagya, 4=Shobhana, 5=Atiganda,
// 6=Sukarma, 7=Dhriti, 8=Shula, 9=Ganda, 10=Vriddhi, 11=Dhruva, 12=Vyaghata,
// 13=Harshana, 14=Vajra, 15=Siddhi, 16=Vyatipata, 17=Variyana, 18=Parigha,
// 19=Shiva, 20=Siddha, 21=Sadhya, 22=Shubha, 23=Shukla, 24=Brahma,
// 25=Indra, 26=Vaidhriti
export function classifyYoga(index: number): Tier {
  const highly = new Set([2, 3, 4, 6, 7, 10, 11, 13, 15, 19, 20, 21, 22, 23, 24]);
  const auspicious = new Set([1, 17]); // Priti, Variyana
  const good = new Set([25]); // Indra
  // Avoid: 0,5,8,9,12,14,16,18,26
  if (highly.has(index)) return "highly";
  if (auspicious.has(index)) return "auspicious";
  if (good.has(index)) return "good";
  return "avoid";
}

// --- Vara (weekday, event-specific) ---
// weekday: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
interface VaraConfig { highly: number[]; auspicious: number[]; good: number[]; avoid: number[] }
const EVENT_VARAS: Record<EventId, VaraConfig> = {
  marriage:          { highly: [1, 4, 5], auspicious: [3], good: [0], avoid: [2, 6] },
  housewarming:      { highly: [1, 4, 5], auspicious: [3], good: [0], avoid: [2, 6] },
  "vehicle-purchase":{ highly: [1, 4, 5], auspicious: [3, 0], good: [6], avoid: [2] },
  "gold-jewelry":    { highly: [5, 4], auspicious: [1, 3], good: [0], avoid: [2, 6] },
  "business-start":  { highly: [3, 4, 5], auspicious: [1], good: [0], avoid: [2, 6] },
  travel:            { highly: [3, 4, 5], auspicious: [1, 0], good: [6], avoid: [2] },
  "joining-job":     { highly: [4, 5], auspicious: [1, 3], good: [0], avoid: [2, 6] },
  "filing-case":     { highly: [3, 5], auspicious: [1, 4], good: [0], avoid: [2, 6] },
  "education-start": { highly: [3, 4, 5], auspicious: [1], good: [0], avoid: [2, 6] },
  "pooja-havan":     { highly: [1, 4, 5], auspicious: [3, 0], good: [6], avoid: [2] },
  "buying-property": { highly: [1, 4, 5], auspicious: [3], good: [0], avoid: [2, 6] },
  "opening-account": { highly: [3, 4, 5], auspicious: [1], good: [0], avoid: [2, 6] },
  "agreement-signing":{ highly: [3, 4, 5], auspicious: [1], good: [0], avoid: [2, 6] },
  "cooking-first-roti":{ highly: [1, 4, 5], auspicious: [3], good: [0], avoid: [2, 6] },
  "planting-tree":   { highly: [3, 4, 5], auspicious: [1], good: [0], avoid: [2, 6] },
  "shaving-haircut": { highly: [3, 5], auspicious: [1, 4], good: [0, 6], avoid: [2] },
  "naming-ceremony": { highly: [1, 4, 5], auspicious: [3], good: [0], avoid: [2, 6] },
  "surgery-medical": { highly: [4, 5], auspicious: [1, 3], good: [0], avoid: [2, 6] },
  others:            { highly: [1, 4, 5], auspicious: [3], good: [0], avoid: [2] },
};

export function classifyVara(weekday: number, event: EventId): Tier {
  const cfg = EVENT_VARAS[event] || EVENT_VARAS.others;
  if (cfg.highly.includes(weekday)) return "highly";
  if (cfg.auspicious.includes(weekday)) return "auspicious";
  if (cfg.good.includes(weekday)) return "good";
  return "avoid";
}

// Get favorable vara names for an event (for suggestions)
export function getFavorableVaras(event: EventId, lang: "en" | "gu"): string[] {
  const cfg = EVENT_VARAS[event] || EVENT_VARAS.others;
  const days_en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const days_gu = ["રવિવાર", "સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર"];
  return cfg.highly.map(d => lang === "gu" ? days_gu[d] : days_en[d]);
}

// --- Muhurat (standalone daily Muhurat periods) ---
// Abhijit Muhurat: 24 min around solar noon → Highly Auspicious
// Brahma Muhurat: 48 min ending 48 min before sunrise → Highly Auspicious
// Returns null if not in any Muhurat period (slot should be disqualified)
// Checks OVERLAP (slot overlaps with Muhurat period), not just start time.
export function classifyMuhurat(
  date: Date,
  loc: LatLng
): { tier: Tier; name_en: string; name_gu: string } | null {
  const slotEnd = new Date(date.getTime() + 30 * 60000); // 30-min slot
  const sunrise = getSunrise(date, loc);
  const sunset = getSunset(date, loc);

  // Abhijit Muhurat: ±12 min around solar noon
  if (sunrise && sunset) {
    const noon = new Date((sunrise.getTime() + sunset.getTime()) / 2);
    const abhijitStart = new Date(noon.getTime() - 12 * 60000);
    const abhijitEnd = new Date(noon.getTime() + 12 * 60000);
    // Check overlap: slot start < period end AND slot end > period start
    if (date < abhijitEnd && slotEnd > abhijitStart) {
      return { tier: "highly", name_en: "Abhijit", name_gu: "અભિજિત" };
    }
  }

  // Brahma Muhurat: last 48 min before sunrise (96 min to 48 min before sunrise)
  if (sunrise) {
    const brahmaStart = new Date(sunrise.getTime() - 96 * 60000);
    const brahmaEnd = new Date(sunrise.getTime() - 48 * 60000);
    if (date < brahmaEnd && slotEnd > brahmaStart) {
      return { tier: "highly", name_en: "Brahma", name_gu: "બ્રહ્મ" };
    }
  }

  return null;
}

// ============ SLOT CLASSIFICATION ============
export interface SlotClassification {
  choghadiya?: { name_en: string; name_gu: string; tier: Tier };
  hora?: { name_en: string; name_gu: string; tier: Tier };
  tithi?: { name_en: string; name_gu: string; tier: Tier };
  nakshatra?: { name_en: string; name_gu: string; tier: Tier };
  yoga?: { name_en: string; name_gu: string; tier: Tier };
  vara?: { name_en: string; name_gu: string; tier: Tier };
  muhurat?: { name_en: string; name_gu: string; tier: Tier; active: boolean };
}

/**
 * Classify a time slot across all selected methods.
 * Each method is STANDALONE — selecting Muhurat does NOT include Tithi/Nakshatra/Yoga.
 * Returns per-category tier + the overall tier (minimum across categories).
 */
export function classifySlot(
  date: Date,
  event: EventId,
  methods: MethodId[],
  loc: LatLng
): { classification: SlotClassification; overallTier: Tier; reasons_en: string[]; reasons_gu: string[] } {
  const classification: SlotClassification = {};
  const reasons_en: string[] = [];
  const reasons_gu: string[] = [];

  const choghadiya = getChoghadiya(date, loc);
  const slotChoghadiya = choghadiya.find((c) => date >= c.start && date < c.end);
  const horas = getHoras(date, loc);
  const slotHora = horas.find((h) => date >= h.start && date < h.end);

  const tithi = getTithi(date);
  const nakshatra = getNakshatra(date);
  const yoga = getYoga(date);
  const vara = getVara(date);

  const useChoghadiya = methods.includes("choghadiya");
  const useHora = methods.includes("hora");
  const useTithi = methods.includes("tithi");
  const useNakshatra = methods.includes("nakshatra");
  const useYoga = methods.includes("yoga") || methods.includes("muhurat"); // Yoga is part of Muhurat method
  const useMuhurat = methods.includes("muhurat");

  // Reason format: "Category: Value (Tier)"
  const addReason = (tier: Tier, name_en: string, name_gu: string, category_en: string, category_gu: string) => {
    const tierEn = TIER_LABEL_EN[tier];
    const tierGu = TIER_LABEL_GU[tier];
    reasons_en.push(`${category_en}: ${name_en} (${tierEn})`);
    reasons_gu.push(`${category_gu}: ${name_gu} (${tierGu})`);
  };

  if (useChoghadiya && slotChoghadiya) {
    const tier = classifyChoghadiya(slotChoghadiya.name_en);
    classification.choghadiya = { name_en: slotChoghadiya.name_en, name_gu: slotChoghadiya.name_gu, tier };
    addReason(tier, slotChoghadiya.name_en, slotChoghadiya.name_gu, "Choghadiya", "ચોઘડિયા");
  }
  if (useHora && slotHora) {
    const tier = classifyHora(slotHora.name_en);
    classification.hora = { name_en: slotHora.name_en, name_gu: slotHora.name_gu, tier };
    addReason(tier, slotHora.name_en, slotHora.name_gu, "Hora", "હોરા");
  }
  if (useTithi) {
    const tier = classifyTithi(tithi.index);
    classification.tithi = { name_en: tithi.name_en, name_gu: tithi.name_gu, tier };
    addReason(tier, tithi.name_en, tithi.name_gu, "Tithi", "તિથિ");
  }
  if (useNakshatra) {
    const tier = classifyNakshatra(nakshatra.index);
    classification.nakshatra = { name_en: nakshatra.name_en, name_gu: nakshatra.name_gu, tier };
    addReason(tier, nakshatra.name_en, nakshatra.name_gu, "Nakshatra", "નક્ષત્ર");
  }
  if (useYoga) {
    const tier = classifyYoga(yoga.index);
    classification.yoga = { name_en: yoga.name_en, name_gu: yoga.name_gu, tier };
    addReason(tier, yoga.name_en, yoga.name_gu, "Yoga", "યોગ");
  }

  // Vara: always classify for DISPLAY. Include in tier calculation BUT
  // "avoid" does NOT disqualify — it caps the tier at "good" (so Tuesday
  // slots still show, just can't be "highly" or "auspicious").
  const varaTier = classifyVara(vara.index, event);
  classification.vara = { name_en: vara.name_en, name_gu: vara.name_gu, tier: varaTier };
  if (varaTier !== "avoid") {
    addReason(varaTier, vara.name_en, vara.name_gu, "Vara", "વાર");
  }

  // Muhurat: If selected ALONE (only method), disqualify non-Muhurat slots.
  // If selected WITH other methods, Muhurat is OPTIONAL — always show it
  // (display "None" when not in a period, so user can see it's being calculated).
  const muhuratOnlyMethod = useMuhurat && methods.length === 1;
  let muhuratDisqualify = false;
  if (useMuhurat) {
    const m = classifyMuhurat(date, loc);
    if (m) {
      // In a Muhurat period (Abhijit or Brahma) — active, contributes to tier
      classification.muhurat = { ...m, active: true };
      addReason(m.tier, m.name_en, m.name_gu, "Muhurat", "મુહૂર્ત");
    } else if (muhuratOnlyMethod) {
      // Muhurat is the ONLY method — disqualify if not in a Muhurat period
      muhuratDisqualify = true;
    } else {
      // Combined with other methods — show "None" for display (doesn't affect tier)
      classification.muhurat = {
        name_en: "None",
        name_gu: "કોઈ નહીં",
        tier: "good",
        active: false,
      };
    }
  }

  // Compute overall tier = MINIMUM tier across all active categories.
  // Vara is included but "avoid" is treated as "good" (caps at good, doesn't disqualify).
  // Muhurat is only included when "active" (in an actual Muhurat period).
  const order: Record<Tier, number> = { highly: 3, auspicious: 2, good: 1, avoid: 0 };
  const tiers: Tier[] = [];
  if (classification.choghadiya) tiers.push(classification.choghadiya.tier);
  if (classification.hora) tiers.push(classification.hora.tier);
  if (classification.tithi) tiers.push(classification.tithi.tier);
  if (classification.nakshatra) tiers.push(classification.nakshatra.tier);
  if (classification.yoga) tiers.push(classification.yoga.tier);
  // Only include Muhurat in tier calc when active (in a real Muhurat period)
  if (classification.muhurat?.active) tiers.push(classification.muhurat.tier);
  // Vara: include but cap "avoid" → "good" (so it doesn't disqualify the slot)
  if (classification.vara) {
    tiers.push(classification.vara.tier === "avoid" ? "good" : classification.vara.tier);
  }

  let overallTier: Tier = "good";
  if (tiers.length > 0) {
    overallTier = tiers.reduce((min, t) =>
      order[t] < order[min] ? t : min, tiers[0]);
  }

  // If Muhurat was the ONLY method and slot is not in a Muhurat period → disqualify
  if (muhuratDisqualify) {
    overallTier = "avoid";
  }

  return { classification, overallTier, reasons_en, reasons_gu };
}

/** Count how many categories are "highly" in a classification (for sorting) */
export function countHighly(classification: SlotClassification): number {
  let count = 0;
  if (classification.choghadiya?.tier === "highly") count++;
  if (classification.hora?.tier === "highly") count++;
  if (classification.tithi?.tier === "highly") count++;
  if (classification.nakshatra?.tier === "highly") count++;
  if (classification.yoga?.tier === "highly") count++;
  if (classification.vara?.tier === "highly") count++;
  if (classification.muhurat?.active && classification.muhurat?.tier === "highly") count++;
  return count;
}

// ============ SCORE & RANK (TIER-BASED) ============
export interface ScoredSlot {
  start: Date;
  end: Date;
  tier: Tier;           // overall tier of this slot
  classification: SlotClassification;
  reasons_en: string[];
  reasons_gu: string[];
  method: MethodId;
}

/** Resolve "auto" method selection to a concrete list of methods (>=2). */
export function resolveAutoMethods(event: EventId): MethodId[] {
  const eventDef = EVENTS.find((e) => e.id === event);
  if (eventDef && eventDef.recommendedMethods.length >= 2) {
    return eventDef.recommendedMethods;
  }
  return ["choghadiya", "hora"];
}

/** Resolve "all" method to every concrete method. */
export function resolveAllMethods(): MethodId[] {
  return ["choghadiya", "hora", "tithi", "nakshatra", "yoga", "muhurat"];
}

/** Expand any meta-methods ("auto", "all") into concrete method lists. */
export function resolveMethods(methods: MethodId[]): MethodId[] {
  const out: MethodId[] = [];
  for (const m of methods) {
    if (m === "auto") {
      continue;
    }
    if (m === "all") {
      out.push(...resolveAllMethods());
    } else {
      out.push(m);
    }
  }
  return Array.from(new Set(out));
}

export interface TimeWindow {
  startHour: number; // 0-23.99 (decimal hour)
  endHour: number;
}

export interface TieredResults {
  highly: ScoredSlot[];
  auspicious: ScoredSlot[];
  good: ScoredSlot[];
}

/**
 * Find best time slots across multiple dates using TIER-BASED classification.
 *
 * Logic:
 * - Each 30-min slot is classified across all selected methods + Vara.
 * - A slot's overall tier = MINIMUM tier across ALL categories (including Vara).
 * - If any category is "avoid", the slot is DISQUALIFIED (not shown).
 *
 * CUMULATIVE TIERS (the user's formula):
 * - Highly Auspicious tile: ONLY slots where overallTier === "highly"
 * - Auspicious tile: slots where overallTier is "highly" OR "auspicious"
 * - Good tile: slots where overallTier is "highly" OR "auspicious" OR "good"
 *
 * So: Good count >= Auspicious count >= Highly count (always).
 *
 * SORTING: Within each tier, slots are sorted by the number of "highly"
 * categories (descending) — slots with more highly-rated factors appear first.
 * Ties broken chronologically.
 */
export function findBestTimings(
  dates: Date[],
  event: EventId,
  methods: MethodId[],
  loc: LatLng,
  options?: {
    timeWindow?: TimeWindow;
    topNPerDate?: number;
  }
): TieredResults {
  const topNPerDate = options?.topNPerDate ?? 10;
  // Default scan: 4 AM to 9 PM (4 AM captures Brahma Muhurat before sunrise)
  const startHour = options?.timeWindow?.startHour ?? 4;
  const endHour = options?.timeWindow?.endHour ?? 21;

  // Collect per-date slots (we'll bucket into cumulative tiers after)
  const byDate = new Map<string, ScoredSlot[]>();

  for (const date of dates) {
    // Compute local Y/M/D from the date using tzOffset
    const localMs = date.getTime() + loc.tzOffsetHours * 3600000;
    const local = new Date(localMs);
    const y = local.getUTCFullYear();
    const mo = local.getUTCMonth();
    const dd = local.getUTCDate();
    const dateKey = `${y}-${mo}-${dd}`;

    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    const daySlots = byDate.get(dateKey)!;

    for (let h = Math.floor(startHour); h <= Math.floor(endHour); h++) {
      for (let m = 0; m < 60; m += 30) {
        const decHour = h + m / 60;
        if (decHour < startHour || decHour + 0.5 > endHour) continue;
        const slotStart = new Date(
          Date.UTC(y, mo, dd, h, m, 0, 0) - loc.tzOffsetHours * 3600000
        );
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

        const { classification, overallTier, reasons_en, reasons_gu } =
          classifySlot(slotStart, event, methods, loc);

        // Skip "avoid" slots entirely
        if (overallTier === "avoid") continue;

        daySlots.push({
          start: slotStart,
          end: slotEnd,
          tier: overallTier,
          classification,
          reasons_en,
          reasons_gu,
          method: methods[0] ?? "choghadiya",
        });
      }
    }
  }

  // Now bucket into CUMULATIVE tiers across ALL dates
  const allSlots = Array.from(byDate.values()).flat();

  // Sort by: (1) count of "highly" categories desc, (2) chronological
  const sortByHighlyCount = (a: ScoredSlot, b: ScoredSlot) => {
    const aCount = countHighly(a.classification);
    const bCount = countHighly(b.classification);
    if (bCount !== aCount) return bCount - aCount;
    return a.start.getTime() - b.start.getTime();
  };

  // Cumulative buckets:
  // highly = only overallTier === "highly"
  // auspicious = overallTier is "highly" OR "auspicious"
  // good = overallTier is "highly" OR "auspicious" OR "good"
  const highly = allSlots
    .filter((s) => s.tier === "highly")
    .sort(sortByHighlyCount);
  const auspicious = allSlots
    .filter((s) => s.tier === "highly" || s.tier === "auspicious")
    .sort(sortByHighlyCount);
  const good = allSlots
    .filter((s) => s.tier === "highly" || s.tier === "auspicious" || s.tier === "good")
    .sort(sortByHighlyCount);

  return { highly, auspicious, good };
}

/**
 * Suggestion: scan nearby dates (±5 days around user's selected dates) that are
 * NOT in the user's selection, and find a "Highly Auspicious" slot there.
 * Also includes favorable vara info for the event.
 */
export interface Suggestion {
  date: Date;
  start: Date;
  end: Date;
  tier: Tier;
  label_en: string;
  label_gu: string;
  vara_en: string;
  vara_gu: string;
  favorableVaras_en: string[];
  favorableVaras_gu: string[];
}

export function findBetterSuggestion(
  selectedDates: Date[],
  event: EventId,
  methods: MethodId[],
  loc: LatLng,
  _currentBestScore: number
): Suggestion | null {
  if (selectedDates.length === 0) return null;
  const selectedKeys = new Set(selectedDates.map((d) => d.toDateString()));

  // Scan ±5 days around each selected date
  const candidates: Date[] = [];
  for (const d of selectedDates) {
    for (let offset = -5; offset <= 5; offset++) {
      if (offset === 0) continue;
      const candidate = new Date(d);
      candidate.setDate(candidate.getDate() + offset);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (candidate < today) continue;
      if (!selectedKeys.has(candidate.toDateString())) {
        candidates.push(new Date(candidate));
      }
    }
  }

  if (candidates.length === 0) return null;

  const results = findBestTimings(candidates, event, methods, loc, {
    topNPerDate: 1,
  });

  // Only suggest Highly Auspicious nearby slots
  if (results.highly.length === 0) return null;

  const best = results.highly[0];
  const vara = getVara(best.start);
  return {
    date: new Date(best.start),
    start: best.start,
    end: best.end,
    tier: best.tier,
    label_en: TIER_LABEL_EN[best.tier],
    label_gu: TIER_LABEL_GU[best.tier],
    vara_en: vara.name_en,
    vara_gu: vara.name_gu,
    favorableVaras_en: getFavorableVaras(event, "en"),
    favorableVaras_gu: getFavorableVaras(event, "gu"),
  };
}

// ============ LOCATIONS (Gujarat focus, expandable to India) ============
export interface CityDef {
  name_en: string;
  name_gu: string;
  lat: number;
  lng: number;
  state: string;
}

export const CITIES: CityDef[] = [
  // Gujarat
  { name_en: "Ahmedabad", name_gu: "અમદાવાદ", lat: 23.0225, lng: 72.5714, state: "Gujarat" },
  { name_en: "Surat", name_gu: "સુરત", lat: 21.1702, lng: 72.8311, state: "Gujarat" },
  { name_en: "Vadodara", name_gu: "વડોદરા", lat: 22.3072, lng: 73.1812, state: "Gujarat" },
  { name_en: "Rajkot", name_gu: "રાજકોટ", lat: 22.3039, lng: 70.8022, state: "Gujarat" },
  { name_en: "Bhavnagar", name_gu: "ભાવનગર", lat: 21.7716, lng: 72.1637, state: "Gujarat" },
  { name_en: "Jamnagar", name_gu: "જામનગર", lat: 22.4707, lng: 70.0577, state: "Gujarat" },
  { name_en: "Junagadh", name_gu: "જૂનાગઢ", lat: 21.5222, lng: 70.4579, state: "Gujarat" },
  { name_en: "Gandhinagar", name_gu: "ગાંધીનગર", lat: 23.2156, lng: 72.6369, state: "Gujarat" },
  { name_en: "Anand", name_gu: "આનંદ", lat: 22.5645, lng: 72.9289, state: "Gujarat" },
  { name_en: "Nadiad", name_gu: "નડિયાદ", lat: 22.6916, lng: 72.8634, state: "Gujarat" },
  { name_en: "Mehsana", name_gu: "મહેસાણા", lat: 23.5926, lng: 72.3809, state: "Gujarat" },
  { name_en: "Bharuch", name_gu: "ભરૂચ", lat: 21.7051, lng: 72.9969, state: "Gujarat" },
  { name_en: "Vapi", name_gu: "વાપી", lat: 20.3893, lng: 72.9096, state: "Gujarat" },
  { name_en: "Gandhidham", name_gu: "ગાંધીધામ", lat: 23.0772, lng: 70.1304, state: "Gujarat" },
  { name_en: "Bhuj", name_gu: "ભુજ", lat: 23.2420, lng: 69.6669, state: "Gujarat" },
  { name_en: "Porbandar", name_gu: "પોરબંદર", lat: 21.6417, lng: 69.6293, state: "Gujarat" },
  { name_en: "Veraval", name_gu: "વેરાવળ", lat: 20.9080, lng: 70.3685, state: "Gujarat" },
  { name_en: "Morbi", name_gu: "મોરબી", lat: 22.8115, lng: 70.8378, state: "Gujarat" },
  { name_en: "Patan", name_gu: "પાટણ", lat: 23.8512, lng: 72.1214, state: "Gujarat" },
  { name_en: "Godhra", name_gu: "ગોધરા", lat: 22.7788, lng: 73.6143, state: "Gujarat" },
  { name_en: "Navsari", name_gu: "નવસારી", lat: 20.9517, lng: 72.9377, state: "Gujarat" },
  { name_en: "Valsad", name_gu: "વલસાડ", lat: 20.5992, lng: 72.9342, state: "Gujarat" },
  { name_en: "Palanpur", name_gu: "પાલનપુર", lat: 24.1755, lng: 72.4317, state: "Gujarat" },
  { name_en: "Surendranagar", name_gu: "સુરેન્દ્રનગર", lat: 22.7285, lng: 71.6375, state: "Gujarat" },
  // Major India cities (for future expansion)
  { name_en: "Mumbai", name_gu: "મુંબઈ", lat: 19.0760, lng: 72.8777, state: "Maharashtra" },
  { name_en: "Delhi", name_gu: "દિલ્હી", lat: 28.6139, lng: 77.2090, state: "Delhi" },
  { name_en: "Pune", name_gu: "પુણે", lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
  { name_en: "Bengaluru", name_gu: "બેંગ્લોર", lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  { name_en: "Jaipur", name_gu: "જયપુર", lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  { name_en: "Udaipur", name_gu: "ઉદયપુર", lat: 24.5854, lng: 73.7125, state: "Rajasthan" },
];
