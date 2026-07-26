"use client";

import { useLang } from "@/hooks/use-lang";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { ChoghadiyaQuality } from "@/lib/time-divisions";
import type { Tier, CityDef } from "@/lib/events";
import { classifyYoga } from "@/lib/events";
import { formatTzTime } from "@/lib/i18n";
import { SunTrackerCard } from "@/components/wizard/sun-tracker-card";

interface PanchangData {
  now: string;
  tithi: { name_en: string; name_gu: string; paksha: string; paksha_gu: string; start?: string; end?: string };
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
  } | null;
  currentChoghadiya: {
    name_en: string;
    name_gu: string;
    quality: ChoghadiyaQuality;
    start: string;
    end: string;
  } | null;
  currentRahuKaal: {
    name_en: string;
    name_gu: string;
    start: string;
    end: string;
    isActive: boolean;
  } | null;
}

interface Props {
  city: CityDef | null;
  tzOffsetHours: number;
  onCityChange?: (city: CityDef) => void;
}

export function PanchangToday({ city, tzOffsetHours }: Props) {
  const { lang } = useLang();
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const loc = city || {
      lat: 23.0225,
      lng: 72.5714,
      name_en: "Ahmedabad",
      name_gu: "અમદાવાદ",
      tz: "Asia/Kolkata",
    };
    try {
      const res = await fetch("/api/panchang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          lat: loc.lat,
          lng: loc.lng,
          tzOffsetHours,
          tz: loc.tz,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setData(d);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [city, tzOffsetHours]);

  // Initial fetch + auto-refresh every 60 seconds
  useEffect(() => {
    let active = true;
    const runFetch = async () => {
      if (active) await fetchData();
    };
    void runFetch();
    const interval = setInterval(fetchData, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  if (loading || !data) {
    return (
      <Card className="p-3 sm:p-4 animate-pulse bg-card/60">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  const targetTz = city?.tz;

  return (
    <Card className="p-3 sm:p-3.5 bg-card/90 backdrop-blur border-primary/25 shadow-sm space-y-2.5">
      {/* Rahu Kaal Banner if Active */}
      {data.currentRahuKaal && data.currentRahuKaal.isActive && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            {lang === "gu" ? "રાહુ કાળ ચાલુ છે" : "Rahu Kaal Active"}
          </span>
          <span>
            {formatTzTime(data.currentRahuKaal.start, tzOffsetHours, false, targetTz)} – {formatTzTime(data.currentRahuKaal.end, tzOffsetHours, false, targetTz)}
          </span>
        </div>
      )}

      {/* 6 compact cards: Tithi, Vara, Nakshatra, Yoga/Karana, Hora, Choghadiya */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Cell
          label={lang === "gu" ? "તિથિ" : "Tithi"}
          value={lang === "gu" ? data.tithi.name_gu : data.tithi.name_en}
          sub={
            data.tithi.start && data.tithi.end
              ? `${lang === "gu" ? data.tithi.paksha_gu : data.tithi.paksha} • ${formatTzTime(data.tithi.start, tzOffsetHours, false, targetTz)}–${formatTzTime(data.tithi.end, tzOffsetHours, false, targetTz)}`
              : lang === "gu" ? data.tithi.paksha_gu : data.tithi.paksha
          }
        />
        <Cell
          label={lang === "gu" ? "વાર" : "Vara"}
          value={lang === "gu" ? data.vara.name_gu : data.vara.name_en}
        />
        <Cell
          label={lang === "gu" ? "નક્ષત્ર" : "Nakshatra"}
          value={lang === "gu" ? data.nakshatra.name_gu : data.nakshatra.name_en}
        />
        <Cell
          label={lang === "gu" ? "યોગ / કરણ" : "Yoga / Karana"}
          value={lang === "gu" ? data.yoga.name_gu : data.yoga.name_en}
          sub={lang === "gu" ? data.karana.name_gu : data.karana.name_en}
          tone={tierToTone(data.yoga ? classifyYoga(data.yoga.index) : "good")}
        />
        <Cell
          label={lang === "gu" ? "હોરા" : "Hora"}
          value={
            data.currentHora
              ? lang === "gu"
                ? data.currentHora.name_gu
                : data.currentHora.name_en
              : "—"
          }
          sub={
            data.currentHora
              ? `${formatTzTime(data.currentHora.start, tzOffsetHours, false, targetTz)}–${formatTzTime(data.currentHora.end, tzOffsetHours, false, targetTz)}`
              : undefined
          }
          tone={data.currentHora?.isGood ? "good" : "bad"}
        />
        <Cell
          label={lang === "gu" ? "ચોઘડિયા" : "Choghadiya"}
          value={
            data.currentChoghadiya
              ? lang === "gu"
                ? data.currentChoghadiya.name_gu
                : data.currentChoghadiya.name_en
              : "—"
          }
          sub={
            data.currentChoghadiya
              ? `${formatTzTime(data.currentChoghadiya.start, tzOffsetHours, false, targetTz)}–${formatTzTime(data.currentChoghadiya.end, tzOffsetHours, false, targetTz)}`
              : undefined
          }
          tone={
            data.currentChoghadiya?.quality === "good"
              ? "good"
              : data.currentChoghadiya?.quality === "bad"
              ? "bad"
              : "mixed"
          }
        />
      </div>

      {/* Sunrise & Sunset at bottom */}
      {data.sunrise && data.sunset && (
        <SunTrackerCard
          sunrise={data.sunrise}
          sunset={data.sunset}
          now={data.now}
          tzOffsetHours={tzOffsetHours}
          targetTz={targetTz}
        />
      )}
    </Card>
  );
}

function Cell({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad" | "mixed";
}) {
  // Green = good, Yellow = mixed/average, Red = bad
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
      : tone === "bad"
      ? "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
      : tone === "mixed"
      ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
      : "bg-secondary/40 border-border/60 text-foreground";

  return (
    <div
      className={cn(
        "p-2 sm:p-2.5 rounded-lg border flex flex-col justify-between transition-all shadow-2xs min-h-[60px]",
        toneClass
      )}
    >
      <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
        {label}
      </p>
      <div>
        <p className="text-xs sm:text-sm font-bold truncate leading-tight">
          {value}
        </p>
        {sub && (
          <p className="text-[10px] font-medium opacity-90 truncate leading-tight pt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

/** Convert a Tier to the Cell tone (good/bad/mixed) */
function tierToTone(tier: Tier): "good" | "bad" | "mixed" {
  if (tier === "highly" || tier === "auspicious") return "good";
  if (tier === "good") return "mixed";
  return "bad";
}
