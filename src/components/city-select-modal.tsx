"use client";

import { useLang } from "@/hooks/use-lang";
import { CITIES, type CityDef } from "@/lib/events";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Check, X, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

interface CitySelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCity: CityDef | null;
  onCitySelect: (city: CityDef) => void;
}

type CategoryKey = "all" | "gujarat" | "india" | "usa" | "uk" | "canada" | "australia" | "uae" | "world";

export function CitySelectModal({
  open,
  onOpenChange,
  selectedCity,
  onCitySelect,
}: CitySelectModalProps) {
  const { lang, t } = useLang();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");

  const categories: { key: CategoryKey; label_en: string; label_gu: string }[] = [
    { key: "all", label_en: "All", label_gu: "બધા" },
    { key: "gujarat", label_en: "Gujarat (33)", label_gu: "ગુજરાત (૩૩)" },
    { key: "india", label_en: "India", label_gu: "ભારત" },
    { key: "usa", label_en: "USA", label_gu: "યુએસએ" },
    { key: "uk", label_en: "UK", label_gu: "યુકે" },
    { key: "canada", label_en: "Canada", label_gu: "કેનેડા" },
    { key: "australia", label_en: "Australia", label_gu: "ઓસ્ટ્રેલિયા" },
    { key: "uae", label_en: "UAE / Gulf", label_gu: "યુએઈ / ગલ્ફ" },
    { key: "world", label_en: "Global", label_gu: "વિશ્વ" },
  ];

  const filteredCities = useMemo(() => {
    let list = CITIES;
    const q = query.toLowerCase().trim();

    // 1. Category Filter
    if (activeCategory !== "all") {
      if (activeCategory === "gujarat") {
        list = list.filter((c) => c.state === "Gujarat");
      } else if (activeCategory === "india") {
        list = list.filter((c) => c.state !== "Gujarat" && c.tz === "Asia/Kolkata");
      } else if (activeCategory === "usa") {
        list = list.filter((c) => c.state === "USA");
      } else if (activeCategory === "uk") {
        list = list.filter((c) => c.state === "UK");
      } else if (activeCategory === "canada") {
        list = list.filter((c) => c.state === "Canada");
      } else if (activeCategory === "australia") {
        list = list.filter((c) => c.state === "Australia");
      } else if (activeCategory === "uae") {
        list = list.filter((c) => c.state === "UAE" || c.state === "Saudi Arabia" || c.state === "Qatar");
      } else if (activeCategory === "world") {
        list = list.filter(
          (c) =>
            c.state === "France" ||
            c.state === "Germany" ||
            c.state === "Netherlands" ||
            c.state === "Switzerland" ||
            c.state === "Singapore" ||
            c.state === "Japan" ||
            c.state === "Thailand" ||
            c.state === "Malaysia" ||
            c.state === "Hong Kong" ||
            c.state === "New Zealand"
        );
      }
    }

    // 2. Query Search
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name_en.toLowerCase().includes(q) ||
        c.name_gu.includes(query.trim()) ||
        c.state.toLowerCase().includes(q) ||
        (c.tz && c.tz.toLowerCase().includes(q))
    );
  }, [query, activeCategory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border-primary/25 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60 shrink-0 bg-background">
          <DialogTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
            <Globe2 className="h-5 w-5 text-primary shrink-0" />
            {t("selectCity")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "gu"
              ? "ગુજરાતના તમામ જિલ્લાઓ તથા દેશ-વિદેશના મુખ્ય શહેરોમાંથી પસંદ કરો"
              : "Choose from all 33 Gujarat districts and major global cities worldwide"}
          </DialogDescription>

          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "gu" ? "શહેર કે જિલ્લો શોધો..." : "Search city, district, country..."}
              className="pl-9 pr-8 h-10 text-sm bg-muted/40 border-primary/20 focus-visible:ring-primary"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto fancy-scroll pt-2.5 pb-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                  activeCategory === cat.key
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {lang === "gu" ? cat.label_gu : cat.label_en}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Scrollable list of cities */}
        <div
          tabIndex={0}
          className="flex-1 overflow-y-auto overscroll-contain fancy-scroll p-2 sm:p-3 space-y-1 touch-pan-y focus:outline-hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {filteredCities.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <MapPin className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-medium">
                {lang === "gu" ? "કોઈ શહેર મળ્યું નથી" : "No cities found"}
              </p>
              <p className="text-xs">
                {lang === "gu" ? "અન્ય નામથી શોધો" : "Try a different search term"}
              </p>
            </div>
          ) : (
            filteredCities.map((c) => {
              const isSelected = selectedCity?.name_en === c.name_en && selectedCity?.state === c.state;
              return (
                <button
                  key={`${c.name_en}-${c.state}-${c.lat}`}
                  onClick={() => {
                    onCitySelect(c);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "w-full text-left p-2.5 sm:p-3 rounded-lg flex items-center justify-between gap-3 transition-all border",
                    isSelected
                      ? "bg-primary/10 border-primary/40 text-foreground font-semibold shadow-2xs"
                      : "bg-card/60 hover:bg-muted/60 border-border/50 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={cn(
                        "p-2 rounded-full shrink-0",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-bold truncate">
                          {lang === "gu" ? c.name_gu : c.name_en}
                        </p>
                        {lang !== "gu" && (
                          <span className="text-xs text-muted-foreground/80 font-normal truncate hidden xs:inline">
                            {c.name_gu}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate pt-0.5">
                        {c.state} • {c.tz || "Asia/Kolkata"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {c.state === "Gujarat" && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-primary/10 text-primary border-primary/20 font-medium px-2 py-0.5"
                      >
                        Gujarat
                      </Badge>
                    )}
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-2xs">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-border/60 bg-muted/30 text-center text-xs text-muted-foreground shrink-0">
          <span>
            {lang === "gu"
              ? `કુલ ${filteredCities.length} શહેરો ઉપલબ્ધ છે`
              : `Showing ${filteredCities.length} cities`}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
