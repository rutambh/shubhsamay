"use client";

import { useLang } from "@/hooks/use-lang";
import { CITIES, type CityDef } from "@/lib/events";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Check } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: CityDef | null;
  onChange: (c: CityDef) => void;
}

const DEFAULT_CITY: CityDef = CITIES[0]; // Ahmedabad

export function LocationSearch({ value, onChange }: Props) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Default to Ahmedabad if nothing selected (runs once on mount)
  useEffect(() => {
    if (!value) onChange(DEFAULT_CITY);
  }, []);

  const current = value || DEFAULT_CITY;
  const currentLabel = lang === "gu" ? current.name_gu : current.name_en;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return CITIES;
    return CITIES.filter(
      (c) =>
        c.name_en.toLowerCase().includes(q) ||
        c.name_gu.includes(query.trim()) ||
        c.state.toLowerCase().includes(q)
    );
  }, [query]);

  // Sort: Gujarat first when no query
  const sorted = useMemo(() => {
    if (query) return filtered;
    return [...filtered].sort((a, b) => {
      const aG = a.state === "Gujarat" ? 0 : 1;
      const bG = b.state === "Gujarat" ? 0 : 1;
      if (aG !== bG) return aG - bG;
      return a.name_en.localeCompare(b.name_en);
    });
  }, [filtered, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-full border-primary/20 bg-background/80 backdrop-blur hover:bg-accent/40 h-10 px-3"
        >
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground">
            {currentLabel}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(92vw,360px)] p-0"
        align="end"
        sideOffset={8}
      >
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
        <div className="max-h-72 overflow-y-auto fancy-scroll p-1">
          {sorted.map((c) => {
            const selected = current.name_en === c.name_en;
            return (
              <button
                key={`${c.name_en}-${c.state}`}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
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
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {lang === "gu" ? "કોઈ શહેર મળ્યું નથી" : "No city found"}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
