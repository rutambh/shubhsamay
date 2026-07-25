/**
 * Shubh Samay — Time Utilities & Timezone Engine
 * Handles wall-clock to UTC conversions, dynamic IANA timezone offsets,
 * and Haversine distance calculations without device-local timezone mutation bugs.
 */

/**
 * Calculates dynamic timezone offset in milliseconds (UTC - target)
 * for a specific UTC Date instant in an IANA timezone (e.g. "Asia/Kolkata", "America/New_York").
 */
export function getTimezoneOffsetMs(date: Date, tz: string): number {
  try {
    const tzParts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const tzHStr = tzParts.find((p) => p.type === "hour")?.value || "0";
    const tzMStr = tzParts.find((p) => p.type === "minute")?.value || "0";

    const tzH = parseInt(tzHStr === "24" ? "0" : tzHStr, 10);
    const tzM = parseInt(tzMStr, 10);

    const utcH = date.getUTCHours();
    const utcM = date.getUTCMinutes();

    let offsetMin = (utcH * 60 + utcM) - (tzH * 60 + tzM);
    if (offsetMin > 780) offsetMin -= 1440;
    if (offsetMin < -780) offsetMin += 1440;

    return offsetMin * 60 * 1000;
  } catch {
    // Fallback if IANA timezone is invalid or unsupported: return 0
    return 0;
  }
}

/**
 * Converts wall-clock local time in a target IANA timezone to a true UTC Date instant.
 * Example: wallClockToUtc(new Date(), 6, 15, "Asia/Kolkata") -> UTC Date corresponding to 06:15 IST on that day.
 */
export function wallClockToUtc(date: Date, hours: number, minutes: number, tz: string): Date {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const year = parseInt(parts.find((p) => p.type === "year")?.value || "2026", 10);
    const month = parseInt(parts.find((p) => p.type === "month")?.value || "1", 10);
    const day = parseInt(parts.find((p) => p.type === "day")?.value || "1", 10);

    const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const offsetMs = getTimezoneOffsetMs(utcMidnight, tz);
    const wallMs = hours * 3600000 + minutes * 60000;

    return new Date(utcMidnight.getTime() + wallMs + offsetMs);
  } catch {
    // Fallback using device local date
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }
}

/**
 * Calculates Great Circle distance between two geographic coordinates in kilometers (Haversine formula).
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Safe client/server system timezone detector.
 */
export function getSystemTimezone(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    } catch {
      return "Asia/Kolkata";
    }
  }
  return "Asia/Kolkata";
}

/**
 * Extracts a clean city name from an IANA timezone string (e.g. "Australia/Sydney" -> "Sydney", "America/New_York" -> "New York").
 */
export function getCityNameFromTimezone(tz: string): string {
  if (!tz) return "Current Location";
  const parts = tz.split("/");
  const rawCity = parts[parts.length - 1];
  return rawCity ? rawCity.replace(/_/g, " ") : "Current Location";
}

/**
 * Formats a Date object in a target IANA timezone with 12-hour AM/PM format safely.
 */
export function formatInTimezone(
  date: Date | string | number,
  tz: string = "Asia/Kolkata",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...options,
  };
  try {
    return new Intl.DateTimeFormat("en-US", defaultOptions).format(d);
  } catch {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  }
}
