/**
 * Shubh Samay — i18n strings (English + Gujarati)
 */

export type Lang = "en" | "gu";

export const STRINGS = {
  // App
  appName: { en: "Shubh Samay", gu: "શુભ સમય" },
  appTagline: {
    en: "Find auspicious timings for life's important moments",
    gu: "જીવનની મહત્વની પળો માટે શુભ સમય જાણો",
  },

  // Wizard steps
  step: { en: "Step", gu: "પગલું" },
  stepEvent: { en: "Choose Event", gu: "પ્રસંગ પસંદ કરો" },
  stepEventDesc: { en: "What do you need auspicious timing for?", gu: "તમને શું માટે શુભ સમય જોઈએ?" },
  stepMethod: { en: "Choose Methods", gu: "પદ્ધતિઓ પસંદ કરો" },
  stepMethodDesc: {
    en: "Select one or more methods to combine (Auto picks the best mix)",
    gu: "એક કે વધુ પદ્ધતિઓ પસંદ કરો (ઓટો શ્રેષ્ઠ મિશ્રણ પસંદ કરે)",
  },
  stepDates: { en: "Choose Dates", gu: "તારીખો પસંદ કરો" },
  stepDatesDesc: {
    en: "Pick dates or a range, and optionally a time window",
    gu: "તારીખો કે સમયગાળો પસંદ કરો, અને વૈકલ્પિક સમય",
  },
  stepResults: { en: "Best Timings", gu: "શ્રેષ્ઠ સમય" },
  stepResultsDesc: { en: "Top auspicious time slots for your event", gu: "તમારા પ્રસંગ માટે શ્રેષ્ઠ સમય" },

  // Actions
  next: { en: "Next", gu: "આગળ" },
  back: { en: "Back", gu: "પાછળ" },
  findTimings: { en: "Find Auspicious Timings", gu: "શુભ સમય શોધો" },
  startOver: { en: "Start Over", gu: "ફરી શરૂ કરો" },
  changeDateAndTime: { en: "Change date and time", gu: "તારીખ અને સમય બદલો" },
  addDate: { en: "Add Date", gu: "તારીખ ઉમેરો" },
  addAnotherDate: { en: "Add Another Date", gu: "બીજી તારીખ ઉમેરો" },
  addTime: { en: "Add Time Window", gu: "સમય સીમા ઉમેરો" },
  removeTime: { en: "Remove Time Window", gu: "સમય સીમા દૂર કરો" },
  remove: { en: "Remove", gu: "દૂર કરો" },
  language: { en: "ગુજરાતી", gu: "English" },

  // Date modes
  modeIndividual: { en: "Individual Dates", gu: "જુદી જુદી તારીખો" },
  modeRange: { en: "Date Range", gu: "તારીખ સમયગાળો" },
  startDate: { en: "Start Date", gu: "શરૂ તારીખ" },
  endDate: { en: "End Date", gu: "અંતિમ તારીખ" },
  rangeTooLong: {
    en: "Range cannot exceed 30 days",
    gu: "સમયગાળો ૩૦ દિવસથી વધુ ન હોઈ શકે",
  },
  timeFrom: { en: "From", gu: "થી" },
  timeTo: { en: "To", gu: "સુધી" },
  timeOptional: {
    en: "Optional — restrict search to a time window",
    gu: "વૈકલ્પિક — સમય સીમામાં શોધો",
  },
  addRange: { en: "Add Range", gu: "સમયગાળો ઉમેરો" },
  alreadyAdded: { en: "Already added", gu: "પહેલેથી છે" },
  home: { en: "Home", gu: "હોમ" },

  // Location
  selectLocation: { en: "Select Location", gu: "સ્થળ પસંદ કરો" },
  searchLocation: { en: "Search city...", gu: "શહેર શોધો..." },
  defaultLocation: { en: "Ahmedabad", gu: "અમદાવાદ" },

  // Results tiers
  highlyAuspicious: { en: "Highly Auspicious", gu: "અત્યંત શુભ" },
  auspicious: { en: "Auspicious", gu: "શુભ" },
  noHighlyAuspicious: {
    en: "No Highly Auspicious slots found in your selected dates.",
    gu: "તમારી પસંદ કરેલી તારીખોમાં અત્યંત શુભ સમય મળ્યો નથી.",
  },
  showAuspicious: {
    en: "Show Auspicious Timings",
    gu: "શુભ સમય બતાવો",
  },
  suggestionTitle: {
    en: "Better timing found nearby",
    gu: "નજીકમાં વધુ શુભ સમય મળ્યો",
  },
  suggestionBody: {
    en: "Consider adding this date for an even more auspicious time:",
    gu: "વધુ શુભ સમય માટે આ તારીખ ઉમેરવાનું વિચારો:",
  },
  addSuggestedDate: { en: "Add This Date", gu: "આ તારીખ ઉમેરો" },

  // Result details
  noTimings: {
    en: "No auspicious slots found on these dates. Try different dates or a wider time window.",
    gu: "આ તારીખોમાં શુભ સમય મળ્યો નથી. બીજી તારીખો કે વિશાળ સમય અજમાવો.",
  },
  whyAuspicious: { en: "Why this is auspicious", gu: "આ શુભ કેમ છે" },
  score: { en: "Score", gu: "સ્કોર" },
  loading: { en: "Calculating...", gu: "ગણતરી થઈ રહી છે..." },
  recommended: { en: "Recommended", gu: "અનુમત" },
  auto: { en: "Auto", gu: "ઓટો" },
  autoSelected: { en: "Auto-selected", gu: "સ્વયં પસંદ" },

  // Panchang
  panchangToday: { en: "Today's Panchang", gu: "આજનું પંચાંગ" },
  tithi: { en: "Tithi", gu: "તિથિ" },
  nakshatra: { en: "Nakshatra", gu: "નક્ષત્ર" },
  yoga: { en: "Yoga", gu: "યોગ" },
  karana: { en: "Karana", gu: "કરણ" },
  vara: { en: "Vara", gu: "વાર" },
  sunrise: { en: "Sunrise", gu: "સૂર્યોદય" },
  sunset: { en: "Sunset", gu: "સૂર્યાસ્ત" },
  rahuKaal: { en: "Rahu Kaal", gu: "રાહુ કાળ" },
  yamaganda: { en: "Yamaganda", gu: "યમગંધ" },
  gulikaKaal: { en: "Gulika Kaal", gu: "ગુલિકા કાળ" },
  choghadiya: { en: "Choghadiya", gu: "ચોઘડિયા" },
  hora: { en: "Hora", gu: "હોરા" },

  // Settings
  settings: { en: "Settings", gu: "સેટિંગ્સ" },
  languageSetting: { en: "Language", gu: "ભાષા" },
  themeSetting: { en: "Theme", gu: "થીમ" },
  lightMode: { en: "Light", gu: "લાઇટ" },
  darkMode: { en: "Dark", gu: "ડાર્ક" },
  systemDefault: { en: "System", gu: "સિસ્ટમ" },
  english: { en: "English", gu: "અંગ્રેજી" },
  gujarati: { en: "Gujarati", gu: "ગુજરાતી" },

  // Footer
  footerLove: {
    en: "Made for your beautiful occasions with Love ♥",
    gu: "તમારા સુંદર પ્રસંગો માટે પ્રેમથી બનાવ્યું ♥",
  },

  // Other event
  others: { en: "Others", gu: "અન્ય" },
  othersDesc: {
    en: "Not sure? We'll find general auspicious timing",
    gu: "ખાતરી નથી? સામાન્ય શુભ સમય શોધીએ",
  },

  // GPS & Timezone Sync
  useMyLocation: { en: "Use My Location", gu: "મારું સ્થળ વાપરો" },
  locating: { en: "Detecting location...", gu: "સ્થળ શોધી રહ્યું છે..." },
  locationDenied: {
    en: "Location permission denied. Using default location.",
    gu: "સ્થળ પરવાનગી અસ્વીકારાઈ. ડિફોલ્ટ સ્થળ વપરાય છે.",
  },
  tzMismatch: {
    en: "Device timezone differs from selected location",
    gu: "ડિવાઇસ સમયમંડળ શહેરના સમયમંડળથી અલગ છે",
  },
  locationSetting: { en: "Location", gu: "સ્થળ" },
  syncLocation: { en: "Sync Location", gu: "સ્થળ સિન્ક કરો" },
  changeLocation: { en: "Change Location", gu: "સ્થળ બદલો" },
  selectCity: { en: "Select City", gu: "શહેર પસંદ કરો" },
  defaultLocationNoticeTitle: { en: "Location Set to Ahmedabad", gu: "સ્થળ અમદાવાદ સેટ થયું" },
  defaultLocationNoticeBody: {
    en: "At present, your location is set to Ahmedabad, India. You can change your location anytime from the Settings page.",
    gu: "હાલમાં, તમારું સ્થળ અમદાવાદ, ભારત સેટ કરેલું છે. તમે સેટિંગ્સ પૃષ્ઠ પરથી કોઈપણ સમયે તમારું સ્થળ બદલી શકો છો.",
  },
  gotIt: { en: "Got It", gu: "સમજાઈ ગયું" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}

import { formatInTimezone } from "./time-utils";

/**
 * Format a UTC ISO string into the user's timezone (defined by tz or tzOffsetHours).
 * This is tz-independent — handles daylight savings and arbitrary IANA timezones.
 * Returns time like "7:29 PM" or "7:29" (short).
 */
export function formatTzTime(
  iso: string,
  tzOffsetHours: number,
  _short = false,
  tz?: string
): string {
  if (tz) {
    return formatInTimezone(iso, tz, { hour: "numeric", minute: "2-digit", hour12: true });
  }
  const d = new Date(iso);
  const local = new Date(d.getTime() + tzOffsetHours * 3600000);
  let h = local.getUTCHours();
  const m = local.getUTCMinutes();
  const period = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Gets English ordinal suffix for day numbers (1st, 2nd, 3rd, 25th, etc.)
 */
export function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

/**
 * Formats live header date & time like "25th July, 10:59 PM" (EN) or "25 જુલાઈ, 10:59 PM" (GU).
 */
export function formatHeaderDateTime(
  date: Date,
  lang: "en" | "gu",
  tzOffsetHours = 5.5,
  tz?: string
): string {
  const iso = date.toISOString();
  const timeStr = formatTzTime(iso, tzOffsetHours, false, tz);

  const months_en = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const months_gu = ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન", "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"];

  let day: number;
  let mIdx: number;

  if (tz) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        month: "numeric",
        day: "numeric",
      }).formatToParts(date);
      day = parseInt(parts.find((p) => p.type === "day")?.value || "1", 10);
      mIdx = parseInt(parts.find((p) => p.type === "month")?.value || "1", 10) - 1;
    } catch {
      day = date.getDate();
      mIdx = date.getMonth();
    }
  } else {
    const local = new Date(date.getTime() + tzOffsetHours * 3600000);
    day = local.getUTCDate();
    mIdx = local.getUTCMonth();
  }

  if (lang === "gu") {
    return `${day} ${months_gu[mIdx]}, ${timeStr}`;
  }
  return `${day}${getOrdinalSuffix(day)} ${months_en[mIdx]}, ${timeStr}`;
}

