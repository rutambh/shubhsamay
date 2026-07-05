"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STRINGS, type Lang, type StringKey } from "@/lib/i18n";

interface LangCtx {
  lang: Lang;
  toggle: () => void;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
}

const Ctx = createContext<LangCtx | null>(null);

const STORAGE_KEY = "shubhsamay.lang";

/**
 * IMPORTANT: Always initialize with "en" to match server-side render.
 * Loading the saved language from localStorage happens in a useEffect
 * AFTER hydration, preventing hydration mismatches.
 * (Per spec: "On Landing it will be English".)
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Load saved language preference after mount (avoids hydration mismatch).
  // This syncs React state with the external localStorage system.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "gu" || saved === "en") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(saved);
      }
    } catch {
      // localStorage may be unavailable; stay with "en"
    }
  }, []);

  // Persist + sync <html lang> whenever lang changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang === "gu" ? "gu" : "en";
      }
    } catch {
      // ignore
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggle = () => setLangState((prev) => (prev === "en" ? "gu" : "en"));
  const t = (key: StringKey) => STRINGS[key][lang];

  return (
    <Ctx.Provider value={{ lang, toggle, setLang, t }}>{children}</Ctx.Provider>
  );
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
