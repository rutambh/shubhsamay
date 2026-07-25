import { NextRequest, NextResponse } from "next/server";
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
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Use current moment for live panchang (so Hora/Choghadiya reflect NOW)
    const now = new Date();
    const loc: LatLng = {
      lat: body.lat,
      lng: body.lng,
      tzOffsetHours: body.tzOffsetHours ?? 5.5,
      tz: body.tz,
    };

    // Compute panchang elements at the current moment
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

    // If before sunrise, the current choghadiya/hora belongs to the PREVIOUS
    // day's night period. Check yesterday's data too.
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const prevChoghadiya = getChoghadiya(yesterday, loc);
    const prevHoras = getHoras(yesterday, loc);
    const allChoghadiya = [...prevChoghadiya, ...choghadiya];
    const allHoras = [...prevHoras, ...horas];

    // Find the CURRENT hora and choghadiya (the ones active right now)
    const currentHora = allHoras.find((h) => now >= h.start && now < h.end) || null;
    const currentChoghadiya =
      allChoghadiya.find((c) => now >= c.start && now < c.end) || null;
    const currentRahu = inauspicious.find(
      (p) => p.name_en === "Rahu Kaal" && now >= p.start && now < p.end
    );

    return NextResponse.json({
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
      sunrise: sunrise?.toISOString(),
      sunset: sunset?.toISOString(),
      // Current active periods (with time ranges for display)
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
      // For reference (full lists available if needed)
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
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// Helper format function (unused but available for server-side formatting)
export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}
