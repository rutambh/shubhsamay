"use client";

import { useLang } from "@/hooks/use-lang";
import { useTheme } from "next-themes";
import { CITIES, findNearestCity, type CityDef } from "@/lib/events";
import { getSystemTimezone, getCityNameFromTimezone } from "@/lib/time-utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

interface SettingsButtonProps {
  city: CityDef | null;
  onCityChange: (c: CityDef) => void;
}

const DEFAULT_CITY: CityDef = CITIES[0]; // Ahmedabad

export function SettingsButton({ city, onCityChange }: SettingsButtonProps) {
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Avoid hydration mismatch: only show theme after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const filteredCities = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return CITIES;
    return CITIES.filter(
      (c) =>
        c.name_en.toLowerCase().includes(q) ||
        c.name_gu.includes(query.trim()) ||
        c.state.toLowerCase().includes(q)
    );
  }, [query]);

  const sortedCities = useMemo(() => {
    if (query) return filteredCities;
    return [...filteredCities].sort((a, b) => {
      const aG = a.state === "Gujarat" ? 0 : 1;
      const bG = b.state === "Gujarat" ? 0 : 1;
      if (aG !== bG) return aG - bG;
      return a.name_en.localeCompare(b.name_en);
    });
  }, [filteredCities, query]);

  return (
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

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
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

                {/* Popover Manual City Search */}
                <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      <span>{t("selectCity")}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(90vw,340px)] p-0" align="end">
                    <div className="p-2 border-b border-border/60">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          autoFocus
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={lang === "gu" ? "શહેર શોધો..." : "Search city..."}
                          className="pl-9 h-9"
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto fancy-scroll p-1">
                      {sortedCities.map((c) => {
                        const selected = currentCity.name_en === c.name_en;
                        return (
                          <button
                            key={`${c.name_en}-${c.state}`}
                            onClick={() => {
                              onCityChange(c);
                              setCityPopoverOpen(false);
                              setQuery("");
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-md flex items-center justify-between gap-2 transition-colors",
                              selected ? "bg-accent/40" : "hover:bg-muted/60"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {lang === "gu" ? c.name_gu : c.name_en}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {c.state}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {c.state === "Gujarat" && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-primary/30 text-primary"
                                >
                                  Gujarat
                                </Badge>
                              )}
                              {selected && <Check className="h-4 w-4 text-primary" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
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
