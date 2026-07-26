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
    description_en: "Special Muhurats (Abhijit, Brahma, Vijaya, Godhuli, Pradosh, Nishita)",
    description_gu: "ખાસ મુહૂર્ત (અભિજિત, બ્રહ્મ, વિજય, ગોધૂલિ, પ્રદોષ, નિશિથ)",
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
// Returns active Special Auspicious Muhurat if slot overlaps with any special window
// Special Muhurats: Abhijit, Brahma, Vijaya, Godhuli, Pradosh, Nishita
export function classifyMuhurat(
  date: Date,
  loc: LatLng
): { tier: Tier; name_en: string; name_gu: string } | null {
  const slotEnd = new Date(date.getTime() + 30 * 60000); // 30-min slot
  const sunrise = getSunrise(date, loc);
  const sunset = getSunset(date, loc);

  if (!sunrise || !sunset) return null;

  const overlaps = (start: Date, end: Date) => date < end && slotEnd > start;

  // 1. Abhijit Muhurat: ±12 min around solar noon → Highly Auspicious
  const noon = new Date((sunrise.getTime() + sunset.getTime()) / 2);
  const abhijitStart = new Date(noon.getTime() - 12 * 60000);
  const abhijitEnd = new Date(noon.getTime() + 12 * 60000);
  if (overlaps(abhijitStart, abhijitEnd)) {
    return { tier: "highly", name_en: "Abhijit", name_gu: "અભિજિત" };
  }

  // 2. Brahma Muhurat: 96 min to 48 min before sunrise → Highly Auspicious
  const brahmaStart = new Date(sunrise.getTime() - 96 * 60000);
  const brahmaEnd = new Date(sunrise.getTime() - 48 * 60000);
  if (overlaps(brahmaStart, brahmaEnd)) {
    return { tier: "highly", name_en: "Brahma", name_gu: "બ્રહ્મ" };
  }

  // 3. Vijaya Muhurat: 11th Muhurat of daylight (10/15 to 11/15 of day) → Highly Auspicious
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const vijayaStart = new Date(sunrise.getTime() + (dayDuration * 10) / 15);
  const vijayaEnd = new Date(sunrise.getTime() + (dayDuration * 11) / 15);
  if (overlaps(vijayaStart, vijayaEnd)) {
    return { tier: "highly", name_en: "Vijaya", name_gu: "વિજય" };
  }

  // 4. Godhuli Muhurat: ±15 min around sunset → Auspicious
  const godhuliStart = new Date(sunset.getTime() - 15 * 60000);
  const godhuliEnd = new Date(sunset.getTime() + 15 * 60000);
  if (overlaps(godhuliStart, godhuliEnd)) {
    return { tier: "auspicious", name_en: "Godhuli", name_gu: "ગોધૂલિ" };
  }

  // 5. Pradosh Kaal: Sunset to 90 min after sunset → Auspicious
  const pradoshStart = new Date(sunset.getTime());
  const pradoshEnd = new Date(sunset.getTime() + 90 * 60000);
  if (overlaps(pradoshStart, pradoshEnd)) {
    return { tier: "auspicious", name_en: "Pradosh", name_gu: "પ્રદોષ" };
  }

  // 6. Nishita Muhurat: ±24 min around solar midnight → Auspicious
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextSunrise = getSunrise(nextDay, loc) || new Date(sunset.getTime() + 12 * 3600000);
  const nightDuration = nextSunrise.getTime() - sunset.getTime();
  const midnight = new Date(sunset.getTime() + nightDuration / 2);
  const nishitaStart = new Date(midnight.getTime() - 24 * 60000);
  const nishitaEnd = new Date(midnight.getTime() + 24 * 60000);
  if (overlaps(nishitaStart, nishitaEnd)) {
    return { tier: "auspicious", name_en: "Nishita", name_gu: "નિશિથ" };
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

function getHoraForTime(date: Date, loc: LatLng) {
  const todayHoras = getHoras(date, loc);
  let slot = todayHoras.find((h) => date >= h.start && date < h.end);
  if (slot) return slot;

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayHoras = getHoras(yesterday, loc);
  slot = yesterdayHoras.find((h) => date >= h.start && date < h.end);
  if (slot) return slot;

  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowHoras = getHoras(tomorrow, loc);
  return tomorrowHoras.find((h) => date >= h.start && date < h.end);
}

function getChoghadiyaForTime(date: Date, loc: LatLng) {
  const todayChoghadiyas = getChoghadiya(date, loc);
  let slot = todayChoghadiyas.find((c) => date >= c.start && date < c.end);
  if (slot) return slot;

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayChoghadiyas = getChoghadiya(yesterday, loc);
  slot = yesterdayChoghadiyas.find((c) => date >= c.start && date < c.end);
  if (slot) return slot;

  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowChoghadiyas = getChoghadiya(tomorrow, loc);
  return tomorrowChoghadiyas.find((c) => date >= c.start && date < c.end);
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

  const slotChoghadiya = getChoghadiyaForTime(date, loc);
  const slotHora = getHoraForTime(date, loc);

  const tithi = getTithi(date);
  const nakshatra = getNakshatra(date);
  const yoga = getYoga(date);
  const vara = getVara(date);

  const useChoghadiya = methods.includes("choghadiya");
  const useHora = methods.includes("hora");
  const useTithi = methods.includes("tithi");
  const useNakshatra = methods.includes("nakshatra");
  const useYoga = methods.includes("yoga");
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

  // Compute overall tier across active selected categories.
  const order: Record<Tier, number> = { highly: 3, auspicious: 2, good: 1, avoid: 0 };
  const tiers: Tier[] = [];

  if (classification.choghadiya) tiers.push(classification.choghadiya.tier);
  if (classification.hora) tiers.push(classification.hora.tier);
  if (classification.tithi) tiers.push(classification.tithi.tier);
  if (classification.nakshatra) tiers.push(classification.nakshatra.tier);
  if (classification.yoga) tiers.push(classification.yoga.tier);
  if (classification.muhurat?.active) tiers.push(classification.muhurat.tier);

  let overallTier: Tier = "good";

  if (muhuratOnlyMethod) {
    // If Muhurat is the ONLY selected method:
    // Active Special Muhurats dictate Highly or Auspicious tier.
    // Slots without an active Special Muhurat are disqualified (avoid).
    if (classification.muhurat?.active) {
      overallTier = classification.muhurat.tier;
    } else {
      overallTier = "avoid";
    }
  } else {
    // If any active selected category is "avoid", tier is "avoid"
    if (tiers.includes("avoid")) {
      overallTier = "avoid";
    } else if (tiers.length > 0) {
      const avg = tiers.reduce((sum, t) => sum + order[t], 0) / tiers.length;
      if (avg >= 2.5) overallTier = "highly";
      else if (avg >= 1.5) overallTier = "auspicious";
      else overallTier = "good";
    }
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
  // Default scan: 0 (midnight) to 24 (next midnight) to cover all 24 hours including night Muhurats
  const startHour = options?.timeWindow?.startHour ?? 0;
  const endHour = options?.timeWindow?.endHour ?? 24;

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

        // Filter out past slots (slots that have already ended relative to current instant)
        const now = new Date();
        if (slotEnd.getTime() <= now.getTime()) continue;

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

  // Cumulative tier buckets per user specification:
  // Highly Auspicious = only s.tier === "highly"
  // Auspicious = s.tier === "highly" || s.tier === "auspicious"
  // Good = s.tier === "highly" || s.tier === "auspicious" || s.tier === "good"
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

  // Suggest best highly slot first; fallback to best auspicious slot if no highly slots exist
  const best = results.highly[0] || results.auspicious[0];
  if (!best) return null;
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

/**
 * Find the single #1 Best Recommended Timing for selected dates/timeframe.
 * Evaluates across ALL 6 methods regardless of what user selected in wizard.
 * Strictly considers ONLY "highly" and "auspicious" slots (never "good").
 * Returns null if no highly or auspicious slot exists.
 */
export function findBestRecommendedTiming(
  dates: Date[],
  event: EventId,
  loc: LatLng,
  options?: {
    timeWindow?: TimeWindow;
  }
): ScoredSlot | null {
  if (dates.length === 0) return null;

  const ALL_METHODS: MethodId[] = ["choghadiya", "hora", "tithi", "nakshatra", "yoga", "muhurat"];

  const results = findBestTimings(dates, event, ALL_METHODS, loc, {
    timeWindow: options?.timeWindow,
    topNPerDate: 10,
  });

  // Must have an active Special Muhurat (Abhijit, Brahma, Vijaya, Godhuli, Pradosh, Nishita)
  const isSpecialMuhuratSlot = (s: ScoredSlot) => Boolean(s.classification.muhurat?.active);

  // Top Highly Auspicious Special Muhurat slot first
  const bestHighly = results.highly.find(isSpecialMuhuratSlot);
  if (bestHighly) return bestHighly;

  // Fallback to top Auspicious Special Muhurat slot
  const bestAuspicious = results.auspicious.find(isSpecialMuhuratSlot);
  if (bestAuspicious) return bestAuspicious;

  // If no slot has an active Special Muhurat on those dates/timeframe, return null
  return null;
}

// ============ LOCATIONS (Gujarat focus, expandable to India) ============
import { haversineDistance } from "./time-utils";

export interface CityDef {
  name_en: string;
  name_gu: string;
  lat: number;
  lng: number;
  state: string;
  tz?: string;
}

export const CITIES: CityDef[] = [
  // Gujarat
  { name_en: "Ahmedabad", name_gu: "અમદાવાદ", lat: 23.0225, lng: 72.5714, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Surat", name_gu: "સુરત", lat: 21.1702, lng: 72.8311, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Vadodara", name_gu: "વડોદરા", lat: 22.3072, lng: 73.1812, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Rajkot", name_gu: "રાજકોટ", lat: 22.3039, lng: 70.8022, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Bhavnagar", name_gu: "ભાવનગર", lat: 21.7716, lng: 72.1637, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Jamnagar", name_gu: "જામનગર", lat: 22.4707, lng: 70.0577, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Junagadh", name_gu: "જૂનાગઢ", lat: 21.5222, lng: 70.4579, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Gandhinagar", name_gu: "ગાંધીનગર", lat: 23.2156, lng: 72.6369, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Anand", name_gu: "આનંદ", lat: 22.5645, lng: 72.9289, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Nadiad", name_gu: "નડિયાદ", lat: 22.6916, lng: 72.8634, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Mehsana", name_gu: "મહેસાણા", lat: 23.5926, lng: 72.3809, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Bharuch", name_gu: "ભરૂચ", lat: 21.7051, lng: 72.9969, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Vapi", name_gu: "વાપી", lat: 20.3893, lng: 72.9096, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Gandhidham", name_gu: "ગાંધીધામ", lat: 23.0772, lng: 70.1304, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Bhuj", name_gu: "ભુજ", lat: 23.2420, lng: 69.6669, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Porbandar", name_gu: "પોરબંદર", lat: 21.6417, lng: 69.6293, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Veraval", name_gu: "વેરાવળ", lat: 20.9080, lng: 70.3685, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Morbi", name_gu: "મોરબી", lat: 22.8115, lng: 70.8378, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Patan", name_gu: "પાટણ", lat: 23.8512, lng: 72.1214, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Godhra", name_gu: "ગોધરા", lat: 22.7788, lng: 73.6143, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Navsari", name_gu: "નવસારી", lat: 20.9517, lng: 72.9377, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Valsad", name_gu: "વલસાડ", lat: 20.5992, lng: 72.9342, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Palanpur", name_gu: "પાલનપુર", lat: 24.1755, lng: 72.4317, state: "Gujarat", tz: "Asia/Kolkata" },
  { name_en: "Surendranagar", name_gu: "સુરેન્દ્રનગર", lat: 22.7285, lng: 71.6375, state: "Gujarat", tz: "Asia/Kolkata" },
  // Major India cities
  { name_en: "Mumbai", name_gu: "મુંબઈ", lat: 19.0760, lng: 72.8777, state: "Maharashtra", tz: "Asia/Kolkata" },
  { name_en: "Delhi", name_gu: "દિલ્હી", lat: 28.6139, lng: 77.2090, state: "Delhi", tz: "Asia/Kolkata" },
  { name_en: "Pune", name_gu: "પુણે", lat: 18.5204, lng: 73.8567, state: "Maharashtra", tz: "Asia/Kolkata" },
  { name_en: "Bengaluru", name_gu: "બેંગ્લોર", lat: 12.9716, lng: 77.5946, state: "Karnataka", tz: "Asia/Kolkata" },
  { name_en: "Jaipur", name_gu: "જયપુર", lat: 26.9124, lng: 75.7873, state: "Rajasthan", tz: "Asia/Kolkata" },
  { name_en: "Udaipur", name_gu: "ઉદયપુર", lat: 24.5854, lng: 73.7125, state: "Rajasthan", tz: "Asia/Kolkata" },
  // Major International Cities
  { name_en: "London", name_gu: "લંડન", lat: 51.5074, lng: -0.1278, state: "United Kingdom", tz: "Europe/London" },
  { name_en: "New York", name_gu: "ન્યૂ યોર્ક", lat: 40.7128, lng: -74.0060, state: "USA", tz: "America/New_York" },
  { name_en: "San Francisco", name_gu: "સેન ફ્રાન્સિસ્કો", lat: 37.7749, lng: -122.4194, state: "USA", tz: "America/Los_Angeles" },
  { name_en: "Chicago", name_gu: "શિકાગો", lat: 41.8781, lng: -87.6298, state: "USA", tz: "America/Chicago" },
  { name_en: "Toronto", name_gu: "ટોરોન્ટો", lat: 43.6532, lng: -79.3832, state: "Canada", tz: "America/Toronto" },
  { name_en: "Vancouver", name_gu: "વેંકુવર", lat: 49.2827, lng: -123.1207, state: "Canada", tz: "America/Vancouver" },
  { name_en: "Dubai", name_gu: "દુબઈ", lat: 25.2048, lng: 55.2708, state: "UAE", tz: "Asia/Dubai" },
  { name_en: "Abu Dhabi", name_gu: "અબુ ધાબી", lat: 24.4539, lng: 54.3773, state: "UAE", tz: "Asia/Dubai" },
  { name_en: "Riyadh", name_gu: "રિયાધ", lat: 24.7136, lng: 46.6753, state: "Saudi Arabia", tz: "Asia/Riyadh" },
  { name_en: "Singapore", name_gu: "સિંગાપુર", lat: 1.3521, lng: 103.8198, state: "Singapore", tz: "Asia/Singapore" },
  { name_en: "Sydney", name_gu: "સિડની", lat: -33.8688, lng: 151.2093, state: "Australia", tz: "Australia/Sydney" },
  { name_en: "Melbourne", name_gu: "મેલબોર્ન", lat: -37.8136, lng: 144.9631, state: "Australia", tz: "Australia/Melbourne" },
  { name_en: "Auckland", name_gu: "ઓકલેન્ડ", lat: -36.8485, lng: 174.7633, state: "New Zealand", tz: "Pacific/Auckland" },
  { name_en: "Tokyo", name_gu: "ટોક્યો", lat: 35.6762, lng: 139.6503, state: "Japan", tz: "Asia/Tokyo" },
  { name_en: "Bangkok", name_gu: "બેંગકોક", lat: 13.7563, lng: 100.5018, state: "Thailand", tz: "Asia/Bangkok" },
  { name_en: "Paris", name_gu: "પેરિસ", lat: 48.8566, lng: 2.3522, state: "France", tz: "Europe/Paris" },
  { name_en: "Frankfurt", name_gu: "ફ્રેન્કફર્ટ", lat: 50.1109, lng: 8.6821, state: "Germany", tz: "Europe/Berlin" },
];

/**
 * Finds the nearest matching city within a threshold distance (default 50 km) using Haversine distance.
 */
export function findNearestCity(lat: number, lng: number, thresholdKm = 50): CityDef | null {
  let nearest: CityDef | null = null;
  let minDistance = Infinity;

  for (const city of CITIES) {
    const dist = haversineDistance(lat, lng, city.lat, city.lng);
    if (dist < minDistance && dist <= thresholdKm) {
      minDistance = dist;
      nearest = city;
    }
  }

  return nearest;
}

