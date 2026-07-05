"use client";

import { useLang } from "@/hooks/use-lang";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Star,
  Sparkles,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  Plus,
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
  suggestion: Suggestion | null;
  loading: boolean;
  error: string | null;
  eventName?: string;
  onReset: () => void;
  onAddSuggestedDate: (date: Date) => void;
}

export function ResultsView({
  highly,
  auspicious,
  good,
  suggestion,
  loading,
  error,
  eventName,
  onReset,
  onAddSuggestedDate,
}: Props) {
  const { lang, t } = useLang();
  // Only ONE tile selected at a time (radio-style). Default: highest tier with slots.
  const [selectedTier, setSelectedTier] = useState<Tier | null>(() => {
    if (highly.length > 0) return "highly";
    if (auspicious.length > 0) return "auspicious";
    if (good.length > 0) return "good";
    return null;
  });

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

  if (total === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center border-dashed">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">
            {lang === "gu"
              ? "આ તારીખોમાં કોઈ શુભ સમય મળ્યો નથી."
              : "No auspicious slots found on these dates."}
          </p>
          <p className="text-sm text-muted-foreground">
            {lang === "gu"
              ? "બીજી તારીખો અથવા સમય સીમા અજમાવો."
              : "Try different dates or a wider time window."}
          </p>
        </Card>
        <Button onClick={onReset} variant="outline" className="w-full gap-2">
          <RotateCcw className="h-4 w-4" />
          {t("startOver")}
        </Button>
      </div>
    );
  }

  // Get slots for the selected tier
  const displaySlots =
    selectedTier === "highly" ? highly :
    selectedTier === "auspicious" ? auspicious :
    selectedTier === "good" ? good : [];

  return (
    <div className="space-y-5">
      {eventName && (
        <p className="text-sm text-muted-foreground text-center">
          {lang === "gu" ? "પ્રસંગ: " : "Event: "}
          <span className="font-semibold text-foreground">{eventName}</span>
        </p>
      )}

      {/* Suggestion banner */}
      {suggestion && (
        <Card className="p-4 border-primary/40 bg-gradient-to-br from-accent/40 to-card">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">
                {t("suggestionTitle")}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {t("suggestionBody")}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {lang === "gu" ? suggestion.label_gu : suggestion.label_en}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">
                    {formatTzDate(suggestion.start, TZ_OFFSET)} ·{" "}
                    {formatTzTime(suggestion.start, TZ_OFFSET)} –{" "}
                    {formatTzTime(suggestion.end, TZ_OFFSET)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 h-8"
                  onClick={() => onAddSuggestedDate(new Date(suggestion.date))}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("addSuggestedDate")}
                </Button>
              </div>
              {suggestion.favorableVaras_en.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {lang === "gu"
                    ? `આ પ્રસંગ માટે શ્રેષ્ઠ દિવસ: ${suggestion.favorableVaras_gu.join(", ")}`
                    : `Best days for this event: ${suggestion.favorableVaras_en.join(", ")}`}
                </p>
              )}
            </div>
          </div>
        </Card>
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

      <div className="flex justify-center pt-2">
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
        "rounded-xl border p-2.5 transition-all text-center flex flex-col items-center gap-0.5",
        count === 0 && "opacity-35 cursor-not-allowed",
        selected ? colors[tier].selected : colors[tier].base,
        count > 0 && !selected && "hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
      )}
    >
      {/* Tier label ABOVE count */}
      <span className="text-[10px] font-semibold uppercase tracking-wide leading-tight">
        {lang === "gu" ? labels[tier].gu : labels[tier].en}
      </span>
      {/* Count (smaller) */}
      <span className={cn("text-xl font-bold leading-none", colors[tier].count)}>
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
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([day, daySlots]) => (
        <div key={day} className="space-y-2">
          {/* Larger, colored date heading */}
          <div className="flex items-center gap-2 py-1.5 px-1 sticky top-0 bg-background/85 backdrop-blur z-10">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <h4 className="text-base font-bold text-primary">
              {formatTzDate(daySlots[0].start, TZ_OFFSET)}
            </h4>
          </div>
          {daySlots.map((s, i) => (
            <Card
              key={i}
              className="p-3 transition-all fade-up border-border bg-card/80"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Time */}
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground text-sm">
                  {formatTzTime(s.start, TZ_OFFSET)} –{" "}
                  {formatTzTime(s.end, TZ_OFFSET)}
                </span>
              </div>

              {/* Classification chips: "Category: Value (Tier)" with value highlighted */}
              <div className="flex flex-wrap gap-1.5">
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
  if (!value || !tier) return null;

  // Inactive (e.g. Muhurat "None") — show in gray, no tier label
  if (inactive) {
    return (
      <span className="inline-flex items-baseline gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground/60">
        <span>{label}:</span>
        <span>—</span>
      </span>
    );
  }

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
    <span className="inline-flex items-baseline gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
      <span>{label}:</span>
      <span className={valueColor}>{value}</span>
      <span className="opacity-60">({tierLabel})</span>
    </span>
  );
}
