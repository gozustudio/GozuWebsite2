"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_NAMES: Record<string, string> = {
  bg: "Български",
  cs: "Čeština",
  da: "Dansk",
  de: "Deutsch",
  el: "Ελληνικά",
  en: "English",
  es: "Español",
  et: "Eesti",
  fi: "Suomi",
  fr: "Français",
  hr: "Hrvatski",
  hu: "Magyar",
  it: "Italiano",
  lt: "Lietuvių",
  lv: "Latviešu",
  nl: "Nederlands",
  no: "Norsk",
  pl: "Polski",
  pt: "Português",
  ro: "Română",
  ru: "Русский",
  sk: "Slovenčina",
  sl: "Slovenščina",
  sr: "Srpski",
  sv: "Svenska",
  uk: "Українська",
};

const sortedLocales = [...routing.locales].sort((a, b) =>
  (LOCALE_NAMES[a] ?? a).localeCompare(LOCALE_NAMES[b] ?? b)
);

export default function LanguageSelector({ mobile = false }: { mobile?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function switchLocale(newLocale: string) {
    setOpen(false);
    router.replace(pathname, { locale: newLocale as typeof locale });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={
          mobile
            ? "mt-6 text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-body)] transition-colors duration-300 hover:text-[var(--color-main)]"
            : "text-[11px] font-medium uppercase tracking-[3px] text-[var(--color-body)] transition-colors duration-300 hover:text-[var(--color-main)]"
        }
        aria-label="Select language"
        aria-expanded={open}
      >
        {locale.toUpperCase()}
      </button>

      {open && (
        <div
          className={`${
            mobile
              ? "absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
              : "absolute right-0 top-full mt-2"
          } z-50 max-h-80 w-48 overflow-y-auto border border-[var(--color-border)]/30 bg-[var(--color-bg)] shadow-lg`}
        >
          {sortedLocales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`block w-full px-4 py-2 text-left text-sm font-sans transition-colors duration-200 hover:bg-[var(--color-main)]/10 ${
                loc === locale
                  ? "text-[var(--color-main)] font-medium"
                  : "text-[var(--color-body)]"
              }`}
            >
              {LOCALE_NAMES[loc] ?? loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
