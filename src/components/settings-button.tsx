"use client";

import { useLang } from "@/hooks/use-lang";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Languages,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function SettingsButton() {
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  // Avoid hydration mismatch: only show theme after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("settings")}
          className="rounded-full border-primary/20 bg-background/80 backdrop-blur hover:bg-accent/40 h-10 w-10"
        >
          <Settings className="h-4 w-4 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            {t("settings")}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {lang === "gu" ? "તમારી પસંદગીઓ સંચાલિત કરો" : "Manage your preferences"}
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Language */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Languages className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                {t("languageSetting")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CompactCard
                selected={lang === "en"}
                onClick={() => setLang("en")}
                label="English"
              />
              <CompactCard
                selected={lang === "gu"}
                onClick={() => setLang("gu")}
                label="ગુજરાતી"
              />
            </div>
          </section>

          {/* Theme */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sun className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                {t("themeSetting")}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <CompactCard
                selected={mounted && theme === "light"}
                onClick={() => setTheme("light")}
                icon={<Sun className="h-3.5 w-3.5 text-amber-500" />}
                label={t("lightMode")}
              />
              <CompactCard
                selected={mounted && theme === "dark"}
                onClick={() => setTheme("dark")}
                icon={<Moon className="h-3.5 w-3.5 text-indigo-300" />}
                label={t("darkMode")}
              />
              <CompactCard
                selected={mounted && (theme === "system" || !theme)}
                onClick={() => setTheme("system")}
                icon={<Monitor className="h-3.5 w-3.5 text-muted-foreground" />}
                label={t("systemDefault")}
              />
            </div>
          </section>

          {/* About */}
          <section className="pt-2 border-t border-border/60">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "gu"
                ? "શુભ સમય · લહિરી અયનાંસ દ્વારા જીવંત પંચાંગ ગણતરી. ખગોળશાસ્ત્રમાંથી ચોક્કસ સમય."
                : "Shubh Samay · Live panchang calculated via Lahiri ayanamsa. Astronomy-accurate timings."}
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CompactCard({
  selected,
  onClick,
  label,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={selected}
      className={cn(
        "cursor-pointer p-2.5 flex items-center justify-center gap-1.5 transition-all",
        selected
          ? "border-primary ring-1 ring-primary/30 bg-accent/40"
          : "border-border bg-card/80 hover:bg-muted/40"
      )}
    >
      {icon}
      <span className="text-xs font-medium text-foreground">{label}</span>
      {selected && <Check className="h-3 w-3 text-primary" />}
    </Card>
  );
}
