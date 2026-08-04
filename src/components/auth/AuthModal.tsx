"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

type View = "menu" | "login" | "signup";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("auth.modal");
  const [view, setView] = useState<View>("menu");
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-fixed/50 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        tabIndex={-1}
        className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-lg p-8 relative outline-none max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-tint transition-colors"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>

        {view === "menu" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-xl font-semibold">{t("title")}</h2>
              <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-sm font-semibold px-4 py-2.5 rounded-md border border-border-strong hover:border-accent-strong hover:text-accent-strong transition-colors"
              >
                {t("loginOption")}
              </button>
              <button
                type="button"
                onClick={() => setView("signup")}
                className="text-sm font-semibold px-4 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
              >
                {t("signupOption")}
              </button>

              <div className="flex items-center gap-3 text-xs text-muted my-1">
                <span className="h-px flex-1 bg-border" />
                {t("or")}
                <span className="h-px flex-1 bg-border" />
              </div>

              <GoogleSignInButton label={t("googleOption")} />
            </div>
          </div>
        )}

        {view === "login" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setView("menu")} aria-label={t("back")} className="text-muted hover:text-foreground">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3L5 8l5 5" />
                </svg>
              </button>
              <h2 className="font-serif text-xl font-semibold">{t("loginOption")}</h2>
            </div>
            <LoginForm onSuccess={onClose} onSwitchToSignup={() => setView("signup")} />
          </div>
        )}

        {view === "signup" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setView("menu")} aria-label={t("back")} className="text-muted hover:text-foreground">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3L5 8l5 5" />
                </svg>
              </button>
              <h2 className="font-serif text-xl font-semibold">{t("signupOption")}</h2>
            </div>
            <SignupForm onSuccess={onClose} onSwitchToLogin={() => setView("login")} />
          </div>
        )}
      </div>
    </div>
  );
}
