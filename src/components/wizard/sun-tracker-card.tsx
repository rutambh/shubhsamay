"use client";

import { useLang } from "@/hooks/use-lang";
import { formatTzTime } from "@/lib/i18n";
import { Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface SunTrackerCardProps {
  sunrise: string;
  sunset: string;
  now?: string;
  tzOffsetHours: number;
  targetTz?: string;
}

export function SunTrackerCard({
  sunrise,
  sunset,
  now,
  tzOffsetHours,
  targetTz,
}: SunTrackerCardProps) {
  const { lang } = useLang();

  const { isDay, progress, sunStyle, timeStatus } = useMemo(() => {
    const nowDate = now ? new Date(now) : new Date();
    const riseDate = new Date(sunrise);
    const setDate = new Date(sunset);

    const nowMs = nowDate.getTime();
    const riseMs = riseDate.getTime();
    const setMs = setDate.getTime();

    const isDayTime = nowMs >= riseMs && nowMs <= setMs;

    let prog = 0;
    if (setMs > riseMs) {
      if (nowMs < riseMs) {
        prog = 0;
      } else if (nowMs > setMs) {
        prog = 1;
      } else {
        prog = (nowMs - riseMs) / (setMs - riseMs);
      }
    }
    const clampedProgress = Math.max(0, Math.min(1, prog));

    let sunColor = "#F59E0B"; // Amber gold
    let sunShadow = "0 0 12px rgba(245, 158, 11, 0.8), 0 0 24px rgba(251, 191, 36, 0.4)";
    let bgGlow = "from-amber-400 via-orange-400 to-amber-500";

    if (!isDayTime) {
      sunColor = "#818CF8"; // Celestial indigo
      sunShadow = "0 0 10px rgba(129, 140, 248, 0.7), 0 0 20px rgba(99, 102, 241, 0.35)";
      bgGlow = "from-slate-600 via-indigo-500 to-indigo-700";
    } else if (clampedProgress < 0.25) {
      // Early dawn/morning
      sunColor = "#F59E0B";
      sunShadow = "0 0 12px rgba(245, 158, 11, 0.8), 0 0 20px rgba(251, 191, 36, 0.35)";
      bgGlow = "from-amber-300 via-amber-400 to-orange-400";
    } else if (clampedProgress >= 0.25 && clampedProgress < 0.7) {
      // Midday sun — brilliant solar radiance
      sunColor = "#FACC15";
      sunShadow = "0 0 16px rgba(250, 204, 21, 0.95), 0 0 28px rgba(253, 224, 71, 0.6)";
      bgGlow = "from-amber-300 via-yellow-400 to-amber-500";
    } else {
      // Evening dusk
      sunColor = "#EA580C";
      sunShadow = "0 0 10px rgba(234, 88, 12, 0.7), 0 0 16px rgba(249, 115, 22, 0.35)";
      bgGlow = "from-amber-400 via-orange-500 to-rose-500";
    }

    let statusText = "";
    if (isDayTime) {
      const remainingMs = setMs - nowMs;
      const hours = Math.floor(remainingMs / 3600000);
      const mins = Math.floor((remainingMs % 3600000) / 60000);
      statusText =
        lang === "gu"
          ? `સૂર્યાસ્ત ${hours > 0 ? `${hours} કલાક ` : ""}${mins} મિનિટમાં`
          : `Sunset in ${hours > 0 ? `${hours}h ` : ""}${mins}m`;
    } else if (nowMs < riseMs) {
      const remainingMs = riseMs - nowMs;
      const hours = Math.floor(remainingMs / 3600000);
      const mins = Math.floor((remainingMs % 3600000) / 60000);
      statusText =
        lang === "gu"
          ? `સૂર્યોદય ${hours > 0 ? `${hours} કલાક ` : ""}${mins} મિનિટમાં`
          : `Sunrise in ${hours > 0 ? `${hours}h ` : ""}${mins}m`;
    } else {
      statusText = lang === "gu" ? "રાત્રિ સમય" : "Night Time";
    }

    return {
      isDay: isDayTime,
      progress: clampedProgress,
      sunStyle: {
        color: sunColor,
        boxShadow: sunShadow,
        bgGlow,
      },
      timeStatus: statusText,
    };
  }, [now, sunrise, sunset, lang]);

  const markerPercent = Math.max(4, Math.min(96, progress * 100));

  return (
    <div className="p-3 rounded-xl bg-secondary/35 border border-border/60 dark:bg-secondary/20 dark:border-white/10 space-y-2.5 transition-all">
      {/* Header labels */}
      <div className="flex items-center justify-between gap-2">
        {/* Sunrise */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Sunrise className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-foreground text-xs sm:text-sm whitespace-nowrap block">
              {formatTzTime(sunrise, tzOffsetHours, false, targetTz)}
            </span>
            <span className="text-muted-foreground/80 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider block -mt-0.5">
              {lang === "gu" ? "સૂર્યોદય" : "Sunrise"}
            </span>
          </div>
        </div>

        {/* Center solar status badge */}
        <div className="text-center min-w-0 px-1.5 py-0.5 rounded-full bg-background/60 border border-border/50 backdrop-blur-xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-primary/95 truncate block">
            {timeStatus}
          </span>
        </div>

        {/* Sunset */}
        <div className="flex items-center gap-1.5 min-w-0 text-right">
          <div className="min-w-0">
            <span className="font-bold text-foreground text-xs sm:text-sm whitespace-nowrap block">
              {formatTzTime(sunset, tzOffsetHours, false, targetTz)}
            </span>
            <span className="text-muted-foreground/80 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider block -mt-0.5">
              {lang === "gu" ? "સૂર્યાસ્ત" : "Sunset"}
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <Sunset className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Solar Arc Track with Dynamic Moving Celestial Marker */}
      <div className="relative w-full h-6 flex items-center px-1">
        {/* Background track line */}
        <div className="w-full h-2 rounded-full bg-muted/90 dark:bg-muted/50 overflow-hidden relative shadow-inner">
          {/* Active progress fill */}
          <div
            className={cn("h-full transition-all duration-700 bg-gradient-to-r", sunStyle.bgGlow)}
            style={{ width: `${markerPercent}%` }}
          />
        </div>

        {/* Animated Sun / Moon Marker traveling on the line */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 z-10 flex items-center justify-center"
          style={{ left: `${markerPercent}%` }}
        >
          {isDay ? (
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-background border-2 border-amber-400/80 transition-all duration-500 animate-pulse"
              style={{
                boxShadow: sunStyle.boxShadow,
              }}
            >
              <Sun
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-500"
                style={{ color: sunStyle.color }}
              />
            </div>
          ) : (
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-background border-2 border-indigo-400/80 shadow-md"
              style={{
                boxShadow: sunStyle.boxShadow,
              }}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}