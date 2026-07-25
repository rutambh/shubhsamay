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
import { X, Clock, CalendarRange, CalendarDays, AlertCircle, Trash2, Check } from "lucide-react";
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
  const [pendingDate, setPendingDate] = useState<Date | undefined>(undefined);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // === Individual mode handlers ===
  const removeDate = (idx: number) => {
    onChange(dates.filter((_, i) => i !== idx));
  };

  const confirmAddDate = () => {
    if (!pendingDate) return;
    const normalized = new Date(pendingDate);
    normalized.setHours(12, 0, 0, 0);
    const exists = dates.some(
      (x) => x.toDateString() === normalized.toDateString()
    );
    if (!exists) {
      onChange([...dates, normalized].sort((a, b) => a.getTime() - b.getTime()));
    }
    setPendingDate(undefined);
  };

  // === Range mode handlers ===
  const confirmRange = () => {
    if (!rangeStart || !rangeEnd) return;
    const start = rangeStart < rangeEnd ? rangeStart : rangeEnd;
    const end = rangeStart < rangeEnd ? rangeEnd : rangeStart;
    const normalizedStart = new Date(start);
    const normalizedEnd = new Date(end);
    normalizedStart.setHours(12, 0, 0, 0);
    normalizedEnd.setHours(12, 0, 0, 0);

    const rangeDates: Date[] = [];
    const cur = new Date(normalizedStart);
    while (cur <= normalizedEnd) {
      rangeDates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    onChange(rangeDates.slice(0, 30));
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
      ? differenceInCalendarDays(
          rangeStart < rangeEnd ? rangeEnd : rangeStart,
          rangeStart < rangeEnd ? rangeStart : rangeEnd
        ) + 1
      : 0;
  const rangeTooLong = rangeSpan > 30;

  const now = new Date();
  const includesToday = dates.some((d) => d.toDateString() === now.toDateString());
  const currentDecimalHour = includesToday
    ? now.getHours() + Math.ceil(now.getMinutes() / 30) * 0.5
    : 0;

  const validFromOptions = TIME_OPTIONS.filter((o) => o.decimal >= currentDecimalHour);
  const validToOptions = TIME_OPTIONS.filter(
    (o) => o.decimal > (timeWindow?.startHour ?? currentDecimalHour)
  );

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-muted/60 rounded-lg">
        <button
          onClick={() => {
            setMode("individual");
            setPendingDate(undefined);
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
            setPendingDate(undefined);
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
          {lang === "gu"
            ? "તારીખ પસંદ કરો પછી ઉમેરો બટન દબાવો"
            : "Select a date, then tap Add Date"}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground text-center -mt-1">
          {lang === "gu"
            ? "શરૂ અને અંતની તારીખ પસંદ કરો"
            : "Pick Start & End dates on the calendar"}
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
        {mode === "individual" ? (
          <Calendar
            mode="single"
            selected={pendingDate}
            onSelect={(d) => setPendingDate(d || undefined)}
            disabled={(d) => d < today}
            initialFocus
            className="mx-auto"
            classNames={{
              today: "ring-2 ring-primary/60 rounded-full font-semibold bg-transparent",
            }}
          />
        ) : (
          <Calendar
            mode="range"
            selected={
              rangeStart && rangeEnd
                ? { from: rangeStart < rangeEnd ? rangeStart : rangeEnd, to: rangeStart < rangeEnd ? rangeEnd : rangeStart }
                : rangeStart
                ? { from: rangeStart, to: undefined }
                : undefined
            }
            onSelect={(d) => {
              const range = d as { from?: Date; to?: Date } | undefined;
              if (!range || !range.from) {
                setRangeStart(null);
                setRangeEnd(null);
                onChange([]);
                return;
              }
              const start = range.from;
              const end = range.to || null;

              setRangeStart(start);
              setRangeEnd(end);

              if (start && end) {
                const normStart = new Date(start < end ? start : end);
                const normEnd = new Date(start < end ? end : start);
                normStart.setHours(12, 0, 0, 0);
                normEnd.setHours(12, 0, 0, 0);

                const rangeDates: Date[] = [];
                const cur = new Date(normStart);
                while (cur <= normEnd) {
                  rangeDates.push(new Date(cur));
                  cur.setDate(cur.getDate() + 1);
                }
                onChange(rangeDates.slice(0, 30));
              } else {
                // Only Start date selected: keep dates array EMPTY until End date is selected!
                onChange([]);
              }
            }}
            disabled={(d) => d < today}
            numberOfMonths={1}
            initialFocus
            className="mx-auto"
            classNames={{
              today: "",
            }}
            modifiersClassNames={{
              today: "rdp-today-circle",
            }}
          />
        )}
      </Card>

      {/* Add Date button (individual mode) */}
      {mode === "individual" && pendingDate && (
        <div className="flex justify-center">
          <Button
            onClick={confirmAddDate}
            disabled={dates.some(
              (d) => d.toDateString() === new Date(pendingDate).toDateString()
            )}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {dates.some(
              (d) => d.toDateString() === new Date(pendingDate).toDateString()
            )
              ? t("alreadyAdded")
              : t("addDate")}
          </Button>
        </div>
      )}

      {/* Add Range button & helper status — Date Range mode */}
      {mode === "range" && (
        <div className="flex flex-col items-center gap-2">
          {/* Status helper text */}
          <div className="text-xs font-medium text-center">
            {rangeStart && rangeEnd ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✓ {lang === "gu" ? "તારીખ સમયગાળો પસંદ થયો" : "Date Range Selected"}: {format(rangeStart < rangeEnd ? rangeStart : rangeEnd, "d MMM")} – {format(rangeStart < rangeEnd ? rangeEnd : rangeStart, "d MMM yyyy")} ({differenceInCalendarDays(rangeStart < rangeEnd ? rangeEnd : rangeStart, rangeStart < rangeEnd ? rangeStart : rangeEnd) + 1} {lang === "gu" ? "દિવસ" : "days"})
              </span>
            ) : rangeStart ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                👉 {lang === "gu" ? "શરૂ તારીખ" : "Start Date"}: {format(rangeStart, "d MMM yyyy")} — {lang === "gu" ? "કૃપા કરીને અંતિમ તારીખ પસંદ કરો" : "Please select End Date"}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {lang === "gu" ? "કેલેન્ડર પર શરૂ અને અંતની તારીખ પસંદ કરો" : "Select Start and End dates on calendar"}
              </span>
            )}
          </div>

          <Button
            onClick={confirmRange}
            disabled={!rangeStart || !rangeEnd}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {t("addRange")}
          </Button>
        </div>
      )}

      {/* Clear button — Range mode only when dates are selected */}
      {mode === "range" && dates.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              onChange([]);
              setRangeStart(null);
              setRangeEnd(null);
            }}
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {lang === "gu" ? "સાફ કરો" : "Clear Range"}
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
              <CalendarRange className="h-3.5 w-3.5 shrink-0" />
              {format(dates[0], "d MMM")} – {format(dates[dates.length - 1], "d MMM yyyy")} ({dates.length} {lang === "gu" ? "દિવસ" : "days"})
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
                  {validFromOptions.map((o) => (
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
                  {validToOptions.map((o) => (
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
            const startH = Math.max(6, currentDecimalHour);
            onTimeWindowChange({ startHour: startH, endHour: 21 });
          }}
          disabled={dates.length === 0}
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
