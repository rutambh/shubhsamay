"use client";

import { useLang } from "@/hooks/use-lang";
import { formatTzTime } from "@/lib/i18n";
import { Sun, Moon } from "lucide-react";
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

    // Dynamic color & glow computation based on time of day
    // Morning (<0.25): Golden/amber sunrise glow
    // Midday (0.25 to 0.70): High intense radiant yellow
    // Evening (>=0.70): Warm deep orange dusk, less glowish (as per user instruction)
    let sunColor = "#F59E0B"; // Amber gold
    let sunShadow = "0 0 10px rgba(245, 158, 11, 0.75), 0 0 20px rgba(251, 191, 36, 0.35)";
    let bgGlow = "from-amber-400 to-orange-400";

    if (!isDayTime) {
      sunColor = "#94A3B8"; // Night slate
      sunShadow = "0 0 6px rgba(148, 163, 184, 0.4)";
      bgGlow = "from-slate-500 to-indigo-500";
    } else if (clampedProgress < 0.25) {
      // Early morning
      sunColor = "#F59E0B";
      sunShadow = "0 0 10px rgba(245, 158, 11, 0.75), 0 0 18px rgba(251, 191, 36, 0.3)";
      bgGlow = "from-amber-300 via-amber-400 to-orange-400";
    } else if (clampedProgress >= 0.25 && clampedProgress < 0.7) {
      // Midday — brilliant golden sun with high radiant glow
      sunColor = "#FACC15";
      sunShadow = "0 0 14px rgba(250, 204, 21, 0.95), 0 0 26px rgba(253, 224, 71, 0.55)";
      bgGlow = "from-amber-300 via-yellow-400 to-amber-500";
    } else {
      // Evening dusk — rich orange, less glowish as requested
      sunColor = "#EA580C"; // Deep orange
      sunShadow = "0 0 6px rgba(234, 88, 12, 0.55), 0 0 10px rgba(249, 115, 22, 0.25)";
      bgGlow = "from-amber-400 via-orange-500 to-red-500";
    }

    // Time status text (e.g. remaining till sunset)
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

  // Position along the track (clamped between 4% and 96%)
  const markerPercent = Math.max(4, Math.min(96, progress * 100));

  return (
    <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
      {/* Header labels */}
      <div className="flex items-center justify-between gap-2">
        {/* Sunrise */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base leading-none shrink-0" role="img" aria-label="Sunrise">
            🌅
          </span>
          <div className="min-w-0">
            <span className="font-bold text-foreground text-xs sm:text-sm whitespace-nowrap block">
              {formatTzTime(sunrise, tzOffsetHours, false, targetTz)}
            </span>
            <span className="text-muted-foreground/70 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider block -mt-0.5">
              {lang === "gu" ? "સૂર્યોદય" : "Sunrise"}
            </span>
          </div>
        </div>

        {/* Center solar status */}
        <div className="text-center min-w-0 px-1">
          <span className="text-[10px] sm:text-[11px] font-semibold text-primary/90 truncate block">
            {timeStatus}
          </span>
        </div>

        {/* Sunset */}
        <div className="flex items-center gap-1.5 min-w-0 text-right">
          <div className="min-w-0">
            <span className="font-bold text-foreground text-xs sm:text-sm whitespace-nowrap block">
              {formatTzTime(sunset, tzOffsetHours, false, targetTz)}
            </span>
            <span className="text-muted-foreground/70 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider block -mt-0.5">
              {lang === "gu" ? "સૂર્યાસ્ત" : "Sunset"}
            </span>
          </div>
          <span className="text-base leading-none shrink-0" role="img" aria-label="Sunset">
            🌇
          </span>
        </div>
      </div>

      {/* Solar Arc Track with Dynamic Moving Sun Marker */}
      <div className="relative w-full h-5 flex items-center px-1">
        {/* Background track line */}
        <div className="w-full h-1.5 rounded-full bg-muted/80 overflow-hidden relative">
          {/* Active progress fill */}
          <div
            className={cn("h-full transition-all duration-500 bg-gradient-to-r", sunStyle.bgGlow)}
            style={{ width: `${markerPercent}%` }}
          />
        </div>

        {/* Animated Sun / Moon Marker traveling on the line */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 z-10 flex items-center justify-center"
          style={{ left: `${markerPercent}%` }}
        >
          {isDay ? (
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-background border border-amber-400/50 transition-all duration-500 animate-pulse"
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
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-background border border-indigo-400/40 shadow-xs"
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