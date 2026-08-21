"use client";

import { LanguageProvider, useLang } from "@/hooks/use-lang";
import { SettingsButton } from "@/components/settings-button";
import { LiveCosmicHub } from "@/components/hub/live-cosmic-hub";
import { PanchangTimelineDrawer } from "@/components/hub/panchang-timeline-drawer";
import { OccasionStudio } from "@/components/hub/occasion-studio";
import { OccasionDetailView } from "@/components/hub/occasion-detail-view";
import { Button } from "@/components/ui/button";
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
  CITIES,
  findNearestCity,
  type EventId,
  type CityDef,
} from "@/lib/events";
import { getSystemTimezone, getCityNameFromTimezone } from "@/lib/time-utils";
import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Home,
} from "lucide-react";
import Image from "next/image";
import { formatHeaderDateTime } from "@/lib/i18n";

const IST_OFFSET = 5.5; // Gujarat is IST = UTC+5:30

function LiveHeaderDateTime({
  lang,
  tzOffsetHours,
  tz,
}: {
  lang: "en" | "gu";
  tzOffsetHours: number;
  tz?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  let greetingEn = "Good Morning";
  let greetingGu = "શુભ સવાર";
  if (hour >= 12 && hour < 16) {
    greetingEn = "Good Afternoon";
    greetingGu = "શુભ બપોર";
  } else if (hour >= 16 && hour < 20) {
    greetingEn = "Good Evening";
    greetingGu = "શુભ સંધ્યા";
  } else if (hour >= 20 || hour < 5) {
    greetingEn = "Good Night";
    greetingGu = "શુભ રાત્રિ";
  }

  return (
    <div className="flex flex-col min-w-0" suppressHydrationWarning>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[11px] sm:text-xs font-bold text-primary truncate" suppressHydrationWarning>
          {lang === "gu" ? greetingGu : greetingEn}
        </span>
        <span className="text-muted-foreground/50 text-[10px] hidden xs:inline">•</span>
        <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate whitespace-nowrap hidden xs:inline" suppressHydrationWarning>
          {mounted ? formatHeaderDateTime(now, lang, tzOffsetHours, tz) : "..."}
        </p>
      </div>
      <p className="text-[10px] font-medium text-muted-foreground truncate xs:hidden" suppressHydrationWarning>
        {mounted ? formatHeaderDateTime(now, lang, tzOffsetHours, tz) : "..."}
      </p>
    </div>
  );
}

function ShubhSamayApp() {
  const { lang, t } = useLang();
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [activeEventId, setActiveEventId] = useState<EventId | null>(null);

  const [city, setCity] = useState<CityDef | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shubh_samay_location");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fall through
        }
      }
    }
    return {
      lat: 23.0225,
      lng: 72.5714,
      name_en: "Ahmedabad",
      name_gu: "અમદાવાદ",
      tz: "Asia/Kolkata",
    };
  });

  const [showExitDialog, setShowExitDialog] = useState(false);

  // Sync active event with URL hash (#marriage, #vehicle-purchase, etc.)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && EVENTS.some((e) => e.id === hash)) {
        setActiveEventId(hash as EventId);
      } else if (!hash) {
        setActiveEventId(null);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    window.addEventListener("popstate", checkHash);
    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.removeEventListener("popstate", checkHash);
    };
  }, []);

  const handleSelectEvent = useCallback((id: EventId) => {
    setActiveEventId(id);
    if (typeof window !== "undefined") {
      window.location.hash = id;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleBackToHome = useCallback(() => {
    setActiveEventId(null);
    if (typeof window !== "undefined") {
      if (window.location.hash) {
        window.history.pushState(null, "", window.location.pathname);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // First launch location initialization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("shubh_samay_location");
    if (saved) return;

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
          const ahmedabad = CITIES[0];
          setCity(ahmedabad);
          localStorage.setItem("shubh_samay_location", JSON.stringify(ahmedabad));
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, []);

  const handleCityChange = (newCity: CityDef) => {
    setCity(newCity);
    if (typeof window !== "undefined") {
      localStorage.setItem("shubh_samay_location", JSON.stringify(newCity));
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary/25 bg-background text-foreground">
      {/* Ambient background celestial gradient glow spots */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/15 blur-3xl pointer-events-none -z-10" />

      {/* Sticky Frosted Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-primary/20 dark:border-primary/15 shadow-xs transition-all">
        <div className="max-w-2xl mx-auto px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBackToHome}
            className="flex items-center gap-2.5 leading-tight min-w-0 flex-1 cursor-pointer text-left focus:outline-none"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Shubh Samay Logo"
                width={38}
                height={38}
                className="rounded-2xl shrink-0 border border-primary/40 shadow-xs w-8 h-8 sm:w-9 sm:h-9"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-extrabold text-sm xs:text-base sm:text-lg text-foreground truncate whitespace-nowrap tracking-tight">
                {lang === "gu" ? "શુભ સમય" : "Shubh Samay"}
              </h1>
              <LiveHeaderDateTime lang={lang} tzOffsetHours={IST_OFFSET} tz={city?.tz} />
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <SettingsButton city={city} onCityChange={handleCityChange} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-4 py-4 sm:py-6 space-y-6">
        {activeEventId ? (
          /* Dedicated Occasion Muhurat Page */
          <OccasionDetailView
            eventId={activeEventId}
            city={city}
            tzOffsetHours={IST_OFFSET}
            onBack={handleBackToHome}
          />
        ) : (
          /* Main Dashboard: Live Panchang + Occasion Finder */
          <>
            {/* SECTION 1: LIVE PANCHANG ASTROLABE & 5-PILLAR MATRIX */}
            <section className="space-y-2">
              <LiveCosmicHub
                city={city}
                tzOffsetHours={IST_OFFSET}
                onOpenTimeline={() => setTimelineOpen(true)}
              />
            </section>

            {/* SECTION 2: OCCASION & AUSPICIOUS DATE FINDER */}
            <section className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1 border-t border-border/50 pt-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>{lang === "gu" ? "શુભ મુહૂર્ત શોધો (પ્રસંગ પસંદ કરો)" : "Find Auspicious Muhurat (Select Event)"}</span>
                </p>
              </div>

              <OccasionStudio onSelectEvent={handleSelectEvent} />
            </section>
          </>
        )}
      </main>

      {/* 24-Hour Day/Night Panchang Timeline Modal Drawer */}
      <PanchangTimelineDrawer
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        city={city}
        tzOffsetHours={IST_OFFSET}
      />

      {/* Android Hardware Back Exit Confirmation Modal */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="max-w-xs sm:max-w-sm p-5 border-primary/30 rounded-3xl bg-card/95 backdrop-blur-2xl">
          <DialogHeader className="space-y-2 text-center sm:text-left">
            <DialogTitle className="flex items-center justify-center sm:justify-start gap-2 text-foreground text-base font-bold">
              <Home className="h-5 w-5 text-primary shrink-0" />
              {lang === "gu" ? "એપમાંથી બહાર નીકળો" : "Exit App"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-1 leading-relaxed">
              {lang === "gu"
                ? "શું તમે ખરેખર એપમાંથી બહાર નીકળવા માંગો છો?"
                : "Are you sure you want to exit the app?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitDialog(false)}
              className="flex-1 sm:flex-initial text-xs h-9 rounded-xl border-border/60 cursor-pointer"
            >
              {lang === "gu" ? "રદ કરો" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setShowExitDialog(false);
                if (typeof window !== "undefined") {
                  window.history.go(-2);
                }
              }}
              className="flex-1 sm:flex-initial text-xs h-9 rounded-xl font-bold cursor-pointer"
            >
              {lang === "gu" ? "બહાર નીકળો" : "Exit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Page() {
  return (
    <LanguageProvider>
      <ShubhSamayApp />
    </LanguageProvider>
  );
}
