"use client";

import { useLang } from "@/hooks/use-lang";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { Sunrise, Sunset, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChoghadiyaQuality } from "@/lib/time-divisions";
import type { Tier } from "@/lib/events";
import { classifyYoga } from "@/lib/events";
import { formatTzTime, formatTzDate } from "@/lib/i18n";

const TZ_OFFSET = 5.5;

interface PanchangData {
  now: string;
  tithi: { name_en: string; name_gu: string; paksha: string; paksha_gu: string };
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
  city: { lat: number; lng: number; name_en: string; name_gu: string } | null;
  tzOffsetHours: number;
}

export function PanchangToday({ city, tzOffsetHours }: Props) {
  const { lang } = useLang();
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    const loc = city || {
      lat: 23.0225,
      lng: 72.5714,
      name_en: "Ahmedabad",
      name_gu: "અમદાવાદ",
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
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setData(d);
        setLastUpdated(new Date());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [city, tzOffsetHours]);

  // Initial fetch + auto-refresh every 60 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading || !data) {
    return (
      <Card className="p-4 animate-pulse bg-card/60">
        <div className="h-4 w-32 bg-muted rounded mb-3" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  const cityLabel = city
    ? lang === "gu"
      ? city.name_gu
      : city.name_en
    : lang === "gu"
    ? "અમદાવાદ"
    : "Ahmedabad";

  return (
    <Card className="p-4 bg-card/80 backdrop-blur border-primary/20">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            {lang === "gu" ? "આજનું પંચાંગ" : "Today's Panchang"}
            <RefreshCw className="h-2.5 w-2.5" />
            {lastUpdated && (
              <span className="text-[9px] opacity-70">
                · {formatTzTime(lastUpdated.toISOString(), tzOffsetHours)}
              </span>
            )}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formatTzDate(data.now, tzOffsetHours, false)} · {cityLabel}
          </p>
        </div>
        {data.currentRahuKaal && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-medium shrink-0">
            {lang === "gu" ? "રાહુ કાળ ચાલુ" : "Rahu Kaal"}
          </span>
        )}
      </div>

      {/* 6 cards: Tithi, Vara, Nakshatra, Muhurat, Hora, Choghadiya */}
      <div className="grid grid-cols-3 gap-2">
        <Cell
          label={lang === "gu" ? "તિથિ" : "Tithi"}
          value={lang === "gu" ? data.tithi.name_gu : data.tithi.name_en}
          sub={lang === "gu" ? data.tithi.paksha_gu : data.tithi.paksha}
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
          label={lang === "gu" ? "મુહૂર્ત" : "Muhurat"}
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
              ? `${formatTzTime(data.currentHora.start, tzOffsetHours, true)}–${formatTzTime(data.currentHora.end, tzOffsetHours, true)}`
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
              ? `${formatTzTime(data.currentChoghadiya.start, tzOffsetHours, true)}–${formatTzTime(data.currentChoghadiya.end, tzOffsetHours, true)}`
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

      {/* Sunrise / Sunset as text */}
      {data.sunrise && data.sunset && (
        <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-center gap-5 text-xs">
          <div className="flex items-center gap-1.5 text-foreground">
            <Sunrise className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">
              {lang === "gu" ? "સૂર્યોદય" : "Sunrise"}:
            </span>
            <span className="font-semibold">
              {formatTzTime(data.sunrise, tzOffsetHours)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground">
            <Sunset className="h-3.5 w-3.5 text-orange-500" />
            <span className="font-medium">
              {lang === "gu" ? "સૂર્યાસ્ત" : "Sunset"}:
            </span>
            <span className="font-semibold">
              {formatTzTime(data.sunset, tzOffsetHours)}
            </span>
          </div>
        </div>
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
      ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
      : tone === "bad"
      ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
      : tone === "mixed"
      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400"
      : "bg-secondary/40 border-transparent";
  return (
    <div className={cn("rounded-lg border px-2 py-2 text-center", toneClass)}>
      <p className="text-[10px] uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="text-sm font-semibold leading-tight mt-0.5 break-words">
        {value}
      </p>
      {sub && (
        <p className="text-[10px] opacity-70 mt-0.5 break-words">{sub}</p>
      )}
    </div>
  );
}

/** Convert a Tier to the Cell tone (good/bad/mixed) */
function tierToTone(tier: Tier): "good" | "bad" | "mixed" {
  if (tier === "highly" || tier === "auspicious") return "good";
  if (tier === "good") return "mixed";
  return "bad";
}
