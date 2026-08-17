import {
  getTithi,
  getTithiRange,
  getNakshatra,
  getYoga,
  getKarana,
  getVara,
  getSunrise,
  getSunset,
  type LatLng,
} from "@/lib/panchang";
import {
  getInauspiciousPeriods,
  getChoghadiya,
  getHoras,
  type ChoghadiyaQuality,
} from "@/lib/time-divisions";
import {
  findBestTimings,
  findBestRecommendedTiming,
  resolveAutoMethods,
  EVENTS,
  type EventId,
  type MethodId,
  type TimeWindow,
  type Tier,
  type SlotClassification,
} from "@/lib/events";
import type { Lang } from "@/lib/i18n";

export interface PanchangParams {
  date?: string;
  lat: number;
  lng: number;
  tzOffsetHours?: number;
  tz?: string;
}

export interface PanchangResponse {
  ok: boolean;
  now: string;
  tithi: {
    name_en: string;
    name_gu: string;
    paksha: string;
    paksha_gu: string;
    start?: string;
    end?: string;
  };
  nakshatra: { name_en: string; name_gu: string; lord: string };
  yoga: { index: number; name_en: string; name_gu: string };
  karana: { name_en: string; name_gu: string };
  vara: { name_en: string; name_gu: string };
  sunrise: string | null;
  sunset: string | null;
  currentHora: {
    name_en: string;
    name_gu: string;
    isGood: boolean;
    start: string;
    end: string;
    period: "day" | "night";
  } | null;
  currentChoghadiya: {
    name_en: string;
    name_gu: string;
    quality: ChoghadiyaQuality;
    start: string;
    end: string;
    period: "day" | "night";
  } | null;
  currentRahuKaal: {
    name_en: string;
    name_gu: string;
    start: string;
    end: string;
    isActive: boolean;
  } | null;
  inauspicious: Array<{ name_en: string; name_gu: string; start: string; end: string }>;
  choghadiya: Array<{
    start: string;
    end: string;
    name_en: string;
    name_gu: string;
    quality: ChoghadiyaQuality;
    period: "day" | "night";
  }>;
  horas: Array<{
    start: string;
    end: string;
    name_en: string;
    name_gu: string;
    isGood: boolean;
    period: "day" | "night";
  }>;
  error?: string;
}

export function computePanchangClient(params: PanchangParams): PanchangResponse {
  try {
    const now = params.date ? new Date(params.date) : new Date();
    const loc: LatLng = {
      lat: params.lat,
      lng: params.lng,
      tzOffsetHours: params.tzOffsetHours ?? 5.5,
      tz: params.tz,
    };

    const tithi = getTithi(now);
    const tithiRange = getTithiRange(now);
    const nakshatra = getNakshatra(now);
    const yoga = getYoga(now);
    const karana = getKarana(now);
    const vara = getVara(now);
    const sunrise = getSunrise(now, loc);
    const sunset = getSunset(now, loc);
    const inauspicious = getInauspiciousPeriods(now, loc);
    const choghadiya = getChoghadiya(now, loc);
    const horas = getHoras(now, loc);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const prevChoghadiya = getChoghadiya(yesterday, loc);
    const prevHoras = getHoras(yesterday, loc);
    const allChoghadiya = [...prevChoghadiya, ...choghadiya];
    const allHoras = [...prevHoras, ...horas];

    const currentHora = allHoras.find((h) => now >= h.start && now < h.end) || null;
    const currentChoghadiya =
      allChoghadiya.find((c) => now >= c.start && now < c.end) || null;
    const currentRahu = inauspicious.find(
      (p) => p.name_en === "Rahu Kaal" && now >= p.start && now < p.end
    );

    return {
      ok: true,
      now: now.toISOString(),
      tithi: {
        ...tithi,
        start: tithiRange.start.toISOString(),
        end: tithiRange.end.toISOString(),
      },
      nakshatra,
      yoga,
      karana,
      vara,
      sunrise: sunrise?.toISOString() ?? null,
      sunset: sunset?.toISOString() ?? null,
      currentHora: currentHora
        ? {
            name_en: currentHora.name_en,
            name_gu: currentHora.name_gu,
            isGood: currentHora.isGood,
            start: currentHora.start.toISOString(),
            end: currentHora.end.toISOString(),
            period: currentHora.period,
          }
        : null,
      currentChoghadiya: currentChoghadiya
        ? {
            name_en: currentChoghadiya.name_en,
            name_gu: currentChoghadiya.name_gu,
            quality: currentChoghadiya.quality as ChoghadiyaQuality,
            start: currentChoghadiya.start.toISOString(),
            end: currentChoghadiya.end.toISOString(),
            period: currentChoghadiya.period,
          }
        : null,
      currentRahuKaal: currentRahu
        ? {
            name_en: currentRahu.name_en,
            name_gu: currentRahu.name_gu,
            start: currentRahu.start.toISOString(),
            end: currentRahu.end.toISOString(),
            isActive: true,
          }
        : null,
      inauspicious: inauspicious.map((p) => ({
        name_en: p.name_en,
        name_gu: p.name_gu,
        start: p.start.toISOString(),
        end: p.end.toISOString(),
      })),
      choghadiya: choghadiya.map((c) => ({
        start: c.start.toISOString(),
        end: c.end.toISOString(),
        name_en: c.name_en,
        name_gu: c.name_gu,
        quality: c.quality,
        period: c.period,
      })),
      horas: horas.map((h) => ({
        start: h.start.toISOString(),
        end: h.end.toISOString(),
        name_en: h.name_en,
        name_gu: h.name_gu,
        isGood: h.isGood,
        period: h.period,
      })),
    };
  } catch (err) {
    return {
      ok: false,
      now: new Date().toISOString(),
      tithi: { name_en: "", name_gu: "", paksha: "", paksha_gu: "" },
      nakshatra: { name_en: "", name_gu: "", lord: "" },
      yoga: { index: 0, name_en: "", name_gu: "" },
      karana: { name_en: "", name_gu: "" },
      vara: { name_en: "", name_gu: "" },
      sunrise: null,
      sunset: null,
      currentHora: null,
      currentChoghadiya: null,
      currentRahuKaal: null,
      inauspicious: [],
      choghadiya: [],
      horas: [],
      error: (err as Error).message,
    };
  }
}

