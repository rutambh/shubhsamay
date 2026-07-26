"use client";

import { useLang } from "@/hooks/use-lang";
import {
  METHODS,
  EVENTS,
  resolveAutoMethods,
  type MethodId,
  type EventId,
} from "@/lib/events";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface Props {
  eventId: EventId | null;
  value?: MethodId[];
  selected?: MethodId[];
  onChange?: (methods: MethodId[]) => void;
}

export function MethodPicker({ eventId, value, selected, onChange }: Props) {
  const { lang } = useLang();
  const currentMethods = value ?? selected ?? [];
  const autoMethods = eventId ? resolveAutoMethods(eventId) : [];

  const toggle = (id: MethodId) => {
    if (!onChange) return;
    // "auto" and "all" are meta-methods that replace other selections
    if (id === "auto" || id === "all") {
      if (currentMethods.includes(id)) {
        onChange([]);
      } else {
        onChange([id]);
      }
      return;
    }
    // For concrete methods: remove "auto"/"all" if present, toggle this one
    const withoutMeta = currentMethods.filter((m) => m !== "auto" && m !== "all");
    if (withoutMeta.includes(id)) {
      onChange(withoutMeta.filter((m) => m !== id));
    } else {
      onChange([...withoutMeta, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {METHODS.map((m) => {
          const isSelected = currentMethods.includes(m.id);
          // For "auto", show which methods it combines (inside the tile)
          let combinedLabel: string | null = null;
          if (m.id === "auto" && autoMethods.length > 0) {
            combinedLabel = autoMethods
              .map((am) => {
                const def = METHODS.find((x) => x.id === am);
                return def ? (lang === "gu" ? def.name_gu : def.name_en) : am;
              })
              .join(" + ");
          }

          return (
            <Card
              key={m.id}
              role="button"
              tabIndex={0}
              onClick={() => toggle(m.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(m.id);
                }
              }}
              aria-pressed={isSelected}
              className={cn(
                "cursor-pointer p-3 transition-all text-center flex flex-col items-center justify-center gap-1",
                "min-h-[88px]",
                isSelected
                  ? "border-primary ring-2 ring-primary/30 bg-accent/40"
                  : "border-border bg-card/80 hover:bg-muted/40"
              )}
            >
              {/* Method name — center aligned */}
              <div className="flex items-center justify-center gap-1.5">
                {m.id === "auto" && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                <span className="font-semibold text-sm text-foreground text-center">
                  {lang === "gu" ? m.name_gu : m.name_en}
                </span>
              </div>

              {/* Description — center aligned, compact */}
              <p className="text-[11px] text-muted-foreground text-center leading-tight">
                {lang === "gu" ? m.description_gu : m.description_en}
              </p>

              {/* For Auto: show combined methods inside the tile (center aligned) */}
              {combinedLabel && (
                <p className="text-[10px] text-primary font-medium text-center leading-tight mt-0.5">
                  {combinedLabel}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-1">
        {lang === "gu"
          ? currentMethods.length === 0
            ? "ઓછામાં ઓછી એક પદ્ધતિ પસંદ કરો"
            : `${currentMethods.length} પદ્ધતિ${currentMethods.length > 1 ? "ઓ" : ""} પસંદ થયેલી છે`
          : currentMethods.length === 0
          ? "Select at least one method to continue"
          : `${currentMethods.length} method${currentMethods.length > 1 ? "s" : ""} selected`}
      </p>
    </div>
  );
}
