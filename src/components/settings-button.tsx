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

  // Avoid hydration mismatch: only show theme after mount
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
      (err) => {
        setLoadingGps(false);
        setGpsError(t("locationDenied"));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("settings")}
            className="rounded-full border-primary/20 bg-background/80 backdrop-blur hover:bg-accent/40 h-10 w-10"
          >
            <Settings className="h-4 w-4 text-primary" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5 text-primary" />
              {t("settings")}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {lang === "gu" ? "તમારી પસંદગીઓ સંચાલિત કરો" : "Manage your preferences"}
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-6 overflow-y-auto flex-1 fancy-scroll">
            {/* Location Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">
                  {t("locationSetting")}
                </h3>
              </div>

              <Card className="p-3.5 border-primary/20 space-y-3 bg-card/80">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {currentLabel}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentCity.state}
                      </p>
                    </div>
                  </div>

                  {/* Manual City Selector Modal Trigger */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCityModalOpen(true)}
                    className="h-8 gap-1 text-xs"
                  >
                    <span>{t("selectCity")}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Sync Location Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSyncLocation}
                  disabled={loadingGps}
                  className="w-full h-9 gap-2 text-xs font-medium border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                >
                  {loadingGps ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Navigation className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span>{loadingGps ? t("locating") : t("syncLocation")}</span>
                </Button>

                {gpsError && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{gpsError}</span>
                  </p>
                )}
              </Card>
            </section>

          {/* Language */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Languages className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                {t("languageSetting")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CompactCard
                selected={lang === "en"}
                onClick={() => setLang("en")}
                label="English"
              />
              <CompactCard
                selected={lang === "gu"}
                onClick={() => setLang("gu")}
                label="ગુજરાતી"
              />
            </div>
          </section>

          {/* Theme */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sun className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                {t("themeSetting")}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <CompactCard
                selected={mounted && theme === "light"}
                onClick={() => setTheme("light")}
                icon={<Sun className="h-3.5 w-3.5 text-amber-500" />}
                label={t("lightMode")}
              />
              <CompactCard
                selected={mounted && theme === "dark"}
                onClick={() => setTheme("dark")}
                icon={<Moon className="h-3.5 w-3.5 text-indigo-300" />}
                label={t("darkMode")}
              />
              <CompactCard
                selected={mounted && (theme === "system" || !theme)}
                onClick={() => setTheme("system")}
                icon={<Monitor className="h-3.5 w-3.5 text-muted-foreground" />}
                label={t("systemDefault")}
              />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>

    {/* Dedicated City Selection Modal with smooth scrolling */}
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
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
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
        "cursor-pointer p-2.5 flex items-center justify-center gap-1.5 transition-all",
        selected
          ? "border-primary ring-1 ring-primary/30 bg-accent/40"
          : "border-border bg-card/80 hover:bg-muted/40"
      )}
    >
      {icon}
      <span className="text-xs font-medium text-foreground">{label}</span>
      {selected && <Check className="h-3 w-3 text-primary" />}
    </Card>
  );
}
