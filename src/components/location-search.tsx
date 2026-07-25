"use client";

import { useLang } from "@/hooks/use-lang";
import { CITIES, findNearestCity, type CityDef } from "@/lib/events";
import { getSystemTimezone, getCityNameFromTimezone } from "@/lib/time-utils";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: CityDef | null;
  onChange: (c: CityDef) => void;
  onGpsError?: () => void;
  className?: string;
}

const DEFAULT_CITY: CityDef = CITIES[0]; // Ahmedabad

export function LocationSearch({ value, onChange, onGpsError, className }: Props) {
  const { lang, t } = useLang();
  const [loadingGps, setLoadingGps] = useState(false);

  // Default to Ahmedabad if nothing selected
  useEffect(() => {
    if (!value) onChange(DEFAULT_CITY);
  }, [value, onChange]);

  const current = value || DEFAULT_CITY;
  const currentLabel = lang === "gu" ? current.name_gu : current.name_en;

  // Detect system timezone mismatch
  const systemTz = getSystemTimezone();
  const targetTz = current.tz || "Asia/Kolkata";
  const isTzMismatched = systemTz !== targetTz;

  const handleQuickSync = () => {
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
            // Keep initial fallback
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
    <Button
      variant="outline"
      onClick={handleQuickSync}
      disabled={loadingGps}
      aria-label={lang === "gu" ? "જીપીએસ સ્થાન ઓટો ફેચ કરો" : "Auto fetch GPS location"}
      className={cn(
        "gap-1.5 rounded-full border-primary/20 bg-background/80 backdrop-blur hover:bg-accent/40 h-9 px-2.5 sm:px-3 transition-all shrink-0 max-w-[140px] xs:max-w-[160px] sm:max-w-[200px]",
        className
      )}
    >
      {loadingGps ? (
        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
      ) : (
        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
      )}
      <span className="text-xs font-semibold text-foreground truncate max-w-[70px] xs:max-w-[90px] sm:max-w-[130px]">
        {currentLabel}
      </span>
      {isTzMismatched && (
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" title={t("tzMismatch", lang)} />
      )}
    </Button>
  );
}