/**
 * Format a UTC ISO string into a date string in the user's timezone.
 * Returns like "Monday, 6 July 2026" or "6 Jul 2026".
 */
export function formatTzDate(
  iso: string,
  tzOffsetHours: number,
  long = true,
  tz?: string
): string {
  const d = new Date(iso);
  const local = tz ? d : new Date(d.getTime() + tzOffsetHours * 3600000);
  const days_en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const days_gu = ["રવિવાર", "સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર"];
  const months_en = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const months_gu = ["જાન", "ફેબ", "માર્ચ", "એપ્ર", "મે", "જૂન", "જુલા", "ઑગ", "સપ્ટ", "ઑક્ટ", "નવ", "ડિસ"];
  
  let y: number, m: number, day: number, dow: number;
  if (tz) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        weekday: "short",
      }).formatToParts(d);
      y = parseInt(parts.find((p) => p.type === "year")?.value || "2026", 10);
      m = parseInt(parts.find((p) => p.type === "month")?.value || "1", 10) - 1;
      day = parseInt(parts.find((p) => p.type === "day")?.value || "1", 10);
      const wStr = parts.find((p) => p.type === "weekday")?.value || "Sun";
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      dow = dayNames.findIndex((dn) => wStr.startsWith(dn));
      if (dow === -1) dow = 0;
    } catch {
      y = local.getUTCFullYear();
      m = local.getUTCMonth();
      day = local.getUTCDate();
      dow = local.getUTCDay();
    }
  } else {
    y = local.getUTCFullYear();
    m = local.getUTCMonth();
    day = local.getUTCDate();
    dow = local.getUTCDay();
  }

  if (long) {
    return `${days_en[dow]}, ${day} ${months_en[m]} ${y}`;
  }
  return `${day} ${months_en[m]} ${y}`;
}
