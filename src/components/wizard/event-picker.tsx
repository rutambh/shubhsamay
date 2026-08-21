"use client";

import { useLang } from "@/hooks/use-lang";
import { EVENTS, type EventId, type EventDef } from "@/lib/events";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Search, X, Sparkles, Heart, Landmark, Calendar, HelpCircle } from "lucide-react";

interface Props {
  value?: EventId | null;
  onChange?: (id: EventId) => void;
  onSelect?: (id: EventId) => void;
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

export function EventPicker({ value, onChange, onSelect }: Props) {
  const { lang } = useLang();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (id: EventId) => {
    onChange?.(id);
    onSelect?.(id);
  };

  const categories: { id: CategoryKey; label_en: string; label_gu: string; icon: React.ReactNode }[] = [
    { id: "all", label_en: "All", label_gu: "બધા", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "milestones", label_en: "Milestones", label_gu: "મુખ્ય મુહૂર્ત", icon: <Heart className="w-3.5 h-3.5" /> },
    { id: "wealth", label_en: "Wealth & Assets", label_gu: "સંપત્તિ", icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: "daily", label_en: "Daily & Life", label_gu: "દૈનિક", icon: <Calendar className="w-3.5 h-3.5" /> },
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
    <div className="space-y-3.5">
      {/* Search and Category Filter Toolbar */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "gu"
                ? "પ્રસંગ અથવા કાર્ય શોધો (દા.ત. લગ્ન, ઘર પ્રવેશ, વાહન)..."
                : "Search occasion or event (e.g. Marriage, Vehicle, Job)..."
            }
            className="w-full pl-9 pr-9 py-2 bg-secondary/35 dark:bg-secondary/20 border border-border/60 dark:border-white/10 rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 fancy-scroll">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 border",
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

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">
            {lang === "gu" ? "કોઈ પ્રસંગ મળ્યો નથી" : "No matching occasions found"}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="text-xs text-primary font-medium underline underline-offset-4"
          >
            {lang === "gu" ? "બધા પ્રસંગો જુઓ" : "View all occasions"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {filteredEvents.map((ev) => {
            const selected = value === ev.id;
            const isOthers = ev.id === "others";

            return (
              <Card
                key={ev.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(ev.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(ev.id);
                  }
                }}
                aria-pressed={selected}
                className={cn(
                  "group cursor-pointer p-3 sm:p-3.5 transition-all duration-200 rounded-2xl",
                  "flex flex-col items-center text-center justify-between gap-2 min-h-[108px] sm:min-h-[118px] relative overflow-hidden",
                  "hover:-translate-y-1 hover:shadow-md active:scale-[0.98]",
                  isOthers
                    ? "border-dashed border-2 border-primary/40 bg-accent/10 hover:border-primary"
                    : "border-border/70 dark:border-white/10 bg-card/85 dark:bg-card/60 backdrop-blur-xs hover:border-primary/50 hover:bg-card",
                  selected &&
                    !isOthers &&
                    "border-primary ring-2 ring-primary/40 bg-accent/25 dark:bg-primary/15 shadow-sm"
                )}
              >
                {/* Major badge if applicable */}
                {ev.isMajor && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-tighter">
                    {lang === "gu" ? "મુખ્ય" : "Major"}
                  </span>
                )}

                {/* Emoji Icon Container */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-secondary/40 dark:bg-secondary/30 border border-border/40 dark:border-white/10 flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition-transform shadow-2xs">
                  <span aria-hidden>{ev.emoji}</span>
                </div>

                {/* Event Name & Subtitle */}
                <div className="space-y-0.5 w-full">
                  <p className="font-bold text-xs sm:text-sm text-foreground leading-tight line-clamp-1">
                    {lang === "gu" ? ev.name_gu : ev.name_en}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 leading-tight line-clamp-1">
                    {lang === "gu" ? ev.name_en : ev.description_en}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
