"use client";

import { useLang } from "@/hooks/use-lang";
import { EVENTS, type EventId } from "@/lib/events";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  Search,
  X,
  Sparkles,
  Heart,
  Landmark,
  Calendar as CalendarIcon,
  HelpCircle,
} from "lucide-react";

interface Props {
  onSelectEvent: (eventId: EventId) => void;
}

type CategoryKey = "all" | "milestones" | "wealth" | "daily" | "others";

const CATEGORY_MAP: Record<CategoryKey, EventId[]> = {
  all: EVENTS.map((e) => e.id),
  milestones: ["marriage", "housewarming", "naming-ceremony", "pooja-havan"],
  wealth: [
    "vehicle-purchase",
    "gold-jewelry",
    "business-start",
    "buying-property",
    "opening-account",
    "agreement-signing",
  ],
  daily: [
    "travel",
    "joining-job",
    "education-start",
    "filing-case",
    "cooking-first-roti",
    "planting-tree",
    "shaving-haircut",
    "surgery-medical",
  ],
  others: ["others"],
};

export function OccasionStudio({ onSelectEvent }: Props) {
  const { lang } = useLang();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: { id: CategoryKey; label_en: string; label_gu: string; icon: React.ReactNode }[] = [
    { id: "all", label_en: "All", label_gu: "બધા", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "milestones", label_en: "Milestones", label_gu: "મુખ્ય મુહૂર્ત", icon: <Heart className="w-3.5 h-3.5" /> },
    { id: "wealth", label_en: "Wealth & Assets", label_gu: "સંપત્તિ", icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: "daily", label_en: "Daily & Life", label_gu: "દૈનિક", icon: <CalendarIcon className="w-3.5 h-3.5" /> },
    { id: "others", label_en: "Custom", label_gu: "અન્ય", icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  const filteredEvents = useMemo(() => {
    let list = EVENTS;
    if (activeCategory !== "all") {
      const allowed = new Set(CATEGORY_MAP[activeCategory]);
      list = list.filter((e) => allowed.has(e.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.name_en.toLowerCase().includes(q) ||
          e.name_gu.includes(q) ||
          e.description_en.toLowerCase().includes(q) ||
          e.description_gu.includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-3.5 fade-up">
      {/* Header & Search */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "gu"
                ? "પ્રસંગ શોધો (લગ્ન, વાહન ખરીદી, ઘર પ્રવેશ, સોનું)..."
                : "Search occasion (Marriage, Buy Vehicle, Housewarming)..."
            }
            className="w-full pl-10 pr-9 py-2.5 bg-card/90 dark:bg-card/75 border border-primary/25 rounded-2xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 fancy-scroll">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-secondary/35 text-muted-foreground border-border/50 hover:bg-secondary/70 hover:text-foreground dark:bg-secondary/20 dark:border-white/10"
                )}
              >
                {cat.icon}
                <span>{lang === "gu" ? cat.label_gu : cat.label_en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Occasion Cards Grid with Native Touch-Optimized Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {filteredEvents.map((ev) => (
          <button
            type="button"
            key={ev.id}
            onClick={() => onSelectEvent(ev.id)}
            className={cn(
              "group cursor-pointer p-3.5 transition-all duration-200 rounded-3xl text-center",
              "flex flex-col items-center justify-between gap-2.5 min-h-[120px] relative overflow-hidden",
              "hover:-translate-y-1 hover:shadow-xl active:scale-[0.97]",
              "border border-border/70 dark:border-primary/20 bg-card/90 dark:bg-card/75 backdrop-blur-xl hover:border-primary",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            {ev.isMajor && (
              <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-primary/15 border border-primary/30 text-[9px] font-extrabold text-primary uppercase tracking-tighter pointer-events-none">
                {lang === "gu" ? "મુખ્ય" : "Major"}
              </span>
            )}

            <div className="w-12 h-12 rounded-2xl bg-secondary/40 dark:bg-secondary/30 border border-primary/20 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform shadow-2xs pointer-events-none">
              <span aria-hidden>{ev.emoji}</span>
            </div>

            <div className="space-y-0.5 w-full pointer-events-none">
              <p className="font-extrabold text-xs sm:text-sm text-foreground leading-tight line-clamp-1">
                {lang === "gu" ? ev.name_gu : ev.name_en}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
                {lang === "gu" ? ev.name_en : ev.description_en}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
