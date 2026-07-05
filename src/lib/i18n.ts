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
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}

/**
 * Format a UTC ISO string into the user's timezone (defined by tzOffsetHours).
 * This is tz-independent — does NOT rely on the client's local timezone.
 * Returns time like "7:29 PM" or "7:29" (short).
 */
export function formatTzTime(iso: string, tzOffsetHours: number, short = false): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() + tzOffsetHours * 3600000);
  let h = local.getUTCHours();
  const m = local.getUTCMinutes();
  if (short) {
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")}`;
  }
  const period = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Format a UTC ISO string into a date string in the user's timezone.
 * Returns like "Monday, 6 July 2026" or "6 Jul 2026".
 */
export function formatTzDate(iso: string, tzOffsetHours: number, long = true): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() + tzOffsetHours * 3600000);
  const days_en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const days_gu = ["રવિવાર", "સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર"];
  const months_en = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const months_gu = ["જાન", "ફેબ", "માર્ચ", "એપ્ર", "મે", "જૂન", "જુલા", "ઑગ", "સપ્ટ", "ઑક્ટ", "નવ", "ડિસ"];
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const day = local.getUTCDate();
  const dow = local.getUTCDay();
  if (long) {
    return `${days_en[dow]}, ${day} ${months_en[m]} ${y}`;
  }
  return `${day} ${months_en[m]} ${y}`;
}
