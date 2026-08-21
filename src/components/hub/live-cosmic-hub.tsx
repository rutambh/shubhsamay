"use client";

import { useLang } from "@/hooks/use-lang";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ChoghadiyaQuality } from "@/lib/time-divisions";
import type { Tier, CityDef } from "@/lib/events";
import { classifyYoga } from "@/lib/events";
import { formatTzTime } from "@/lib/i18n";
import {
  AlertTriangle,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Compass,
  Star,
  Activity,
  ChevronRight,
  Sunrise,
  Sunset,
} from "lucide-react";
import { computePanchangClient } from "@/lib/client-api";

export interface PanchangData {
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
  onOpenTimeline?: () => void;
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

export function LiveCosmicHub({
  city,
  tzOffsetHours,
  onOpenTimeline,
}: Props) {
  const { lang } = useLang();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Real-time second counter
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loc = useMemo(
    () =>
      city || {
        lat: 23.0225,
        lng: 72.5714,
        name_en: "Ahmedabad",
        name_gu: "અમદાવાદ",
        tz: "Asia/Kolkata",
      },
    [city]
  );

  // Synchronous client-side astronomical computation (0ms, zero lag, never stuck)
  const data: PanchangData = useMemo(() => {
    return computePanchangClient({
      date: currentTime.toISOString(),
      lat: loc.lat,
      lng: loc.lng,
      tzOffsetHours,
      tz: loc.tz,
    }) as any;
  }, [currentTime, loc, tzOffsetHours]);

  const targetTz = loc.tz;

  // Real-time moment metrics
  const momentMetrics = useMemo(() => {
    if (!data) return null;
    const isRahuActive = data.currentRahuKaal?.isActive ?? false;
    const choghadiyaQuality = data.currentChoghadiya?.quality;
    const isChoghadiyaGood = choghadiyaQuality === "good";
    const isHoraGood = data.currentHora?.isGood ?? false;

    // Remaining time countdown
    let remainingMinutes = 0;
    let remainingSeconds = 0;
    let endFormatted = "";
    if (data.currentChoghadiya?.end) {
      const endMs = new Date(data.currentChoghadiya.end).getTime();
      const diffMs = Math.max(0, endMs - currentTime.getTime());
      remainingMinutes = Math.floor(diffMs / 60000);
      remainingSeconds = Math.floor((diffMs % 60000) / 1000);
      endFormatted = formatTzTime(data.currentChoghadiya.end, tzOffsetHours, false, targetTz);
    }

    // Solar arc computation
    let daylightProgress = 0;
    let isDay = true;
    if (data.sunrise && data.sunset) {
      const riseMs = new Date(data.sunrise).getTime();
      const setMs = new Date(data.sunset).getTime();
      const nowMs = currentTime.getTime();
      isDay = nowMs >= riseMs && nowMs <= setMs;
      if (setMs > riseMs) {
        daylightProgress = Math.max(0, Math.min(1, (nowMs - riseMs) / (setMs - riseMs)));
      }
    }

    return {
      isRahuActive,
      isChoghadiyaGood,
      isHoraGood,
      choghadiyaQuality,
      remainingMinutes,
      remainingSeconds,
      endFormatted,
      daylightProgress,
      isDay,
    };
  }, [data, currentTime, tzOffsetHours, targetTz]);

  if (!data || !momentMetrics) return null;

  return (
    <div className="space-y-4 fade-up">
      {/* 1. HERO SURYA-CHANDRA ASTROLABE (Centerpiece Chronometer) */}
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-card/95 via-card/85 to-secondary/30 dark:from-card/90 dark:via-card/75 dark:to-secondary/20 backdrop-blur-2xl border border-primary/25 shadow-2xl space-y-3.5">
        {/* Background Radiant Aura */}
        <div
          className={cn(
            "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-1000",
            momentMetrics.isRahuActive
              ? "bg-destructive/25"
              : momentMetrics.isChoghadiyaGood
              ? "bg-emerald-500/20"
              : "bg-primary/20"
          )}
          aria-hidden="true"
        />

        {/* Top Astrological Status Banner */}
        {momentMetrics.isRahuActive && data.currentRahuKaal ? (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-destructive/15 border border-destructive/40 text-destructive text-xs font-bold shadow-xs animate-pulse">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <span>{lang === "gu" ? "રાહુ કાળ ચાલુ છે — અશુભ સમય" : "Rahu Kaal Active — Inauspicious Period"}</span>
            </span>
            <span className="font-mono text-[11px] sm:text-xs" suppressHydrationWarning>
              {formatTzTime(data.currentRahuKaal.start, tzOffsetHours, false, targetTz)} – {formatTzTime(data.currentRahuKaal.end, tzOffsetHours, false, targetTz)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-background/60 dark:bg-background/40 border border-primary/20 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  "w-3 h-3 rounded-full shrink-0",
                  momentMetrics.isChoghadiyaGood
                    ? "bg-emerald-500 cosmic-pulse"
                    : momentMetrics.choghadiyaQuality === "mixed"
                    ? "bg-amber-500"
                    : "bg-destructive"
                )}
              />
              <span className="font-extrabold text-xs sm:text-sm text-foreground truncate">
                {momentMetrics.isChoghadiyaGood
                  ? lang === "gu" ? "અત્યારે અતિ શુભ સમય છે" : "Currently Auspicious Moment"
                  : momentMetrics.choghadiyaQuality === "mixed"
                  ? lang === "gu" ? "ચર / સામાન્ય સમય" : "Neutral / Travel Period"
                  : lang === "gu" ? "અશુભ કાળ — સાવચેતી રાખો" : "Inauspicious Period — Exercise Caution"}
              </span>
            </div>

            <span className="text-[11px] font-mono font-bold text-primary shrink-0 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20" suppressHydrationWarning>
              {mounted ? `${momentMetrics.remainingMinutes}m ${momentMetrics.remainingSeconds}s` : "..."}
            </span>
          </div>
        )}

        {/* Live Active Choghadiya & Hora Display Card */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {/* Active Choghadiya Jewel */}
          <div className="p-3 rounded-2xl bg-secondary/35 dark:bg-secondary/20 border border-border/60 dark:border-white/10 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {lang === "gu" ? "ચાલુ ચોઘડિયું" : "Active Choghadiya"}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                {data.currentChoghadiya
                  ? lang === "gu"
                    ? data.currentChoghadiya.name_gu
                    : data.currentChoghadiya.name_en
                  : "—"}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">
                {data.currentChoghadiya
                  ? `${formatTzTime(data.currentChoghadiya.start, tzOffsetHours, false, targetTz)} – ${formatTzTime(data.currentChoghadiya.end, tzOffsetHours, false, targetTz)}`
                  : ""}
              </p>
            </div>
          </div>

          {/* Active Hora Jewel */}
          <div className="p-3 rounded-2xl bg-secondary/35 dark:bg-secondary/20 border border-border/60 dark:border-white/10 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {lang === "gu" ? "ચાલુ હોરા" : "Active Hora"}
              </span>
              <Clock className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                {data.currentHora
                  ? lang === "gu"
                    ? data.currentHora.name_gu
                    : data.currentHora.name_en
                  : "—"}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">
                {data.currentHora
                  ? `${formatTzTime(data.currentHora.start, tzOffsetHours, false, targetTz)} – ${formatTzTime(data.currentHora.end, tzOffsetHours, false, targetTz)}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Solar Transit Arc Tracker */}
        {data.sunrise && data.sunset && (
          <div className="p-3 rounded-2xl bg-background/50 dark:bg-background/30 border border-border/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Sunrise className="w-4 h-4 text-amber-500" />
                <span>{formatTzTime(data.sunrise, tzOffsetHours, false, targetTz)}</span>
              </div>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                {momentMetrics.isDay
                  ? lang === "gu" ? "દૈનિક સૂર્ય યાત્રા" : "Solar Daylight Orbit"
                  : lang === "gu" ? "રાત્રિ ચંદ્ર યાત્રા" : "Nocturnal Lunar Orbit"}
              </span>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span>{formatTzTime(data.sunset, tzOffsetHours, false, targetTz)}</span>
                <Sunset className="w-4 h-4 text-orange-500" />
              </div>
            </div>

            {/* Radiant Progress Line */}
            <div className="relative w-full h-1.5 rounded-full bg-muted/80 dark:bg-muted/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-primary to-orange-500 transition-all duration-700"
                style={{ width: `${Math.max(5, Math.min(95, momentMetrics.daylightProgress * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. THE 5-PILLAR VEDIC BENTO MATRIX */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-primary" />
            <span>{lang === "gu" ? "આજનું પંચાંગ (૫ અંગ)" : "Today's Vedic Panchang"}</span>
          </p>
          {onOpenTimeline && (
            <button
              onClick={onOpenTimeline}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === "gu" ? "૨૪ કલાક સમયપત્રક" : "24h Timeline"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <BentoPillar
            icon={<Moon className="w-4 h-4 text-primary" />}
            label={lang === "gu" ? "તિથિ" : "Tithi"}
            value={lang === "gu" ? data.tithi.name_gu : data.tithi.name_en}
            sub={
              data.tithi.start && data.tithi.end
                ? `${lang === "gu" ? data.tithi.paksha_gu : data.tithi.paksha} • ${formatTzTime(data.tithi.start, tzOffsetHours, false, targetTz)}`
                : lang === "gu" ? data.tithi.paksha_gu : data.tithi.paksha
            }
          />
          <BentoPillar
            icon={<Sun className="w-4 h-4 text-amber-500" />}
            label={lang === "gu" ? "વાર" : "Vara"}
            value={lang === "gu" ? data.vara.name_gu : data.vara.name_en}
            sub={
              lang === "gu"
                ? `સ્વામી: ${LORD_GU_MAP[VARA_LORD_EN[data.vara.name_en] || "Sun"] || "સૂર્ય"}`
                : `Lord: ${VARA_LORD_EN[data.vara.name_en] || "Sun"}`
            }
          />
          <BentoPillar
            icon={<Star className="w-4 h-4 text-indigo-400" />}
            label={lang === "gu" ? "નક્ષત્ર" : "Nakshatra"}
            value={lang === "gu" ? data.nakshatra.name_gu : data.nakshatra.name_en}
            sub={
              data.nakshatra.lord
                ? `${lang === "gu" ? "સ્વામી: " : "Lord: "}${lang === "gu" ? (LORD_GU_MAP[data.nakshatra.lord] || data.nakshatra.lord) : data.nakshatra.lord}`
                : undefined
            }
          />
          <BentoPillar
            icon={<Compass className="w-4 h-4 text-teal-500" />}
            label={lang === "gu" ? "યોગ / કરણ" : "Yoga / Karana"}
            value={lang === "gu" ? data.yoga.name_gu : data.yoga.name_en}
            sub={lang === "gu" ? data.karana.name_gu : data.karana.name_en}
            tone={tierToTone(data.yoga ? classifyYoga(data.yoga.index) : "good")}
          />
          <BentoPillar
            icon={<Clock className="w-4 h-4 text-primary" />}
            label={lang === "gu" ? "હોરા સ્વામી" : "Hora Lord"}
            value={
              data.currentHora
                ? lang === "gu"
                  ? data.currentHora.name_gu
                  : data.currentHora.name_en
                : "—"
            }
            sub={
              data.currentHora?.isGood
                ? lang === "gu" ? "શુભ ફળદાયી" : "Benefic Lord"
                : lang === "gu" ? "ક્રૂર / અશુભ" : "Malefic Lord"
            }
            tone={data.currentHora?.isGood ? "good" : "bad"}
          />
          <BentoPillar
            icon={<Activity className="w-4 h-4 text-primary" />}
            label={lang === "gu" ? "ચોઘડિયું ફળ" : "Choghadiya Quality"}
            value={
              data.currentChoghadiya
                ? lang === "gu"
                  ? data.currentChoghadiya.name_gu
                  : data.currentChoghadiya.name_en
                : "—"
            }
            sub={
              data.currentChoghadiya?.quality === "good"
                ? lang === "gu" ? "અતિ શુભ" : "Highly Auspicious"
                : data.currentChoghadiya?.quality === "mixed"
                ? lang === "gu" ? "સામાન્ય / ચર" : "Neutral / Travel"
                : lang === "gu" ? "ત્યાજ્ય / અશુભ" : "Inauspicious"
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
      </div>
    </div>
  );
}

function BentoPillar({
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
      : "bg-card/90 dark:bg-card/65 border-border/80 dark:border-white/10 text-foreground";

  return (
    <div
      className={cn(
        "p-3 rounded-2xl border flex flex-col justify-between items-center text-center transition-all shadow-xs min-h-[80px] h-full hover:shadow-md",
        toneClass
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center my-auto py-0.5 w-full">
        <p className="text-xs sm:text-sm font-bold leading-tight break-words">
          {value}
        </p>
        {sub && (
          <p className="text-[10px] font-semibold opacity-85 leading-tight pt-0.5 break-words line-clamp-1">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function tierToTone(tier: Tier): "good" | "bad" | "mixed" {
  if (tier === "highly" || tier === "auspicious") return "good";
  if (tier === "good") return "mixed";
  return "bad";
}
