"use client";

import { useLang } from "@/hooks/use-lang";
import { useTheme } from "next-themes";
import { CITIES, findNearestCity, type CityDef } from "@/lib/events";
import { getSystemTimezone, getCityNameFromTimezone } from "@/lib/time-utils";
import { CitySelectModal } from "@/components/city-select-modal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Languages,
  Check,
  MapPin,
  Navigation,
  Loader2,
  ChevronRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SettingsButtonProps {
  city: CityDef | null;
  onCityChange: (c: CityDef) => void;
}

const DEFAULT_CITY: CityDef = CITIES[0]; // Ahmedabad

export function SettingsButton({ city, onCityChange }: SettingsButtonProps) {
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentCity = city || DEFAULT_CITY;
  const currentLabel = lang === "gu" ? currentCity.name_gu : currentCity.name_en;

  const handleSyncLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError(lang === "gu" ? "જીપીએસ સપોર્ટેડ નથી" : "GPS not supported on device");
      return;
    }

    setLoadingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestCity(latitude, longitude, 50);

        if (nearest) {
          onCityChange(nearest);
          setLoadingGps(false);
        } else {
          const sysTz = getSystemTimezone();
          const tzCity = getCityNameFromTimezone(sysTz);
          const initialCity: CityDef = {
            name_en: tzCity,
            name_gu: tzCity,
            lat: latitude,
            lng: longitude,
            state: sysTz,
            tz: sysTz,
          };
          onCityChange(initialCity);
          setLoadingGps(false);

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (res.ok) {
              const geo = await res.json();
              const cityName = geo.city || geo.locality || geo.principalSubdivision || tzCity;
              const country = geo.countryName || sysTz;
              onCityChange({
                name_en: cityName,
                name_gu: cityName,
                lat: latitude,
                lng: longitude,
                state: country,
                tz: sysTz,
              });
            }
          } catch {
            // Keep fallback
          }
        }
      },
      () => {
        setLoadingGps(false);
        setGpsError(t("locationDenied"));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("settings")}
        className="rounded-full border border-primary/30 bg-card/80 backdrop-blur-xl hover:bg-primary/20 h-9 w-9 text-primary cursor-pointer transition-all shadow-xs flex items-center justify-center focus:outline-none shrink-0"
      >
        <Settings className="h-4 w-4 text-primary" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-card/95 backdrop-blur-2xl border-l border-primary/20 shadow-2xl">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 dark:border-white/10 shrink-0">
            <SheetTitle className="flex items-center gap-2.5 text-foreground text-lg font-extrabold tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Settings className="h-4 w-4" />
              </div>
              <span>{t("settings")}</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {lang === "gu" ? "તમારી પસંદગીઓ અને સ્થાન સંચાલિત કરો" : "Manage your location, language, and celestial theme"}
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-6 overflow-y-auto flex-1 fancy-scroll">
            {/* Location Section */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
                  {t("locationSetting")}
                </h3>
              </div>

              <Card className="p-4 border-primary/25 space-y-3.5 bg-secondary/30 dark:bg-secondary/15 backdrop-blur-xl rounded-3xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-2xl bg-primary/15 border border-primary/30 text-primary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-foreground truncate">
                        {currentLabel}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentCity.state}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCityModalOpen(true)}
                    className="h-8 gap-1 text-xs font-bold rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <span>{t("selectCity")}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Sync GPS Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSyncLocation}
                  disabled={loadingGps}
                  className="w-full h-10 gap-2 text-xs font-bold rounded-2xl border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer transition-all"
                >
                  {loadingGps ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4 text-primary" />
                  )}
                  <span>{loadingGps ? t("locating") : t("syncLocation")}</span>
                </Button>

                {gpsError && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 pt-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{gpsError}</span>
                  </p>
                )}
              </Card>
            </section>

            {/* Language */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
                  {t("languageSetting")}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <CompactCard
                  selected={lang === "en"}
                  onClick={() => setLang("en")}
                  label="English"
                  sub="International"
                />
                <CompactCard
                  selected={lang === "gu"}
                  onClick={() => setLang("gu")}
                  label="ગુજરાતી"
                  sub="પ્રામાણિક પંચાંગ"
                />
              </div>
            </section>

            {/* Theme */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-primary" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
                  {t("themeSetting")}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <CompactCard
                  selected={mounted && theme === "light"}
                  onClick={() => setTheme("light")}
                  icon={<Sun className="h-4 w-4 text-amber-500" />}
                  label={t("lightMode")}
                />
                <CompactCard
                  selected={mounted && theme === "dark"}
                  onClick={() => setTheme("dark")}
                  icon={<Moon className="h-4 w-4 text-indigo-400" />}
                  label={t("darkMode")}
                />
                <CompactCard
                  selected={mounted && (theme === "system" || !theme)}
                  onClick={() => setTheme("system")}
                  icon={<Monitor className="h-4 w-4 text-muted-foreground" />}
                  label={t("systemDefault")}
                />
              </div>
            </section>

            {/* NASA-Grade Astronomy Precision Badge */}
            <div className="p-4 rounded-3xl bg-secondary/30 dark:bg-secondary/15 border border-primary/20 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>{lang === "gu" ? "નાસા-ગ્રેડ જ્યોતિષ ગણતરી" : "NASA-Grade Astronomy Engine"}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {lang === "gu"
                  ? "શુભ સમય એપ લાહિરી (ચિત્રપક્ષ) અયનાંશ તથા વાસ્તવિક ગ્રહોની ભ્રમણકક્ષા પરથી ૧૦૦% ચોક્કસ સમયપત્રક પ્રસ્તુત કરે છે."
                  : "Shubh Samay computes precision Lahiri (Chitrapaksha) Ayanamsa directly from real-time celestial orbits with zero offline lag."}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dedicated City Selection Modal */}
      <CitySelectModal
        open={cityModalOpen}
        onOpenChange={setCityModalOpen}
        selectedCity={currentCity}
        onCitySelect={onCityChange}
      />
    </>
  );
}

function CompactCard({
  selected,
  onClick,
  label,
  sub,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={selected}
      className={cn(
        "cursor-pointer p-3.5 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all duration-200",
        selected
          ? "border-primary ring-2 ring-primary/40 bg-primary/15 text-primary shadow-xs scale-[1.02]"
          : "border-border/70 dark:border-white/10 bg-card/80 hover:bg-secondary/40 text-foreground"
      )}
    >
      {icon}
      <span className="text-xs font-extrabold leading-tight">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground opacity-80">{sub}</span>}
      {selected && <Check className="h-3.5 w-3.5 text-primary mt-0.5" />}
    </Card>
  );
}
