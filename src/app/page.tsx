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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  EVENTS,
  METHODS,
  CITIES,
  findNearestCity,
  resolveAutoMethods,
  type EventId,
  type MethodId,
  type CityDef,
  type TimeWindow,
} from "@/lib/events";
import { getSystemTimezone, getCityNameFromTimezone } from "@/lib/time-utils";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CalendarClock,
  ListChecks,
  Moon,
  MapPin,
  Home,
} from "lucide-react";
import Image from "next/image";
import { formatHeaderDateTime } from "@/lib/i18n";

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
  const [city, setCity] = useState<CityDef | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shubh_samay_location");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fall through if invalid JSON
        }
      }
    }
    return null;
  });
  const [showDefaultLocationDialog, setShowDefaultLocationDialog] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  // Live timer for header date & time display
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [highlySlots, setHighlySlots] = useState<TimingResult[]>([]);
  const [auspiciousSlots, setAuspiciousSlots] = useState<TimingResult[]>([]);
  const [goodSlots, setGoodSlots] = useState<TimingResult[]>([]);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [bestRecommendationSlot, setBestRecommendationSlot] = useState<TimingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial location load & first-launch GPS permission handling
  useEffect(() => {
    if (typeof window === "undefined" || city) return;

    // No saved location -> First-time app open: request GPS permission
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const nearest = findNearestCity(latitude, longitude, 50);
          if (nearest) {
            setCity(nearest);
            localStorage.setItem("shubh_samay_location", JSON.stringify(nearest));
          } else {
            const sysTz = getSystemTimezone();
            const tzCity = getCityNameFromTimezone(sysTz);
            const customLoc: CityDef = {
              name_en: tzCity,
              name_gu: tzCity,
              lat: latitude,
              lng: longitude,
              state: sysTz,
              tz: sysTz,
            };
            setCity(customLoc);
            localStorage.setItem("shubh_samay_location", JSON.stringify(customLoc));
          }
        },
        () => {
          // Permission declined or error -> Fallback to Ahmedabad + show notice dialog
          const ahmedabad = CITIES[0];
          setCity(ahmedabad);
          localStorage.setItem("shubh_samay_location", JSON.stringify(ahmedabad));
          setShowDefaultLocationDialog(true);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      queueMicrotask(() => {
        const ahmedabad = CITIES[0];
        setCity(ahmedabad);
        localStorage.setItem("shubh_samay_location", JSON.stringify(ahmedabad));
        setShowDefaultLocationDialog(true);
      });
    }
  }, []);

  const handleCityChange = (newCity: CityDef) => {
    setCity(newCity);
    if (typeof window !== "undefined") {
      localStorage.setItem("shubh_samay_location", JSON.stringify(newCity));
    }
  };

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
    setBestRecommendationSlot(null);
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
      setBestRecommendationSlot(data.bestRecommendation || null);
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
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/60 shadow-2xs">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="leading-tight min-w-0 flex-1">
            <h1 className="font-bold text-base sm:text-lg text-foreground truncate">
              {lang === "gu" ? "આજનું પંચાંગ" : "Today's Panchang"}
            </h1>
            <p className="text-xs font-semibold text-primary/95 truncate pt-0.5">
              {formatHeaderDateTime(now, lang, IST_OFFSET, city?.tz)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LocationSearch
              value={city}
              onChange={handleCityChange}
              onGpsError={() => setShowDefaultLocationDialog(true)}
            />
            <SettingsButton city={city} onCityChange={handleCityChange} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-5">
        {/* Today's panchang widget — only on home (event step) */}
        {step === "event" && (
          <PanchangToday city={city} tzOffsetHours={IST_OFFSET} onCityChange={handleCityChange} />
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
              bestRecommendation={bestRecommendationSlot}
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
            />
          )}
        </Card>

        {/* Home button on results page */}
        {step === "results" && (
          <div className="flex justify-center pt-1">
            <Button
              onClick={reset}
              variant="ghost"
              size="sm"
              aria-label={t("home")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              {t("home")}
            </Button>
          </div>
        )}

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
          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={reset}
              variant="ghost"
              size="icon"
              aria-label={t("home")}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
            </Button>
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

      {/* First-launch Default Location Notification Modal */}
      <Dialog open={showDefaultLocationDialog} onOpenChange={setShowDefaultLocationDialog}>
        <DialogContent className="max-w-md p-6 border-primary/20">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-foreground text-base">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              {t("defaultLocationNoticeTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1 leading-relaxed">
              {t("defaultLocationNoticeBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              onClick={() => setShowDefaultLocationDialog(false)}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("gotIt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
