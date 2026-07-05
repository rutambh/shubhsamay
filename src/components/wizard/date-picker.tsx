"use client";

import { useLang } from "@/hooks/use-lang";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Clock, CalendarRange, CalendarDays, AlertCircle, Trash2 } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import type { TimeWindow } from "@/lib/events";
import { cn } from "@/lib/utils";

type DateMode = "individual" | "range";

interface Props {
  dates: Date[];
  onChange: (dates: Date[]) => void;
  timeWindow: TimeWindow | null;
  onTimeWindowChange: (tw: TimeWindow | null) => void;
}

// Generate time options every 30 minutes from 12 AM to 11:30 PM
function generateTimeOptions(): { value: string; label: string; decimal: number }[] {
  const opts: { value: string; label: string; decimal: number }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const period = h < 12 ? "AM" : "PM";
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayH}:${String(m).padStart(2, "0")} ${period}`;
      opts.push({ value, label, decimal: h + m / 60 });
    }
  }
  return opts;
}

const TIME_OPTIONS = generateTimeOptions();

function toTimeValue(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function DateRangePicker({
  dates,
  onChange,
  timeWindow,
  onTimeWindowChange,
}: Props) {
  const { lang, t } = useLang();
  const [mode, setMode] = useState<DateMode>("individual");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [showTime, setShowTime] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // === Individual mode handlers ===
  const addDate = (d: Date | undefined) => {
    if (!d) return;
    const normalized = new Date(d);
    normalized.setHours(12, 0, 0, 0);
    const exists = dates.some(
      (x) => x.toDateString() === normalized.toDateString()
    );
    if (!exists) {
      onChange([...dates, normalized].sort((a, b) => a.getTime() - b.getTime()));
    }
  };

  const removeDate = (idx: number) => {
    onChange(dates.filter((_, i) => i !== idx));
  };

  // === Range mode handlers ===
  const handleRangeSelect = (d: Date | undefined) => {
    if (!d) return;
    const normalized = new Date(d);
    normalized.setHours(12, 0, 0, 0);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Start new range
      setRangeStart(normalized);
      setRangeEnd(null);
      onChange([normalized]);
      return;
    }
    // We have a start, this is the end
    if (normalized < rangeStart) {
      // Swap if user picked earlier date
      setRangeStart(normalized);
      setRangeEnd(rangeStart);
      buildRange(normalized, rangeStart);
    } else {
      setRangeEnd(normalized);
      buildRange(rangeStart, normalized);
    }
  };

  const buildRange = (start: Date, end: Date) => {
    const span = differenceInCalendarDays(end, start);
    if (span > 30) {
      // Truncate to 30 days
      const cappedEnd = new Date(start);
      cappedEnd.setDate(cappedEnd.getDate() + 30);
      setRangeEnd(cappedEnd);
      fillRange(start, cappedEnd);
      return;
    }
    fillRange(start, end);
  };

  const fillRange = (start: Date, end: Date) => {
    const result: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const d = new Date(cur);
      d.setHours(12, 0, 0, 0);
      result.push(d);
      cur.setDate(cur.getDate() + 1);
    }
    onChange(result);
  };

  // === Time window handlers ===
  const applyTimeWindow = (startVal: string, endVal: string) => {
    const startDec =
      TIME_OPTIONS.find((o) => o.value === startVal)?.decimal ?? 6;
    const endDec = TIME_OPTIONS.find((o) => o.value === endVal)?.decimal ?? 21;
    if (endDec <= startDec) return;
    onTimeWindowChange({ startHour: startDec, endHour: endDec });
  };

  const rangeSpan =
    rangeStart && rangeEnd
      ? differenceInCalendarDays(rangeEnd, rangeStart) + 1
      : 0;
  const rangeTooLong = rangeSpan > 30;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-muted/60 rounded-lg">
        <button
          onClick={() => {
            setMode("individual");
            // Clear ALL state when switching tabs (previous tab's values)
            setRangeStart(null);
            setRangeEnd(null);
            onChange([]);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all",
            mode === "individual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          <CalendarDays className="h-4 w-4" />
          {t("modeIndividual")}
        </button>
        <button
          onClick={() => {
            setMode("range");
            // Clear ALL state when switching tabs (previous tab's values)
            setRangeStart(null);
            setRangeEnd(null);
            onChange([]);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all",
            mode === "range"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          <CalendarRange className="h-4 w-4" />
          {t("modeRange")}
        </button>
      </div>

      {/* Mode hint */}
      {mode === "individual" ? (
        <p className="text-xs text-muted-foreground text-center -mt-1">
          {dates.length === 0
            ? t("addDate")
            : lang === "gu"
            ? "વધુ તારીખો માટે કેલેન્ડર પર ટેપ કરો"
            : "Tap the calendar to add more dates"}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground text-center -mt-1">
          {lang === "gu"
            ? "શરૂ અને અંતની તારીખ પસંદ કરો (અધિકતમ ૩૦ દિવસ)"
            : "Pick start and end dates (max 30 days)"}
        </p>
      )}

      {/* Range too long warning */}
      {rangeTooLong && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t("rangeTooLong")} ({lang === "gu" ? "૩૦ માં સિમિત" : "capped to 30"})
        </div>
      )}

      {/* Calendar — always visible */}
      <Card className="p-3 border-primary/20 flex justify-center">
        <Calendar
          mode={mode === "individual" ? "single" : "range"}
          selected={
            mode === "individual"
              ? undefined
              : rangeStart && rangeEnd
              ? { from: rangeStart, to: rangeEnd }
              : rangeStart
              ? { from: rangeStart, to: undefined }
              : undefined
          }
          onSelect={(d) => {
            if (mode === "individual") {
              addDate(d as Date);
            } else {
              // For range mode, react-day-picker returns a Range
              const range = d as { from?: Date; to?: Date } | undefined;
              if (!range) return;
              if (range.from && range.to) {
                setRangeStart(range.from);
                setRangeEnd(range.to);
                buildRange(range.from, range.to);
              } else if (range.from) {
                setRangeStart(range.from);
                setRangeEnd(null);
                onChange([range.from]);
              }
            }
          }}
          disabled={(d) => d < today}
          numberOfMonths={1}
          initialFocus
          className="mx-auto"
          // Show today as outline circle only when no dates selected.
          // Once a date is selected, remove today circle entirely.
          modifiers={{
            today: dates.length === 0 ? undefined : [],
          }}
          modifiersClassNames={{
            today: "rdp-today-circle",
          }}
        />
      </Card>

      {/* Clear button — Range mode only, icon only */}
      {mode === "range" && dates.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              onChange([]);
              setRangeStart(null);
              setRangeEnd(null);
            }}
            variant="ghost"
            size="icon"
            aria-label={lang === "gu" ? "સાફ કરો" : "Clear"}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Selected dates chips */}
      {dates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mode === "individual" ? (
            dates.map((d, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="gap-1.5 py-1.5 px-3 bg-accent/40 text-accent-foreground text-sm"
              >
                {format(d, "EEE, d MMM yyyy")}
                <button
                  onClick={() => removeDate(i)}
                  aria-label={t("remove")}
                  className="ml-1 rounded-full hover:bg-background/60 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <Badge
              variant="secondary"
              className="gap-1.5 py-1.5 px-3 bg-accent/40 text-accent-foreground text-sm"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              {rangeStart && rangeEnd
                ? `${format(rangeStart, "d MMM")} – ${format(rangeEnd, "d MMM yyyy")} (${rangeSpan} days)`
                : rangeStart
                ? `${format(rangeStart, "d MMM yyyy")} (pick end date)`
                : ""}
            </Badge>
          )}
        </div>
      )}

      {/* Time window controls */}
      {showTime && timeWindow ? (
        <Card className="p-4 border-primary/20 space-y-3 bg-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {t("timeOptional")}
              </span>
            </div>
            <button
              onClick={() => {
                setShowTime(false);
                onTimeWindowChange(null);
              }}
              aria-label={t("removeTime")}
              className="h-7 w-7 shrink-0 rounded-full hover:bg-destructive/10 text-destructive flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("timeFrom")}
              </label>
              <Select
                value={toTimeValue(timeWindow.startHour)}
                onValueChange={(v) =>
                  applyTimeWindow(v, toTimeValue(timeWindow.endHour))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIME_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("timeTo")}
              </label>
              <Select
                value={toTimeValue(timeWindow.endHour)}
                onValueChange={(v) =>
                  applyTimeWindow(toTimeValue(timeWindow.startHour), v)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIME_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => {
            setShowTime(true);
            onTimeWindowChange({ startHour: 6, endHour: 21 });
          }}
          variant="outline"
          className="w-full gap-2 border-dashed border-primary/40"
          size="sm"
        >
          <Clock className="h-4 w-4" />
          {t("addTime")}
        </Button>
      )}
    </div>
  );
}
