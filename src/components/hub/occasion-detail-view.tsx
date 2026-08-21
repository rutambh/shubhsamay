"use client";

import { useLang } from "@/hooks/use-lang";
import {
  EVENTS,
  METHODS,
  resolveAutoMethods,
  type EventId,
  type MethodId,
  type TimeWindow,
  type CityDef,
} from "@/lib/events";
import { computeTimingsClient } from "@/lib/client-api";
import { ResultsView, type TimingResult } from "@/components/wizard/results-view";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Settings2,
  Sparkles,
  Check,
  Calendar as CalendarIcon,
} from "lucide-react";
import { addDays, startOfWeek } from "date-fns";

interface Props {
  eventId: EventId;
  city: CityDef | null;
  tzOffsetHours: number;
  onBack: () => void;
}

export function OccasionDetailView({
  eventId,
  city,
  tzOffsetHours,
  onBack,
}: Props) {
  const { lang } = useLang();
  const eventDef = EVENTS.find((e) => e.id === eventId) || EVENTS[0];

  // Date selection state
  const [datePreset, setDatePreset] = useState<"today" | "tomorrow" | "weekend" | "week" | "custom">("today");
  const [selectedDates, setSelectedDates] = useState<Date[]>(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return [today];
  });

  // Filters state
  const [timeSlotPreset, setTimeSlotPreset] = useState<"all" | "morning" | "afternoon" | "evening" | "night">("all");
  const [timeWindow, setTimeWindow] = useState<TimeWindow | null>(null);
  const [selectedMethods, setSelectedMethods] = useState<MethodId[]>(["auto"]);

  // Date preset handler
  const applyDatePreset = (preset: "today" | "tomorrow" | "weekend" | "week" | "custom") => {
    setDatePreset(preset);
    const now = new Date();
    now.setHours(12, 0, 0, 0);

    if (preset === "today") {
      setSelectedDates([now]);
    } else if (preset === "tomorrow") {
      const tomorrow = addDays(now, 1);
      tomorrow.setHours(12, 0, 0, 0);
      setSelectedDates([tomorrow]);
    } else if (preset === "weekend") {
      const sat = startOfWeek(addDays(now, 6), { weekStartsOn: 6 });
      sat.setHours(12, 0, 0, 0);
      const sun = addDays(sat, 1);
      sun.setHours(12, 0, 0, 0);
      setSelectedDates([sat, sun]);
    } else if (preset === "week") {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(now, i);
        d.setHours(12, 0, 0, 0);
        return d;
      });
      setSelectedDates(days);
    }
  };

  // Time preset handler
  const applyTimePreset = (slot: "all" | "morning" | "afternoon" | "evening" | "night") => {
    setTimeSlotPreset(slot);
    switch (slot) {
      case "all":
        setTimeWindow(null);
        break;
      case "morning":
        setTimeWindow({ startHour: 6, endHour: 12 });
        break;
      case "afternoon":
        setTimeWindow({ startHour: 12, endHour: 18 });
        break;
      case "evening":
        setTimeWindow({ startHour: 18, endHour: 22 });
        break;
      case "night":
        setTimeWindow({ startHour: 22, endHour: 30 });
        break;
    }
  };

  const handleMethodToggle = (id: MethodId) => {
    if (id === "auto" || id === "all") {
      setSelectedMethods([id]);
      return;
    }
    const filtered = selectedMethods.filter((m) => m !== "auto" && m !== "all");
    if (filtered.includes(id)) {
      const next = filtered.filter((m) => m !== id);
      setSelectedMethods(next.length === 0 ? ["auto"] : next);
    } else {
      setSelectedMethods([...filtered, id]);
    }
  };

  // Auto-resolved methods for this event
  const autoResolvedMethodNames = useMemo(() => {
    const resolvedIds = resolveAutoMethods(eventId);
    return resolvedIds
      .map((id) => {
        const m = METHODS.find((method) => method.id === id);
        return m ? (lang === "gu" ? m.name_gu : m.name_en) : id;
      })
      .join(", ");
  }, [eventId, lang]);

  // Instant real-time calculation whenever parameters change (0ms lag)
  const timingResults = useMemo(() => {
    if (selectedDates.length === 0) return { highly: [], auspicious: [], good: [], bestRecommendation: null };

    const activeLoc = city || {
      lat: 23.0225,
      lng: 72.5714,
      name_en: "Ahmedabad",
      name_gu: "અમદાવાદ",
      tz: "Asia/Kolkata",
    };

    try {
      const res = computeTimingsClient({
        event: eventId,
        methods: selectedMethods,
        dates: selectedDates.map((d) => d.toISOString()),
        city: activeLoc,
        tzOffsetHours,
        lang,
        timeWindow: timeWindow ?? undefined,
      });

      if (res.ok) {
        return {
          highly: res.highly || [],
          auspicious: res.auspicious || [],
          good: res.good || [],
          bestRecommendation: res.bestRecommendation || null,
        };
      }
    } catch {
      // Fall through
    }

    return { highly: [], auspicious: [], good: [], bestRecommendation: null };
  }, [eventId, selectedDates, selectedMethods, timeWindow, city, tzOffsetHours, lang]);

  return (
    <div className="space-y-4 fade-up">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-9 px-3 gap-2 text-xs font-extrabold rounded-2xl border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{lang === "gu" ? "પાછા જાઓ" : "Back to Home"}</span>
        </Button>

        <span className="text-xs font-bold text-muted-foreground truncate">
          {city?.name_en || "Ahmedabad"}
        </span>
      </div>

      {/* Occasion Hero Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-card/95 via-card/85 to-secondary/30 dark:from-card/90 dark:via-card/75 dark:to-secondary/20 backdrop-blur-2xl border border-primary/30 shadow-xl flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-3xl shrink-0 shadow-xs">
          {eventDef.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-black text-foreground leading-tight tracking-tight">
            {lang === "gu" ? eventDef.name_gu : eventDef.name_en}
          </h2>
          <p className="text-xs text-muted-foreground pt-0.5 leading-tight">
            {lang === "gu" ? eventDef.description_gu : eventDef.description_en}
          </p>
        </div>
      </div>

      {/* Quick Controls Panel */}
      <Card className="p-4 sm:p-5 rounded-3xl bg-card/90 dark:bg-card/75 backdrop-blur-xl border border-primary/20 shadow-md space-y-4">
        {/* 1. Enlarged Date Selection Presets & Custom Calendar Button */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>{lang === "gu" ? "તારીખ પસંદ કરો" : "Select Timing Dates"}</span>
            </label>
            <span className="text-[11px] font-bold text-primary">
              {selectedDates.length} {lang === "gu" ? "તારીખ" : selectedDates.length > 1 ? "days" : "day"}
            </span>
          </div>

          {/* 4 Quick Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "today", label_en: "Today", label_gu: "આજે" },
              { id: "tomorrow", label_en: "Tomorrow", label_gu: "આવતીકાલે" },
              { id: "weekend", label_en: "This Weekend", label_gu: "આ શનિ-રવિ" },
              { id: "week", label_en: "Next 7 Days", label_gu: "આગામી ૭ દિવસ" },
            ].map((p) => {
              const active = datePreset === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => applyDatePreset(p.id as any)}
                  className={cn(
                    "py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-center truncate",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]"
                      : "bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang === "gu" ? p.label_gu : p.label_en}
                </button>
              );
            })}
          </div>

          {/* 5th Option: Enlarged Prominent Custom Calendar Button */}
          <button
            type="button"
            onClick={() => setDatePreset(datePreset === "custom" ? "today" : "custom")}
            className={cn(
              "w-full py-2.5 px-3.5 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-2",
              datePreset === "custom"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-secondary/20 border-primary/30 text-primary hover:bg-primary/10"
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>
              {datePreset === "custom"
                ? lang === "gu" ? "✓ કસ્ટમ કેલેન્ડર સક્રિય છે (બંધ કરવા ક્લિક કરો)" : "✓ Custom Calendar Active (Click to Close)"
                : lang === "gu" ? "📅 કેલેન્ડરમાંથી ચોક્કસ તારીખો પસંદ કરો (Custom Dates)" : "📅 Select Custom Dates from Calendar"}
            </span>
          </button>

          {/* Custom Calendar Expansion */}
          {datePreset === "custom" && (
            <div className="p-3.5 rounded-2xl bg-background/60 border border-primary/25 flex justify-center shadow-inner">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(days) => {
                  if (days && days.length > 0) {
                    setSelectedDates(days);
                  }
                }}
                className="rounded-xl border border-primary/20 shadow-xs bg-card"
              />
            </div>
          )}
        </div>

        {/* 2. Preferred Time of Day Filter */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            <span>{lang === "gu" ? "સમય પસંદગી" : "Preferred Time of Day"}</span>
          </label>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {[
              { id: "all", label_en: "Full Day", label_gu: "આખો દિવસ" },
              { id: "morning", label_en: "Morning (6-12)", label_gu: "સવાર" },
              { id: "afternoon", label_en: "Afternoon (12-6)", label_gu: "બપોર" },
              { id: "evening", label_en: "Evening (6-10)", label_gu: "સાંજ" },
              { id: "night", label_en: "Night (10-6)", label_gu: "રાત્રિ" },
            ].map((slot) => {
              const active = timeSlotPreset === slot.id;
              return (
                <button
                  type="button"
                  key={slot.id}
                  onClick={() => applyTimePreset(slot.id as any)}
                  className={cn(
                    "py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center truncate",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang === "gu" ? slot.label_gu : slot.label_en}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Always Expanded, Compact 1-Line Astrological Methods */}
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-primary" />
              <span>{lang === "gu" ? "જ્યોતિષ પદ્ધતિઓ" : "Astrological Methods"}</span>
            </label>
            {selectedMethods.includes("auto") && (
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">
                {lang === "gu" ? "સ્માર્ટ વૈદિક ફિલ્ટર" : "Vedic Auto Filter"}
              </span>
            )}
          </div>

          {/* Compact 1-line method pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {METHODS.map((m) => {
              const isSelected = selectedMethods.includes(m.id);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => handleMethodToggle(m.id)}
                  className={cn(
                    "py-2 px-2.5 rounded-xl border text-center flex items-center justify-between transition-all cursor-pointer text-xs font-bold truncate",
                    isSelected
                      ? "bg-primary/20 border-primary text-primary shadow-2xs"
                      : "bg-secondary/25 border-border/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="truncate">{lang === "gu" ? m.name_gu : m.name_en}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-primary" />}
                </button>
              );
            })}
          </div>

          {/* When Auto is selected, explicitly show which modes are active for this event */}
          {selectedMethods.includes("auto") && (
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2 text-[11px] text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground">
                {lang === "gu" ? "આ પ્રસંગ માટે ઓટો સિલેક્ટેડ:" : "Auto Includes for this event:"}{" "}
                <strong className="text-primary font-bold">{autoResolvedMethodNames}</strong>
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Calculated Auspicious Muhurat Results */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{lang === "gu" ? "શુભ મુહૂર્ત પરિણામો" : "Auspicious Timing Results"}</span>
          </p>
        </div>

        <ResultsView
          highly={timingResults.highly}
          auspicious={timingResults.auspicious}
          good={timingResults.good}
          bestRecommendation={timingResults.bestRecommendation}
          loading={false}
          error={null}
          eventName={`${eventDef.emoji} ${lang === "gu" ? eventDef.name_gu : eventDef.name_en}`}
          onReset={onBack}
        />
      </div>
    </div>
  );
}
