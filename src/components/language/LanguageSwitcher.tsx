"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

const LOCALE_STORAGE_KEY = "articlyapp-locale";

// Each language is always shown in its own script, never translated.
const LANGUAGES: { value: AppLocale; label: string; code: string }[] = [
  { value: "uz", label: "O'zbekcha", code: "UZ" },
  { value: "ru", label: "Русский", code: "RU" },
  { value: "en", label: "English", code: "EN" },
];

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const activeIndex = LANGUAGES.findIndex((l) => l.value === locale);
    itemRefs.current[activeIndex >= 0 ? activeIndex : 0]?.focus();
  }, [open, locale]);

  function focusItem(index: number) {
    const next = (index + LANGUAGES.length) % LANGUAGES.length;
    itemRefs.current[next]?.focus();
  }

  function choose(value: AppLocale) {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, value);
    setOpen(false);
    triggerRef.current?.focus();
    router.replace(pathname, { locale: value });
  }

  function onItemKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusItem(index + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusItem(index - 1);
        break;
      case "Home":
        e.preventDefault();
        focusItem(0);
        break;
      case "End":
        e.preventDefault();
        focusItem(LANGUAGES.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(LANGUAGES[index].value);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const currentCode = LANGUAGES.find((l) => l.value === locale)?.code ?? locale.toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("selectLanguage")}
        onClick={() => setOpen((v) => !v)}
        className="h-8 min-w-8 px-1.5 rounded-full border border-border-strong flex items-center justify-center gap-1 text-xs font-semibold hover:border-accent-strong transition-colors"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9Z" />
        </svg>
        {currentCode}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("selectLanguage")}
          className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-border bg-surface p-1 shadow-lg z-50"
        >
          {LANGUAGES.map((lang, index) => {
            const active = locale === lang.value;
            return (
              <button
                key={lang.value}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                tabIndex={-1}
                onClick={() => choose(lang.value)}
                onKeyDown={(e) => onItemKeyDown(e, index)}
                className={`w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                  active ? "bg-accent-soft text-accent-strong font-semibold" : "text-foreground hover:bg-tint"
                }`}
              >
                <span>{lang.label}</span>
                {active && (
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 8.5l3 3 6-7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
