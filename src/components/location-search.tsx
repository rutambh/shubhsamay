"use client";

import { useLang } from "@/hooks/use-lang";
import { CITIES, findNearestCity, type CityDef } from "@/lib/events";
import { getSystemTimezone, getCityNameFromTimezone } from "@/lib/time-utils";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Navigation, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CitySelectModal } from "@/components/city-select-modal";

interface Props {
  value: CityDef | null;
  onChange: (c: CityDef) => void;
  onGpsError?: () => void;
  className?: string;
}

const DEFAULT_CITY: CityDef = CITIES[0]; // Ahmedabad

export function LocationSearch({ value, onChange, onGpsError, className }: Props) {
  const { lang, t } = useLang();
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  // Default to Ahmedabad if nothing selected
  useEffect(() => {
    if (!value) onChange(DEFAULT_CITY);
  }, [value, onChange]);

  const current = value || DEFAULT_CITY;
  const currentLabel = lang === "gu" ? current.name_gu : current.name_en;

  const handleQuickSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      if (onGpsError) onGpsError();
      return;
    }

    setLoadingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestCity(latitude, longitude, 50);

        if (nearest) {
          onChange(nearest);
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
          onChange(initialCity);
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
              onChange({
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
        if (onGpsError) onGpsError();
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* City Capsule Button — Opens City Selector Modal */}
        <button
          onClick={() => setCityModalOpen(true)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-primary/30 bg-card/85 dark:bg-card/70 backdrop-blur-xl hover:border-primary text-foreground text-xs font-extrabold cursor-pointer transition-all shadow-2xs max-w-[130px] sm:max-w-[160px] truncate",
            className
          )}
          title={lang === "gu" ? `શહેર પસંદ કરો: ${currentLabel}` : `Select City: ${currentLabel}`}
        >
          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{currentLabel}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0 opacity-70" />
        </button>

        {/* Quick GPS Locate Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleQuickSync}
          disabled={loadingGps}
          aria-label={lang === "gu" ? "જીપીએસ સ્થાન શોધો" : "Sync GPS Location"}
          title={lang === "gu" ? "જીપીએસ સ્થાન શોધો" : "Sync GPS Location"}
          className="rounded-full border-primary/25 bg-card/80 backdrop-blur hover:bg-primary/20 h-8 w-8 text-primary cursor-pointer transition-all shrink-0"
        >
          {loadingGps ? (
            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
          ) : (
            <Navigation className="h-3.5 w-3.5 text-primary" />
          )}
        </Button>
      </div>

      <CitySelectModal
        open={cityModalOpen}
        onOpenChange={setCityModalOpen}
        selectedCity={current}
        onCitySelect={onChange}
      />
    </>
  );
}
