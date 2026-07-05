"use client";

import { LanguageProvider, useLang } from "@/hooks/use-lang";
import { SettingsButton } from "@/components/settings-button";
import { LocationSearch } from "@/components/location-search";
import { EventPicker } from "@/components/wizard/event-picker";
import { MethodPicker } from "@/components/wizard/method-picker";
import { DateRangePicker } from "@/components/wizard/date-picker";
import {
  ResultsView,
  type TimingResult,
  type Suggestion,
} from "@/components/wizard/results-view";
import { PanchangToday } from "@/components/wizard/panchang-today";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EVENTS,
  METHODS,
  resolveAutoMethods,
  type EventId,
  type MethodId,
  type CityDef,
  type TimeWindow,
} from "@/lib/events";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CalendarClock,
  ListChecks,
  Moon,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

const IST_OFFSET = 5.5; // Gujarat is IST = UTC+5:30

type Step = "event" | "method" | "dates" | "results";
const STEP_ORDER: Step[] = ["event", "method", "dates", "results"];

function ShubhSamayApp() {
  const { lang, t } = useLang();
  const [step, setStep] = useState<Step>("event");
  const [eventId, setEventId] = useState<EventId | null>(null);
  const [methods, setMethods] = useState<MethodId[]>([]);
  const [dates, setDates] = useState<Date[]>([]);
  const [timeWindow, setTimeWindow] = useState<TimeWindow | null>(null);
  const [city, setCity] = useState<CityDef | null>(null);

  const [highlySlots, setHighlySlots] = useState<TimingResult[]>([]);
  const [auspiciousSlots, setAuspiciousSlots] = useState<TimingResult[]>([]);
  const [goodSlots, setGoodSlots] = useState<TimingResult[]>([]);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIdx = STEP_ORDER.indexOf(step);
  const eventDef = EVENTS.find((e) => e.id === eventId);

  // === EVENT PICKER — auto-advance on click ===
  // For "Others" event: skip method step, default to "All", go straight to dates
  const handleEventSelect = (id: EventId) => {
    setEventId(id);
    if (id === "others") {
      // Skip method selection, default to "all"
      setMethods(["all"]);
      setStep("dates");
    } else {
      // Pre-fill methods with "auto" so user can just hit Next
      setMethods(["auto"]);
      setStep("method");
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case "method": return methods.length > 0;
      case "dates": return dates.length > 0;
      default: return true;
    }
  };

  const next = async () => {
    if (step === "dates") {
      await fetchResults();
      setStep("results");
      return;
    }
    const nextIdx = stepIdx + 1;
    if (nextIdx < STEP_ORDER.length) setStep(STEP_ORDER[nextIdx]);
  };

  const back = () => {
    if (stepIdx > 0) setStep(STEP_ORDER[stepIdx - 1]);
  };

  const reset = () => {
    setStep("event");
    setEventId(null);
    setMethods([]);
    setDates([]);
    setTimeWindow(null);
    setHighlySlots([]);
    setAuspiciousSlots([]);
    setGoodSlots([]);
    setSuggestion(null);
    setError(null);
  };

  const addSuggestedDate = (d: Date) => {
    const normalized = new Date(d);
    normalized.setHours(12, 0, 0, 0);
    const exists = dates.some(
      (x) => x.toDateString() === normalized.toDateString()
    );
    if (!exists) {
      const newDates = [...dates, normalized].sort(
        (a, b) => a.getTime() - b.getTime()
      );
      setDates(newDates);
      // Re-fetch with the new date included
      setTimeout(() => {
        fetchResultsWith(newDates, methods, timeWindow);
      }, 100);
    }
  };

  const fetchResults = async () => {
    await fetchResultsWith(dates, methods, timeWindow);
  };

  const fetchResultsWith = async (
    ds: Date[],
    ms: MethodId[],
    tw: TimeWindow | null
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/timings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: eventId,
          methods: ms,
          dates: ds.map((d) => d.toISOString()),
          city,
          tzOffsetHours: IST_OFFSET,
          lang,
          timeWindow: tw ?? undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to fetch");
      setHighlySlots(data.highly || []);
      setAuspiciousSlots(data.auspicious || []);
      setGoodSlots(data.good || []);
      setSuggestion(data.suggestion || null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const stepMeta: Record<
    Step,
    { icon: React.ReactNode; title: string; desc: string }
  > = {
    event: {
      icon: <Sparkles className="h-5 w-5" />,
      title: t("stepEvent"),
      desc: t("stepEventDesc"),
    },
    method: {
      icon: <ListChecks className="h-5 w-5" />,
      title: t("stepMethod"),
      desc: t("stepMethodDesc"),
    },
    dates: {
      icon: <CalendarClock className="h-5 w-5" />,
      title: t("stepDates"),
      desc: t("stepDatesDesc"),
    },
    results: {
      icon: <Moon className="h-5 w-5" />,
      title: t("stepResults"),
      desc: t("stepResultsDesc"),
    },
  };

  // Show resolved methods for chips
  const resolvedMethodLabels: string[] = [];
  for (const m of methods) {
    if (m === "auto") {
      const auto = eventId ? resolveAutoMethods(eventId) : [];
      for (const am of auto) {
        const def = METHODS.find((x) => x.id === am);
        if (def)
          resolvedMethodLabels.push(lang === "gu" ? def.name_gu : def.name_en);
      }
    } else if (m === "all") {
      // "All" expands to all 6 concrete methods
      const allMethods = ["choghadiya", "hora", "tithi", "nakshatra", "yoga", "muhurat"] as const;
      for (const am of allMethods) {
        const def = METHODS.find((x) => x.id === am);
        if (def)
          resolvedMethodLabels.push(lang === "gu" ? def.name_gu : def.name_en);
      }
    } else {
      const def = METHODS.find((x) => x.id === m);
      if (def)
        resolvedMethodLabels.push(lang === "gu" ? def.name_gu : def.name_en);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/logo.png"
              alt="Shubh Samay"
              width={36}
              height={36}
              className="rounded-lg shadow-sm shrink-0"
              priority
            />
            <div className="leading-tight min-w-0">
              <h1 className="font-bold text-base text-foreground whitespace-nowrap">
                {t("appName")}
              </h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                {t("appTagline")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LocationSearch value={city} onChange={setCity} />
            <SettingsButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-5">
        {/* Today's panchang widget — only on home (event step) */}
        {step === "event" && (
          <PanchangToday city={city} tzOffsetHours={IST_OFFSET} />
        )}

        {/* Progress indicator */}
        {step !== "results" && (
          <div className="flex items-center justify-center gap-1.5">
            {STEP_ORDER.slice(0, 3).map((s, i) => (
              <div
                key={s}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (i <= stepIdx ? "bg-primary w-8" : "bg-muted w-5")
                }
              />
            ))}
          </div>
        )}

        {/* Step header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {stepMeta[step].icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {t("step")} {stepIdx + 1} / {STEP_ORDER.length}
            </p>
            <h2 className="text-lg font-bold text-foreground">
              {stepMeta[step].title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {stepMeta[step].desc}
            </p>
          </div>
        </div>

        {/* Step content */}
        <Card className="p-5 bg-card/80 backdrop-blur">
          {step === "event" && (
            <EventPicker value={eventId} onChange={handleEventSelect} />
          )}
          {step === "method" && (
            <MethodPicker eventId={eventId} value={methods} onChange={setMethods} />
          )}
          {step === "dates" && (
            <DateRangePicker
              dates={dates}
              onChange={setDates}
              timeWindow={timeWindow}
              onTimeWindowChange={setTimeWindow}
            />
          )}
          {step === "results" && (
            <ResultsView
              highly={highlySlots}
              auspicious={auspiciousSlots}
              good={goodSlots}
              suggestion={suggestion}
              loading={loading}
              error={error}
              eventName={
                eventDef
                  ? `${eventDef.emoji} ${
                      lang === "gu" ? eventDef.name_gu : eventDef.name_en
                    }`
                  : undefined
              }
              onReset={reset}
              onAddSuggestedDate={addSuggestedDate}
            />
          )}
        </Card>

        {/* Selection summary chips */}
        {step !== "results" && step !== "event" && (
          <div className="flex flex-wrap gap-2 text-xs">
            {eventDef && (
              <Chip
                label={lang === "gu" ? eventDef.name_gu : eventDef.name_en}
                emoji={eventDef.emoji}
              />
            )}
            {resolvedMethodLabels.length > 0 && (
              <Chip
                label={`${resolvedMethodLabels.length} ${
                  lang === "gu" ? "પદ્ધતિ" : "methods"
                }: ${resolvedMethodLabels.join(", ")}`}
              />
            )}
            {dates.length > 0 && (
              <Chip
                label={`${dates.length} ${
                  lang === "gu" ? "તારીખ" : dates.length > 1 ? "dates" : "date"
                }`}
              />
            )}
            {timeWindow && (
              <Chip
                label={`${formatTimeWindow(timeWindow, lang)}`}
                icon={<CalendarClock className="h-3 w-3" />}
              />
            )}
          </div>
        )}

        {/* Navigation buttons — hidden on event step (auto-advances) */}
        {step !== "results" && step !== "event" && (
          <div className="flex items-center gap-3 pt-1">
            <Button onClick={back} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
            <Button
              onClick={next}
              disabled={!canProceed() || loading}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            >
              {step === "dates" ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t("findTimings")}
                </>
              ) : (
                <>
                  {t("next")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-background/80 backdrop-blur py-4">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-sm text-foreground/80 font-medium">
            {t("footerLove")}
          </p>
        </div>
      </footer>
    </div>
  );
}

function formatTimeWindow(
  tw: TimeWindow,
  lang: "en" | "gu"
): string {
  const fmt = (dec: number) => {
    const h = Math.floor(dec);
    const m = Math.round((dec - h) * 60);
    const period = h < 12 ? "AM" : "PM";
    const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${dh}:${String(m).padStart(2, "0")} ${period}`;
  };
  const label = lang === "gu" ? "સમય" : "Time";
  return `${label}: ${fmt(tw.startHour)}–${fmt(tw.endHour)}`;
}

function Chip({
  label,
  emoji,
  icon,
}: {
  label: string;
  emoji?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/60 text-secondary-foreground text-xs font-medium">
      {emoji && <span>{emoji}</span>}
      {icon}
      {label}
    </span>
  );
}

export default function Page() {
  return (
    <LanguageProvider>
      <ShubhSamayApp />
    </LanguageProvider>
  );
}
