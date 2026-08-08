"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { PlanTier } from "@prisma/client";
import { NAV_TABS } from "./nav/tabsConfig";
import { PlanBadge } from "./PlanBadge";
import { LanguageSwitcher } from "./language/LanguageSwitcher";
import { ThemeToggle } from "./theme/ThemeToggle";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function Panel({ name, plan, onClose }: { name: string; plan?: PlanTier; onClose: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${entered ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-[85vw] max-w-sm bg-surface shadow-xl flex flex-col transition-transform duration-200 ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4 h-16 border-b border-border">
          <p className="font-serif font-semibold">Menyu</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center hover:bg-tint transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 border-b border-border">
          <p className="font-semibold truncate">{name}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {plan && <PlanBadge plan={plan} />}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_TABS.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium min-h-11 ${
                  active ? "text-accent-strong bg-accent-soft" : "text-foreground hover:bg-tint"
                }`}
              >
                <tab.Icon />
                {t(tab.key)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function MobileMenu({ name, plan }: { name: string; plan?: PlanTier }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menyuni ochish"
        className="sm:hidden h-11 w-11 rounded-full flex items-center justify-center border border-border-strong hover:border-accent-strong transition-colors"
      >
        <MenuIcon />
      </button>
      {open && <Panel name={name} plan={plan} onClose={() => setOpen(false)} />}
    </>
  );
}
