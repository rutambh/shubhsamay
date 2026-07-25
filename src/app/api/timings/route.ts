import { NextRequest, NextResponse } from "next/server";
import {
  findBestTimings,
  findBetterSuggestion,
  findBestRecommendedTiming,
  resolveAutoMethods,
  EVENTS,
  type EventId,
  type MethodId,
  type TimeWindow,
  type Tier,
  type SlotClassification,
} from "@/lib/events";

export interface TimingsRequest {
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

export interface TimingsResponse {
  ok: boolean;
  highly?: SlotResponse[];
  auspicious?: SlotResponse[];
  good?: SlotResponse[];
  resolvedMethods?: MethodId[];
  bestRecommendation?: SlotResponse | null;
  suggestion?: {
    date: string;
    start: string;
    end: string;
    tier: Tier;
    label_en: string;
    label_gu: string;
    vara_en: string;
    vara_gu: string;
    favorableVaras_en: string[];
    favorableVaras_gu: string[];
  } | null;
  eventDef?: (typeof EVENTS)[number];
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<TimingsResponse>> {
  try {
    const body = (await req.json()) as TimingsRequest;

    if (!body.event || !body.dates || !body.city) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dates = body.dates.map((d) => new Date(d));
    const eventDef = EVENTS.find((e) => e.id === body.event);
    if (!eventDef) {
      return NextResponse.json(
        { ok: false, error: "Unknown event" },
        { status: 400 }
      );
    }

    // Resolve methods: expand "auto" and "all" into concrete methods
    let resolvedMethods: MethodId[] = [];
    for (const m of body.methods) {
      if (m === "auto") {
        resolvedMethods.push(...resolveAutoMethods(body.event));
      } else if (m === "all") {
        resolvedMethods.push("choghadiya", "hora", "tithi", "nakshatra", "yoga", "muhurat");
      } else {
        resolvedMethods.push(m);
      }
    }
    resolvedMethods = Array.from(new Set(resolvedMethods));
    if (resolvedMethods.length === 0) {
      resolvedMethods = resolveAutoMethods(body.event);
    }

    const loc = {
      lat: body.city.lat,
      lng: body.city.lng,
      tzOffsetHours: body.tzOffsetHours,
      tz: body.city?.tz || body.tz,
    };

    // Get tiered results
    const tiered = findBestTimings(dates, body.event, resolvedMethods, loc, {
      timeWindow: body.timeWindow,
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

    // Compute Best Recommended Timing (evaluates ALL methods, restricts to highly & auspicious only)
    const bestRec = findBestRecommendedTiming(dates, body.event, loc, {
      timeWindow: body.timeWindow,
    });

    return NextResponse.json({
      ok: true,
      highly: tiered.highly.map(mapSlot),
      auspicious: tiered.auspicious.map(mapSlot),
      good: tiered.good.map(mapSlot),
      resolvedMethods,
      bestRecommendation: bestRec ? mapSlot(bestRec) : null,
      eventDef,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
