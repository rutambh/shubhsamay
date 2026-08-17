"use client";

import { useLang } from "@/hooks/use-lang";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Star,
  Sparkles,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tier, SlotClassification, MethodId } from "@/lib/events";
import { formatTzTime, formatTzDate } from "@/lib/i18n";

const TZ_OFFSET = 5.5;

export interface TimingResult {
  start: string;
  end: string;
  tier: Tier;
  classification: SlotClassification;
  reasons_en: string[];
  reasons_gu: string[];
  method: MethodId;
}

export interface Suggestion {
  date: string;
  start: string;
  end: string;
  tier: Tier;
  label_en: string;
  label_gu: string;
  vara_en: string;
  vara_gu: string;
  favorableVaras_en: string[];
  favorableVaras_gu: string[];
}

interface Props {
  highly: TimingResult[];
  auspicious: TimingResult[];
  good: TimingResult[];
  bestRecommendation?: TimingResult | null;
  loading: boolean;
  error: string | null;
  eventName?: string;
  onReset: () => void;
  onChangeDateAndTime?: () => void;
}

export function ResultsView({
  highly,
  auspicious,
  good,
  bestRecommendation,
  loading,
  error,
  eventName,
  onReset,
  onChangeDateAndTime,
}: Props) {
  const { lang, t } = useLang();
  const defaultTier: Tier | null =
    highly.length > 0 ? "highly" : auspicious.length > 0 ? "auspicious" : good.length > 0 ? "good" : null;
  const [overrideTier, setOverrideTier] = useState<Tier | null>(null);

  const selectedTier = overrideTier ?? defaultTier;
  const setSelectedTier = setOverrideTier;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-accent border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground font-medium">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/40 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive">Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  const total = highly.length + auspicious.length + good.length;

  // CASE 2: No good timings available -> Show button in middle of result grid with message
  if (total === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center border-dashed bg-card/80 space-y-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <p className="text-foreground font-bold text-base">
              {lang === "gu"
                ? "આ તારીખોમાં કોઈ શુભ સમય મળ્યો નથી."
                : "No auspicious slots found on these dates."}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {lang === "gu"
                ? "બીજી તારીખો અથવા સમય સીમા અજમાવીને ઉત્તમ શુભ મુહૂર્ત શોધો."
                : "Try selecting different dates or a wider time window to find auspicious timings."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button
              onClick={onChangeDateAndTime || onReset}
              className="w-full sm:w-auto gap-2 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <CalendarClock className="h-4 w-4" />
              {lang === "gu" ? "તારીખ અને સમય બદલો" : "Change date and time"}
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full sm:w-auto gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t("startOver")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Get slots for the selected tier
  const displaySlots =
    selectedTier === "highly" ? highly :
    selectedTier === "auspicious" ? auspicious :
    selectedTier === "good" ? good : [];

  // Single #1 best overall timing slot calculated across ALL methods (strictly highly or auspicious)
  const topSlot = bestRecommendation;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-2 pb-0.5">
        {eventName ? (
          <p className="text-xs text-muted-foreground">
            {lang === "gu" ? "પ્રસંગ: " : "Event: "}
            <span className="font-semibold text-foreground">{eventName}</span>
          </p>
        ) : (
          <div />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-full"
          title={t("startOver")}
        >
          <Home className="h-3.5 w-3.5" />
          <span>{lang === "gu" ? "મુખ્ય પૃષ્ઠ" : "Home"}</span>
        </Button>
      </div>

      {/* Compact Best Recommended Timing Card */}
      {topSlot && (
        <Card className="p-2.5 sm:p-3 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-primary/5 to-card shadow-2xs space-y-2">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-foreground">
                {lang === "gu" ? "ઉત્તમ સમય મુહૂર્ત (શ્રેષ્ઠ પસંદગી)" : "Best Recommended Timing"}
              </h3>
            </div>
            <Badge className="bg-amber-500 text-amber-950 text-[10px] py-0 px-2 font-bold gap-0.5 shrink-0">
              <Star className="h-2.5 w-2.5 fill-current" />
              {lang === "gu"
                ? { highly: "અત્યંત શુભ", auspicious: "શુભ", good: "સારો", avoid: "ટાળો" }[topSlot.tier]
                : { highly: "Highly Auspicious", auspicious: "Auspicious", good: "Good", avoid: "Avoid" }[topSlot.tier]}
            </Badge>
          </div>

          <div className="p-3 rounded-lg bg-background/80 backdrop-blur border border-primary/20 space-y-1">
            {/* Day, Date */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{formatTzDate(topSlot.start, TZ_OFFSET)}</span>
            </div>
            {/* Time in new line */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span className="font-black text-base sm:text-lg text-foreground tracking-tight">
                {formatTzTime(topSlot.start, TZ_OFFSET)} – {formatTzTime(topSlot.end, TZ_OFFSET)}
              </span>
            </div>
          </div>

          {/* Classification chips color-coded by tier (matching results grid) */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            <ClassChip
              label={lang === "gu" ? "ચોઘડિયા" : "Choghadiya"}
              value={topSlot.classification.choghadiya ? (lang === "gu" ? topSlot.classification.choghadiya.name_gu : topSlot.classification.choghadiya.name_en) : null}
              tier={topSlot.classification.choghadiya?.tier}
              lang={lang}
            />
            <ClassChip
              label={lang === "gu" ? "હોરા" : "Hora"}
              value={topSlot.classification.hora ? (lang === "gu" ? topSlot.classification.hora.name_gu : topSlot.classification.hora.name_en) : null}
              tier={topSlot.classification.hora?.tier}
              lang={lang}
            />
            <ClassChip
              label={lang === "gu" ? "તિથિ" : "Tithi"}
              value={topSlot.classification.tithi ? (lang === "gu" ? topSlot.classification.tithi.name_gu : topSlot.classification.tithi.name_en) : null}
              tier={topSlot.classification.tithi?.tier}
              lang={lang}
            />
            <ClassChip
              label={lang === "gu" ? "નક્ષત્ર" : "Nakshatra"}
              value={topSlot.classification.nakshatra ? (lang === "gu" ? topSlot.classification.nakshatra.name_gu : topSlot.classification.nakshatra.name_en) : null}
              tier={topSlot.classification.nakshatra?.tier}
              lang={lang}
            />
            <ClassChip
              label={lang === "gu" ? "યોગ" : "Yoga"}
              value={topSlot.classification.yoga ? (lang === "gu" ? topSlot.classification.yoga.name_gu : topSlot.classification.yoga.name_en) : null}
              tier={topSlot.classification.yoga?.tier}
              lang={lang}
            />
            <ClassChip
              label={lang === "gu" ? "વાર" : "Vara"}
              value={topSlot.classification.vara ? (lang === "gu" ? topSlot.classification.vara.name_gu : topSlot.classification.vara.name_en) : null}
              tier={topSlot.classification.vara?.tier}
              lang={lang}
            />
            <ClassChip
              label={lang === "gu" ? "મુહૂર્ત" : "Muhurat"}
              value={topSlot.classification.muhurat ? (lang === "gu" ? topSlot.classification.muhurat.name_gu : topSlot.classification.muhurat.name_en) : null}
              tier={topSlot.classification.muhurat?.tier}
              lang={lang}
              inactive={topSlot.classification.muhurat ? !topSlot.classification.muhurat.active : undefined}
            />
          </div>

          {/* CASE 1: Results are visible -> Add Home and "Change date and time" button right under Best Recommended timing card */}
          <div className="pt-1 flex items-center justify-end gap-2">
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent/40 shadow-2xs"
            >
              <Home className="h-3.5 w-3.5" />
              {lang === "gu" ? "હોમ" : "Home"}
            </Button>
            <Button
              onClick={onChangeDateAndTime || onReset}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold gap-1.5 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 shadow-2xs"
            >
              <CalendarClock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              {lang === "gu" ? "તારીખ અને સમય બદલો" : "Change date and time"}
            </Button>
          </div>
        </Card>
      )}

      {/* If no topSlot but total > 0, show button at top of results grid */}
      {!topSlot && total > 0 && (
        <div className="flex items-center justify-end gap-2 pb-1">
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent/40 shadow-2xs"
          >
            <Home className="h-3.5 w-3.5" />
            {lang === "gu" ? "હોમ" : "Home"}
          </Button>
          <Button
            onClick={onChangeDateAndTime || onReset}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/5 shadow-2xs"
          >
            <CalendarClock className="h-3.5 w-3.5 text-primary" />
            {lang === "gu" ? "તારીખ અને સમય બદલો" : "Change date and time"}
          </Button>
        </div>
      )}

      {/* Tiles — radio-style (one selected at a time) */}
      <div className="grid grid-cols-3 gap-2">
        <Tile
          tier="highly"
          count={highly.length}
          lang={lang}
          selected={selectedTier === "highly"}
          onClick={() => setSelectedTier("highly")}
        />
        <Tile
          tier="auspicious"
          count={auspicious.length}
          lang={lang}
          selected={selectedTier === "auspicious"}
          onClick={() => setSelectedTier("auspicious")}
        />
        <Tile
          tier="good"
          count={good.length}
          lang={lang}
          selected={selectedTier === "good"}
          onClick={() => setSelectedTier("good")}
        />
      </div>

      {/* Selected tier's slots */}
      {selectedTier && displaySlots.length > 0 && (
        <ResultGroup slots={displaySlots} lang={lang} />
      )}

      <div className="flex justify-center pt-1">
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {t("startOver")}
        </Button>
      </div>
    </div>
  );
}

function Tile({
  tier,
  count,
  lang,
  selected,
  onClick,
}: {
  tier: Tier;
  count: number;
  lang: "en" | "gu";
  selected: boolean;
  onClick: () => void;
}) {
  const labels: Record<Tier, { en: string; gu: string }> = {
    highly: { en: "Highly Auspicious", gu: "અત્યંત શુભ" },
    auspicious: { en: "Auspicious", gu: "શુભ" },
    good: { en: "Good", gu: "સારો" },
    avoid: { en: "Avoid", gu: "ટાળો" },
  };
  // Color scheme: green=highly, yellow=auspicious, blue=good
  const colors: Record<Tier, { base: string; selected: string; count: string }> = {
    highly: {
      base: "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400",
      selected: "border-green-500 bg-green-500/15 ring-2 ring-green-500/30 text-green-700 dark:text-green-400",
      count: "text-green-600 dark:text-green-400",
    },
    auspicious: {
      base: "border-yellow-500/30 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400",
      selected: "border-yellow-500 bg-yellow-500/15 ring-2 ring-yellow-500/30 text-yellow-700 dark:text-yellow-400",
      count: "text-yellow-600 dark:text-yellow-400",
    },
    good: {
      base: "border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-400",
      selected: "border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30 text-blue-700 dark:text-blue-400",
      count: "text-blue-600 dark:text-blue-400",
    },
    avoid: {
      base: "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400",
      selected: "border-red-500 bg-red-500/15 text-red-700 dark:text-red-400",
      count: "text-red-600 dark:text-red-400",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={count === 0}
      className={cn(
        "rounded-xl border p-2 transition-all text-center flex flex-col items-center justify-center min-h-[68px] h-full gap-0.5",
        count === 0 && "opacity-35 cursor-not-allowed",
        selected ? colors[tier].selected : colors[tier].base,
        count > 0 && !selected && "hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
      )}
    >
      {/* Tier label (centered vertically in fixed height box so 1-line and 2-line labels align) */}
      <div className="flex items-center justify-center min-h-[26px] text-center w-full">
        <span className="text-[10px] font-semibold uppercase tracking-wide leading-tight text-center">
          {lang === "gu" ? labels[tier].gu : labels[tier].en}
        </span>
      </div>
      {/* Count (smaller) */}
      <span className={cn("text-lg font-bold leading-none", colors[tier].count)}>
        {count}
      </span>
    </button>
  );
}

function ResultGroup({
  slots,
  lang,
}: {
  slots: TimingResult[];
  lang: "en" | "gu";
}) {
  // Group by date
  const grouped = new Map<string, TimingResult[]>();
  for (const r of slots) {
    const key = formatTzDate(r.start, TZ_OFFSET, false);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  return (
    <div className="space-y-3">
      {Array.from(grouped.entries()).map(([day, daySlots]) => (
        <div key={day} className="space-y-2">
          {/* Colored date heading */}
          <div className="flex items-center gap-2 py-1 px-1 sticky top-0 bg-background/85 backdrop-blur z-10">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <h4 className="text-sm font-bold text-primary">
              {formatTzDate(daySlots[0].start, TZ_OFFSET)}
            </h4>
          </div>
          {daySlots.map((s, i) => (
            <Card
              key={i}
              className="p-2.5 transition-all fade-up border-border bg-card/80 space-y-1"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Time — reduced vertical margin to pills */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
                  {formatTzTime(s.start, TZ_OFFSET)} –{" "}
                  {formatTzTime(s.end, TZ_OFFSET)}
                </span>
              </div>

              {/* Classification chips: "Category: Value (Tier)" with value highlighted */}
              <div className="flex flex-wrap gap-1">
                <ClassChip
                  label={lang === "gu" ? "ચોઘડિયા" : "Choghadiya"}
                  value={s.classification.choghadiya ? (lang === "gu" ? s.classification.choghadiya.name_gu : s.classification.choghadiya.name_en) : null}
                  tier={s.classification.choghadiya?.tier}
                  lang={lang}
                />
                <ClassChip
                  label={lang === "gu" ? "હોરા" : "Hora"}
                  value={s.classification.hora ? (lang === "gu" ? s.classification.hora.name_gu : s.classification.hora.name_en) : null}
                  tier={s.classification.hora?.tier}
                  lang={lang}
                />
                <ClassChip
                  label={lang === "gu" ? "તિથિ" : "Tithi"}
                  value={s.classification.tithi ? (lang === "gu" ? s.classification.tithi.name_gu : s.classification.tithi.name_en) : null}
                  tier={s.classification.tithi?.tier}
                  lang={lang}
                />
                <ClassChip
                  label={lang === "gu" ? "નક્ષત્ર" : "Nakshatra"}
                  value={s.classification.nakshatra ? (lang === "gu" ? s.classification.nakshatra.name_gu : s.classification.nakshatra.name_en) : null}
                  tier={s.classification.nakshatra?.tier}
                  lang={lang}
                />
                <ClassChip
                  label={lang === "gu" ? "યોગ" : "Yoga"}
                  value={s.classification.yoga ? (lang === "gu" ? s.classification.yoga.name_gu : s.classification.yoga.name_en) : null}
                  tier={s.classification.yoga?.tier}
                  lang={lang}
                />
                <ClassChip
                  label={lang === "gu" ? "વાર" : "Vara"}
                  value={s.classification.vara ? (lang === "gu" ? s.classification.vara.name_gu : s.classification.vara.name_en) : null}
                  tier={s.classification.vara?.tier}
                  lang={lang}
                />
                <ClassChip
                  label={lang === "gu" ? "મુહૂર્ત" : "Muhurat"}
                  value={s.classification.muhurat ? (lang === "gu" ? s.classification.muhurat.name_gu : s.classification.muhurat.name_en) : null}
                  tier={s.classification.muhurat?.tier}
                  lang={lang}
                  inactive={s.classification.muhurat ? !s.classification.muhurat.active : undefined}
                />
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Classification chip: "Category: Value (Tier)" with the Value highlighted by tier color */
function ClassChip({
  label,
  value,
  tier,
  lang,
  inactive,
}: {
  label: string;
  value: string | null;
  tier?: Tier;
  lang: "en" | "gu";
  inactive?: boolean;
}) {
  if (!value || !tier || inactive) return null;

  const tierLabel =
    lang === "gu"
      ? { highly: "અત્યંત શુભ", auspicious: "શુભ", good: "સારો", avoid: "ટાળો" }[tier]
      : { highly: "Highly Auspicious", auspicious: "Auspicious", good: "Good", avoid: "Avoid" }[tier];

  // Value color by tier (green/yellow/blue/red)
  const valueColor =
    tier === "highly"
      ? "text-green-600 dark:text-green-400 font-semibold"
      : tier === "auspicious"
      ? "text-yellow-600 dark:text-yellow-400 font-semibold"
      : tier === "good"
      ? "text-blue-600 dark:text-blue-400 font-semibold"
      : "text-red-600 dark:text-red-400 font-semibold";

  return (
    <span className="inline-flex items-baseline gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary/60 text-secondary-foreground border border-border/40">
      <span className="text-muted-foreground font-medium">{label}:</span>
      <span className={valueColor}>{value}</span>
      <span className="text-[9px] opacity-75 font-normal">({tierLabel})</span>
    </span>
  );
}
