"use client";

import { useLang } from "@/hooks/use-lang";
import {
  getChoghadiya,
  getHoras,
  type ChoghadiyaSlot,
  type HoraSlot,
  type ChoghadiyaQuality,
} from "@/lib/time-divisions";
import type { Location } from "@/lib/panchang";
import { formatTzTime } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  Sun,
  Moon,
  Clock,
  Activity,
  Sparkles,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city: Location | null;
  tzOffsetHours: number;
}

export function PanchangTimelineDrawer({
  open,
  onOpenChange,
  city,
  tzOffsetHours,
}: Props) {
  const { lang } = useLang();
  const [view, setView] = useState<"choghadiya" | "hora">("choghadiya");
  const [period, setPeriod] = useState<"day" | "night">("day");

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

  const now = new Date();
  const targetTz = loc.tz;

  // Compute Choghadiya & Hora for today
  const { choghadiyas, horas } = useMemo(() => {
    const ch = getChoghadiya(now, loc);
    const ho = getHoras(now, loc);
    return { choghadiyas: ch, horas: ho };
  }, [now, loc]);

  const activeChoghadiyaList = useMemo(() => {
    return choghadiyas.filter((c) => c.period === period);
  }, [choghadiyas, period]);

  const activeHoraList = useMemo(() => {
    return horas.filter((h) => h.period === period);
  }, [horas, period]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden border border-primary/25 rounded-3xl bg-card/95 backdrop-blur-2xl shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/60 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-extrabold text-foreground tracking-tight truncate">
                {lang === "gu" ? "૨૪ કલાક પંચાંગ ટાઈમલાઈન" : "24-Hour Vedic Timeline"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                {loc.name_en} • {formatTzTime(now, tzOffsetHours, false, targetTz)}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Mode Selectors */}
        <div className="px-4 sm:px-5 pt-3 space-y-2.5">
          {/* Main View Toggle: Choghadiya vs Hora */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-secondary/40 dark:bg-secondary/20 border border-border/50">
            <button
              type="button"
              onClick={() => setView("choghadiya")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
                view === "choghadiya"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === "gu" ? "ચોઘડિયા" : "Choghadiya"}</span>
            </button>
            <button
              type="button"
              onClick={() => setView("hora")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
                view === "hora"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === "gu" ? "હોરા" : "Hora (Plural)"}</span>
            </button>
          </div>

          {/* Day / Night Filter */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-background/50 border border-border/40">
            <button
              type="button"
              onClick={() => setPeriod("day")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                period === "day"
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === "gu" ? "દિવસના ચોઘડિયા" : "Day Period (સૂર્યોદય)"}</span>
            </button>
            <button
              type="button"
              onClick={() => setPeriod("night")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                period === "night"
                  ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === "gu" ? "રાત્રિના ચોઘડિયા" : "Night Period (સૂર્યાસ્ત)"}</span>
            </button>
          </div>
        </div>

        {/* Timeline Slot Cards: Single Line, Senior-Friendly High-Contrast Large Font Layout */}
        <div className="p-4 sm:p-5 max-h-[58vh] overflow-y-auto space-y-2 fancy-scroll">
          {view === "choghadiya"
            ? activeChoghadiyaList.map((slot, i) => {
                const isNow = now >= slot.start && now < slot.end;
                return (
                  <div
                    key={i}
                    className={cn(
                      "py-3 px-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5",
                      getQualityClass(slot.quality),
                      isNow && "ring-2 ring-primary shadow-md scale-[1.01]"
                    )}
                  >
                    {/* Left: Name + Timing Beside It (Single Line, Big Easy-to-Read Fonts) */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {isNow && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary cosmic-pulse shrink-0" />
                      )}
                      
                      <div className="flex items-baseline gap-2 min-w-0 flex-wrap sm:flex-nowrap">
                        <span className="font-black text-base sm:text-lg text-foreground tracking-tight">
                          {lang === "gu" ? slot.name_gu : slot.name_en}
                        </span>

                        <span className="text-xs sm:text-sm font-bold font-mono text-muted-foreground px-2 py-0.5 rounded-lg bg-background/70 dark:bg-background/50 border border-border/40 shrink-0">
                          {formatTzTime(slot.start, tzOffsetHours, false, targetTz)} – {formatTzTime(slot.end, tzOffsetHours, false, targetTz)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Quality Badge & Live Indicator */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn(
                        "text-xs sm:text-sm font-extrabold px-2.5 py-1 rounded-xl border shadow-2xs",
                        getQualityBadgeClass(slot.quality)
                      )}>
                        {getQualityLabel(slot.quality, lang)}
                      </span>

                      {isNow && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider shrink-0 animate-pulse">
                          {lang === "gu" ? "ચાલુ" : "Live"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            : activeHoraList.map((slot, i) => {
                const isNow = now >= slot.start && now < slot.end;
                return (
                  <div
                    key={i}
                    className={cn(
                      "py-3 px-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5",
                      slot.isGood
                        ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-900 dark:text-emerald-200"
                        : "bg-rose-500/10 border-rose-500/35 text-rose-900 dark:text-rose-200",
                      isNow && "ring-2 ring-primary shadow-md scale-[1.01]"
                    )}
                  >
                    {/* Left: Hora Lord Name + Timing Beside It (Single Line) */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {isNow && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary cosmic-pulse shrink-0" />
                      )}

                      <div className="flex items-baseline gap-2 min-w-0 flex-wrap sm:flex-nowrap">
                        <span className="font-black text-base sm:text-lg text-foreground tracking-tight">
                          {lang === "gu" ? slot.name_gu : slot.name_en}
                        </span>

                        <span className="text-xs sm:text-sm font-bold font-mono text-muted-foreground px-2 py-0.5 rounded-lg bg-background/70 dark:bg-background/50 border border-border/40 shrink-0">
                          {formatTzTime(slot.start, tzOffsetHours, false, targetTz)} – {formatTzTime(slot.end, tzOffsetHours, false, targetTz)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Auspiciousness Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn(
                        "text-xs sm:text-sm font-extrabold px-2.5 py-1 rounded-xl border shadow-2xs",
                        slot.isGood
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40"
                      )}>
                        {slot.isGood
                          ? lang === "gu" ? "શુભ ફળ" : "Auspicious"
                          : lang === "gu" ? "અશુભ ફળ" : "Inauspicious"}
                      </span>

                      {isNow && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider shrink-0 animate-pulse">
                          {lang === "gu" ? "ચાલુ" : "Live"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getQualityClass(q: ChoghadiyaQuality): string {
  switch (q) {
    case "good":
      return "bg-emerald-500/10 border-emerald-500/35 text-emerald-950 dark:text-emerald-200";
    case "mixed":
      return "bg-amber-500/10 border-amber-500/35 text-amber-950 dark:text-amber-200";
    case "bad":
      return "bg-rose-500/10 border-rose-500/35 text-rose-950 dark:text-rose-200";
    default:
      return "bg-secondary/35 border-border/50 text-foreground";
  }
}

function getQualityBadgeClass(q: ChoghadiyaQuality): string {
  switch (q) {
    case "good":
      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40";
    case "mixed":
      return "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40";
    case "bad":
      return "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40";
    default:
      return "bg-secondary/40 text-foreground border-border/40";
  }
}

function getQualityLabel(q: ChoghadiyaQuality, lang: "en" | "gu"): string {
  if (lang === "gu") {
    switch (q) {
      case "good": return "શુભ";
      case "mixed": return "મિશ્ર / ચર";
      case "bad": return "અશુભ";
    }
  }
  switch (q) {
    case "good": return "Auspicious";
    case "mixed": return "Neutral/Mixed";
    case "bad": return "Inauspicious";
  }
}
