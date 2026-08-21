"use client";

import { useLang } from "@/hooks/use-lang";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { ChoghadiyaQuality } from "@/lib/time-divisions";
import type { Tier, CityDef } from "@/lib/events";
import { classifyYoga } from "@/lib/events";
import { formatTzTime } from "@/lib/i18n";
import {
  Loader2,
  AlertTriangle,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Compass,
  Star,
  Activity,
} from "lucide-react";
import { SunTrackerCard } from "@/components/wizard/sun-tracker-card";
import { computePanchangClient } from "@/lib/client-api";

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

const LORD_GU_MAP: Record<string, string> = {
  Sun: "સૂર્ય",
  Moon: "ચંદ્ર",
  Mars: "મંગળ",
  Mercury: "બુધ",
  Jupiter: "ગુરુ",
  Venus: "શુક્ર",
  Saturn: "શનિ",
  Rahu: "રાહુ",
  Ketu: "કેતુ",
};

const VARA_LORD_EN: Record<string, string> = {
  Sunday: "Sun",
  Monday: "Moon",
  Tuesday: "Mars",
  Wednesday: "Mercury",
  Thursday: "Jupiter",
  Friday: "Venus",
  Saturday: "Saturn",
};

export function PanchangToday({ city, tzOffsetHours }: Props) {
  const { lang } = useLang();
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);

  // Try reading from cache immediately on mount / city change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const locName = city?.name_en || "Ahmedabad";
      const todayStr = new Date().toISOString().slice(0, 10);
      const cacheKey = `shubh_samay_panchang_${locName}_${todayStr}`;
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.ok) {
          setData(parsed);
          setLoading(false);
        }
      }
    } catch {
      // Ignore cache read errors
    }
  }, [city]);

  const fetchData = useCallback(async () => {
    const loc = city || {
      lat: 23.0225,
      lng: 72.5714,
      name_en: "Ahmedabad",
      name_gu: "અમદાવાદ",
      tz: "Asia/Kolkata",
    };
    try {
      let d: PanchangData | null = null;
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
        if (res.ok) {
          d = await res.json();
        }
      } catch {
        // Fallback to client-side computation when static/offline
      }

      if (!d || !d.now) {
        d = computePanchangClient({
          date: new Date().toISOString(),
          lat: loc.lat,
          lng: loc.lng,
          tzOffsetHours,
          tz: loc.tz,
        });
      }

      if (d && d.tithi) {
        setData(d);
        try {
          const todayStr = new Date().toISOString().slice(0, 10);
          const cacheKey = `shubh_samay_panchang_${loc.name_en}_${todayStr}`;
          localStorage.setItem(cacheKey, JSON.stringify(d));
        } catch {
          // Ignore cache write errors
        }
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

  if (loading && !data) {
    return (
      <Card className="p-5 bg-card/90 backdrop-blur-md border-border/80 dark:border-white/10 shadow-sm flex items-center justify-center min-h-[140px] rounded-2xl">
        <div className="flex items-center gap-3 text-foreground font-semibold text-sm sm:text-base">
          <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
          <span>{lang === "gu" ? "આજનું પંચાંગ લોડ થઈ રહ્યું છે..." : "Calculating Today's Panchang..."}</span>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const targetTz = city?.tz;

  // Real-time moment status: check if currently auspicious or Rahu Kaal
  const isRahuActive = data.currentRahuKaal?.isActive;
  const isChoghadiyaGood = data.currentChoghadiya?.quality === "good";
  const isHoraGood = data.currentHora?.isGood;

  return (
    <Card className="p-3.5 sm:p-4 bg-card/90 backdrop-blur-md border-border/80 dark:border-white/10 shadow-sm rounded-2xl space-y-3 relative overflow-hidden transition-all">
      {/* Subtle radiant background aura */}
      <div
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Rahu Kaal Banner if Active */}
      {isRahuActive && data.currentRahuKaal ? (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-semibold shadow-xs animate-pulse">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <span>{lang === "gu" ? "રાહુ કાળ ચાલુ છે — શુભ કાર્ય ટાળો" : "Rahu Kaal Active — Inauspicious Window"}</span>
          </span>
          <span className="font-mono text-[11px] sm:text-xs">
            {formatTzTime(data.currentRahuKaal.start, tzOffsetHours, false, targetTz)} – {formatTzTime(data.currentRahuKaal.end, tzOffsetHours, false, targetTz)}
          </span>
        </div>
      ) : (
        /* Real-time Auspicious Moment Status Bar */
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-secondary/40 dark:bg-secondary/25 border border-border/50 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex items-center justify-center">
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  isChoghadiyaGood && isHoraGood
                    ? "bg-emerald-500 cosmic-pulse"
                    : isChoghadiyaGood || isHoraGood
                    ? "bg-amber-500"
                    : "bg-muted-foreground/60"
                )}
              />
            </div>
            <span className="font-medium text-foreground text-[11px] sm:text-xs truncate">
              {isChoghadiyaGood && isHoraGood
                ? lang === "gu" ? "અત્યારે અતિ શુભ સમય છે" : "Currently Auspicious Moment"
                : isChoghadiyaGood
                ? lang === "gu" ? "શુભ ચોઘડિયું ચાલુ છે" : "Auspicious Choghadiya Active"
                : lang === "gu" ? "સામાન્ય સમય" : "Standard Period"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-primary shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {data.currentChoghadiya
                ? lang === "gu"
                  ? data.currentChoghadiya.name_gu
                  : data.currentChoghadiya.name_en
                : ""}
            </span>
          </div>
        </div>
      )}

      {/* 6 compact Vedic cards: Tithi, Vara, Nakshatra, Yoga/Karana, Hora, Choghadiya */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Cell
          icon={<Moon className="w-3.5 h-3.5 text-primary/80" />}
          label={lang === "gu" ? "તિથિ" : "Tithi"}
          value={lang === "gu" ? data.tithi.name_gu : data.tithi.name_en}
          sub={
            data.tithi.start && data.tithi.end
              ? `${lang === "gu" ? data.tithi.paksha_gu : data.tithi.paksha} • ${formatTzTime(data.tithi.start, tzOffsetHours, false, targetTz)}`
              : lang === "gu" ? data.tithi.paksha_gu : data.tithi.paksha
          }
        />
        <Cell
          icon={<Sun className="w-3.5 h-3.5 text-amber-500" />}
          label={lang === "gu" ? "વાર" : "Vara"}
          value={lang === "gu" ? data.vara.name_gu : data.vara.name_en}
          sub={
            lang === "gu"
              ? `સ્વામી: ${LORD_GU_MAP[VARA_LORD_EN[data.vara.name_en] || "Sun"] || "સૂર્ય"}`
              : `Lord: ${VARA_LORD_EN[data.vara.name_en] || "Sun"}`
          }
        />
        <Cell
          icon={<Star className="w-3.5 h-3.5 text-indigo-400" />}
          label={lang === "gu" ? "નક્ષત્ર" : "Nakshatra"}
          value={lang === "gu" ? data.nakshatra.name_gu : data.nakshatra.name_en}
          sub={
            data.nakshatra.lord
              ? `${lang === "gu" ? "સ્વામી: " : "Lord: "}${lang === "gu" ? (LORD_GU_MAP[data.nakshatra.lord] || data.nakshatra.lord) : data.nakshatra.lord}`
              : undefined
          }
        />
        <Cell
          icon={<Compass className="w-3.5 h-3.5 text-teal-500" />}
          label={lang === "gu" ? "યોગ / કરણ" : "Yoga / Karana"}
          value={lang === "gu" ? data.yoga.name_gu : data.yoga.name_en}
          sub={lang === "gu" ? data.karana.name_gu : data.karana.name_en}
          tone={tierToTone(data.yoga ? classifyYoga(data.yoga.index) : "good")}
        />
        <Cell
          icon={<Clock className="w-3.5 h-3.5 text-primary" />}
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
          icon={<Activity className="w-3.5 h-3.5 text-primary" />}
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

      {/* Sunrise & Sunset Orbit Arc */}
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
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad" | "mixed";
}) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
      : tone === "bad"
      ? "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
      : tone === "mixed"
      ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
      : "bg-secondary/35 border-border/60 text-foreground dark:bg-secondary/20 dark:border-white/10";

  return (
    <div
      className={cn(
        "p-2.5 rounded-xl border flex flex-col justify-between items-center text-center transition-all shadow-2xs min-h-[72px] h-full hover:shadow-xs",
        toneClass
      )}
    >
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center my-auto py-0.5 w-full">
        <p className="text-xs sm:text-sm font-bold leading-tight break-words">
          {value}
        </p>
        {sub && (
          <p className="text-[10px] font-medium opacity-85 leading-tight pt-0.5 break-words line-clamp-1">
            {sub}
          </p>
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
