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
  CalendarClock,
  Home,
  CheckCircle2,
  Share2,
  CalendarPlus,
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
        </div>
        <p className="text-foreground font-bold text-xs">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-5 border-destructive/40 bg-destructive/10 rounded-3xl space-y-2">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-destructive text-sm">Error</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  const total = highly.length + auspicious.length + good.length;

  if (total === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center border-dashed border-primary/30 bg-card/85 backdrop-blur-xl rounded-3xl space-y-4 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-secondary/40 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-foreground font-extrabold text-base">
              {lang === "gu"
                ? "આ તારીખોમાં કોઈ અનુકૂળ શુભ સમય મળ્યો નથી."
                : "No auspicious slots found on these dates."}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {lang === "gu"
                ? "બીજી તારીખો અથવા સમય સીમા અજમાવીને ઉત્તમ શુભ મુહૂર્ત શોધો."
                : "Try selecting different dates or a wider time window to find auspicious timings."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Button
              onClick={onChangeDateAndTime || onReset}
              className="w-full sm:w-auto gap-2 font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-sm cursor-pointer"
            >
              <CalendarClock className="h-4 w-4" />
              {lang === "gu" ? "તારીખ અને સમય બદલો" : "Change date and time"}
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full sm:w-auto gap-2 rounded-2xl cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              {t("startOver")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const displaySlots =
    selectedTier === "highly" ? highly :
    selectedTier === "auspicious" ? auspicious :
    selectedTier === "good" ? good : [];

  const topSlot = bestRecommendation;

  return (
    <div className="space-y-4 fade-up">
      {/* Event Top Bar */}
      <div className="flex items-center justify-between gap-2">
        {eventName && (
          <p className="text-xs text-muted-foreground font-semibold">
            {lang === "gu" ? "પ્રસંગ: " : "Event: "}
            <span className="font-extrabold text-foreground">{eventName}</span>
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-full"
        >
          <Home className="h-3.5 w-3.5" />
          <span>{lang === "gu" ? "મુખ્ય પૃષ્ઠ" : "Home"}</span>
        </Button>
      </div>

      {/* 🌟 1. BEST RECOMMENDED TIMING CARD (Hero Crown) */}
      {topSlot && (
        <Card className="p-4 sm:p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-primary/10 to-card/95 backdrop-blur-2xl shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-extrabold text-xs sm:text-sm text-foreground tracking-tight">
                {lang === "gu" ? "સૌથી શ્રેષ્ઠ મુહૂર્ત (પ્રથમ પસંદગી)" : "Best Recommended Auspicious Window"}
              </h3>
            </div>
            <Badge className="bg-amber-500 text-amber-950 text-[10px] py-0.5 px-2.5 font-extrabold gap-1 shrink-0 rounded-full shadow-2xs">
              <Star className="h-3 w-3 fill-current" />
              {lang === "gu" ? "અતિ શ્રેષ્ઠ" : "Top Pick"}
            </Badge>
          </div>

          <div className="p-3.5 rounded-2xl bg-background/80 dark:bg-background/60 backdrop-blur-md border border-amber-500/25 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{formatTzDate(topSlot.start, TZ_OFFSET)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span className="font-black text-lg sm:text-xl text-foreground tracking-tight">
                {formatTzTime(topSlot.start, TZ_OFFSET)} – {formatTzTime(topSlot.end, TZ_OFFSET)}
              </span>
            </div>
          </div>

          {/* Planetary Class Chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
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
          </div>

          {/* Bottom Actions */}
          <div className="pt-1 flex items-center justify-end gap-2">
            <Button
              onClick={onChangeDateAndTime || onReset}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold gap-1.5 rounded-xl border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 cursor-pointer shadow-2xs"
            >
              <CalendarClock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{lang === "gu" ? "તારીખ અને સમય બદલો" : "Change date & time"}</span>
            </Button>
          </div>
        </Card>
      )}

      {/* 2. Tier Selection Filter Tabs */}
      <div className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">
          {lang === "gu" ? "બધા મળેલા શુભ સમય" : "All Auspicious Windows"}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "highly", label_en: `Highly (${highly.length})`, label_gu: `અત્યંત શુભ (${highly.length})`, count: highly.length },
            { id: "auspicious", label_en: `Auspicious (${auspicious.length})`, label_gu: `શુભ (${auspicious.length})`, count: auspicious.length },
            { id: "good", label_en: `Good (${good.length})`, label_gu: `સારો (${good.length})`, count: good.length },
          ].map((t) => {
            const active = selectedTier === t.id;
            return (
              <button
                key={t.id}
                disabled={t.count === 0}
                onClick={() => setOverrideTier(t.id as Tier)}
                className={cn(
                  "py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer truncate",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]"
                    : t.count === 0
                    ? "opacity-40 cursor-not-allowed bg-secondary/10 border-border/30 text-muted-foreground"
                    : "bg-secondary/35 border-border/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {lang === "gu" ? t.label_gu : t.label_en}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Slot Cards List */}
      <div className="space-y-2.5">
        {displaySlots.map((slot, i) => (
          <Card
            key={i}
            className="p-3.5 sm:p-4 rounded-3xl bg-card/90 dark:bg-card/75 backdrop-blur-xl border border-border/70 dark:border-white/10 shadow-sm space-y-2.5 hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 cosmic-pulse" />
                <span className="font-extrabold text-sm sm:text-base text-foreground">
                  {formatTzTime(slot.start, TZ_OFFSET)} – {formatTzTime(slot.end, TZ_OFFSET)}
                </span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">
                {formatTzDate(slot.start, TZ_OFFSET)}
              </span>
            </div>

            {/* Classification chips */}
            <div className="flex flex-wrap gap-1.5">
              <ClassChip
                label={lang === "gu" ? "ચોઘડિયા" : "Choghadiya"}
                value={slot.classification.choghadiya ? (lang === "gu" ? slot.classification.choghadiya.name_gu : slot.classification.choghadiya.name_en) : null}
                tier={slot.classification.choghadiya?.tier}
                lang={lang}
              />
              <ClassChip
                label={lang === "gu" ? "હોરા" : "Hora"}
                value={slot.classification.hora ? (lang === "gu" ? slot.classification.hora.name_gu : slot.classification.hora.name_en) : null}
                tier={slot.classification.hora?.tier}
                lang={lang}
              />
              <ClassChip
                label={lang === "gu" ? "તિથિ" : "Tithi"}
                value={slot.classification.tithi ? (lang === "gu" ? slot.classification.tithi.name_gu : slot.classification.tithi.name_en) : null}
                tier={slot.classification.tithi?.tier}
                lang={lang}
              />
              <ClassChip
                label={lang === "gu" ? "નક્ષત્ર" : "Nakshatra"}
                value={slot.classification.nakshatra ? (lang === "gu" ? slot.classification.nakshatra.name_gu : slot.classification.nakshatra.name_en) : null}
                tier={slot.classification.nakshatra?.tier}
                lang={lang}
              />
              <ClassChip
                label={lang === "gu" ? "યોગ" : "Yoga"}
                value={slot.classification.yoga ? (lang === "gu" ? slot.classification.yoga.name_gu : slot.classification.yoga.name_en) : null}
                tier={slot.classification.yoga?.tier}
                lang={lang}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClassChip({
  label,
  value,
  tier,
  lang,
}: {
  label: string;
  value: string | null;
  tier?: Tier;
  lang: "en" | "gu";
}) {
  if (!value) return null;

  const toneClass =
    tier === "highly" || tier === "auspicious"
      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
      : tier === "good"
      ? "bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300"
      : "bg-secondary/40 border-border/50 text-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border",
        toneClass
      )}
    >
      <span className="opacity-75">{label}:</span>
      <span>{value}</span>
    </span>
  );
}