export interface TimingsParams {
  event: EventId;
  methods: MethodId[];
  dates: string[];
  city: { lat: number; lng: number; name_en: string; name_gu: string; tz?: string };
  tzOffsetHours: number;
  tz?: string;
  lang: Lang;
  timeWindow?: TimeWindow;
}

export interface SlotResponse {
  start: string;
  end: string;
  tier: Tier;
  classification: SlotClassification;
  reasons_en: string[];
  reasons_gu: string[];
  method: MethodId;
}

export interface TimingsClientResponse {
  ok: boolean;
  highly?: SlotResponse[];
  auspicious?: SlotResponse[];
  good?: SlotResponse[];
  resolvedMethods?: MethodId[];
  bestRecommendation?: SlotResponse | null;
  eventDef?: (typeof EVENTS)[number];
  error?: string;
}

export function computeTimingsClient(params: TimingsParams): TimingsClientResponse {
  try {
    if (!params.event || !params.dates || !params.city) {
      return { ok: false, error: "Missing required fields" };
    }

    const dates = params.dates.map((d) => new Date(d));
    const eventDef = EVENTS.find((e) => e.id === params.event);
    if (!eventDef) {
      return { ok: false, error: "Unknown event" };
    }

    let resolvedMethods: MethodId[] = [];
    for (const m of params.methods) {
      if (m === "auto") {
        resolvedMethods.push(...resolveAutoMethods(params.event));
      } else if (m === "all") {
        resolvedMethods.push("choghadiya", "hora", "tithi", "nakshatra", "yoga", "muhurat");
      } else {
        resolvedMethods.push(m);
      }
    }
    resolvedMethods = Array.from(new Set(resolvedMethods));
    if (resolvedMethods.length === 0) {
      resolvedMethods = resolveAutoMethods(params.event);
    }

    const loc = {
      lat: params.city.lat,
      lng: params.city.lng,
      tzOffsetHours: params.tzOffsetHours,
      tz: params.city?.tz || params.tz,
    };

    const tiered = findBestTimings(dates, params.event, resolvedMethods, loc, {
      timeWindow: params.timeWindow,
      topNPerDate: 5,
    });

    const mapSlot = (s: (typeof tiered.highly)[number]): SlotResponse => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      tier: s.tier,
      classification: s.classification,
      reasons_en: s.reasons_en,
      reasons_gu: s.reasons_gu,
      method: s.method,
    });

    const bestRec = findBestRecommendedTiming(dates, params.event, loc, {
      timeWindow: params.timeWindow,
    });

    return {
      ok: true,
      highly: tiered.highly.map(mapSlot),
      auspicious: tiered.auspicious.map(mapSlot),
      good: tiered.good.map(mapSlot),
      resolvedMethods,
      bestRecommendation: bestRec ? mapSlot(bestRec) : null,
      eventDef,
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
