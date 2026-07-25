"use client";

import { useLang } from "@/hooks/use-lang";
import { formatTzTime } from "@/lib/i18n";

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
  const isDay = now
    ? new Date(now) >= new Date(sunrise) && new Date(now) <= new Date(sunset)
    : true;

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-3">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <span className="animate-sunrise-float shrink-0 text-base sm:text-lg leading-none">
          🌅
        </span>
        <div className="flex items-baseline gap-1 sm:gap-1.5 min-w-0">
          <span className="font-black tracking-tight text-foreground text-sm sm:text-base whitespace-nowrap">
            {formatTzTime(sunrise, tzOffsetHours, false, targetTz)}
          </span>
          <span className="text-muted-foreground/50 text-[10px] sm:text-xs uppercase tracking-wider font-semibold hidden sm:inline">
            {lang === "gu" ? "સૂર્યોદય" : "Sunrise"}
          </span>
        </div>
      </div>

      <div className="flex-1 h-px bg-gradient-to-r from-amber-300 via-primary to-orange-400 min-w-[24px] mx-0.5 sm:mx-1 self-center" />

      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <div className="flex items-baseline gap-1 sm:gap-1.5 min-w-0">
          <span className="font-black tracking-tight text-foreground text-sm sm:text-base whitespace-nowrap">
            {formatTzTime(sunset, tzOffsetHours, false, targetTz)}
          </span>
          <span className="text-muted-foreground/50 text-[10px] sm:text-xs uppercase tracking-wider font-semibold hidden sm:inline">
            {lang === "gu" ? "સૂર્યાસ્ત" : "Sunset"}
          </span>
        </div>
        <span className="animate-sunset-float shrink-0 text-base sm:text-lg leading-none">
          🌇
        </span>
      </div>
    </div>
  );
}