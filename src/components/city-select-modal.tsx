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
import { MapPin, Search, Check, X, Globe2, Sparkles } from "lucide-react";
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
    { key: "gujarat", label_en: "Gujarat (33 Districts)", label_gu: "ગુજરાત (૩૩ જિલ્લા)" },
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

    // Category Filter
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

    // Query Search
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name_en.toLowerCase().includes(q) ||
        c.name_gu.includes(query.trim()) ||
        c.state.toLowerCase().includes(q) ||
        (c.tz && c.tz.toLowerCase().includes(q))
    );
  }, [query, activeCategory]);

  const handleSelect = (c: CityDef) => {
    onCitySelect(c);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border border-primary/30 rounded-3xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] bg-card/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60 dark:border-white/10 shrink-0 bg-background/80 backdrop-blur-md">
          <DialogTitle className="flex items-center gap-2.5 text-foreground text-base sm:text-lg font-extrabold tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Globe2 className="h-4 w-4" />
            </div>
            <span>{t("selectCity")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "gu"
              ? "ગુજરાતના તમામ ૩૩ જિલ્લાઓ તથા વૈશ્વિક શહેરોમાંથી સ્થાન પસંદ કરો"
              : "Choose from all 33 Gujarat districts and major global cities worldwide"}
          </DialogDescription>

          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "gu" ? "શહેર કે જિલ્લો શોધો (અમદાવાદ, સુરત, લંડન)..." : "Search city, district, country..."}
              className="pl-10 pr-9 h-10 text-xs sm:text-sm bg-secondary/35 dark:bg-secondary/20 border-primary/25 rounded-2xl focus-visible:ring-primary shadow-xs text-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto fancy-scroll pt-2.5 pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border",
                  activeCategory === cat.key
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-secondary/35 text-muted-foreground border-border/50 hover:text-foreground dark:bg-secondary/20 dark:border-white/10"
                )}
              >
                {lang === "gu" ? cat.label_gu : cat.label_en}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* City list */}
        <div className="p-3 sm:p-4 overflow-y-auto fancy-scroll space-y-1.5 flex-1 max-h-[50vh]">
          {filteredCities.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-muted-foreground">
                {lang === "gu" ? "કોઈ શહેર મળ્યું નથી" : "No matching cities found"}
              </p>
            </div>
          ) : (
            filteredCities.map((c, i) => {
              const isSelected =
                selectedCity &&
                selectedCity.name_en === c.name_en &&
                selectedCity.state === c.state;

              return (
                <button
                  key={`${c.name_en}-${c.state}-${i}`}
                  onClick={() => handleSelect(c)}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary/15 border-primary text-primary font-bold shadow-xs scale-[1.01]"
                      : "bg-card/75 dark:bg-card/50 border-border/60 dark:border-white/10 hover:bg-secondary/40 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-muted-foreground"
                      )}
                    >
                      {c.name_en.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs sm:text-sm text-foreground truncate">
                        {lang === "gu" ? c.name_gu : c.name_en}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {c.state} • {c.tz || "Asia/Kolkata"}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-primary shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
