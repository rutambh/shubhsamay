"use client";

import { useLang } from "@/hooks/use-lang";
import { EVENTS, type EventId } from "@/lib/events";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  value?: EventId | null;
  onChange?: (id: EventId) => void;
  onSelect?: (id: EventId) => void;
}

export function EventPicker({ value, onChange, onSelect }: Props) {
  const { lang } = useLang();

  const handleSelect = (id: EventId) => {
    onChange?.(id);
    onSelect?.(id);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {EVENTS.map((ev) => {
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
              "cursor-pointer p-3 sm:p-4 transition-all hover:shadow-md hover:-translate-y-0.5",
              "flex flex-col items-center text-center justify-center gap-1.5 min-h-[96px]",
              isOthers
                ? "border-dashed border-2 border-primary/40 bg-accent/10"
                : "border-border bg-card/80",
              selected &&
                !isOthers &&
                "border-primary ring-2 ring-primary/30 bg-accent/40"
            )}
          >
            <span className="text-3xl" aria-hidden>
              {ev.emoji}
            </span>
            <span className="font-semibold text-sm leading-tight text-foreground">
              {lang === "gu" ? ev.name_gu : ev.name_en}
            </span>
          </Card>
        );
      })}
    </div>
  );
}
