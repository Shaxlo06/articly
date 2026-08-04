"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

const LINK_KEYS = [
  { href: "#how-it-works", key: "howItWorks" },
  { href: "#pricing", key: "pricing" },
  { href: "#contact", key: "contact" },
] as const;

export function LandingNav() {
  const t = useTranslations("nav");
  const { openAuthModal, isAuthenticated } = useAuthModal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        scrolled
          ? "sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur transition-colors"
          : "sticky top-0 z-20 border-b border-transparent bg-transparent transition-colors"
      }
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {LINK_KEYS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-accent-strong transition-colors">
              {t(link.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
            >
              {t("goToDashboard")}
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={openAuthModal}
                className="text-sm font-semibold px-4 py-2 rounded-md border border-border-strong hover:border-accent-strong hover:text-accent-strong transition-colors"
              >
                {t("login")}
              </button>
              <button
                type="button"
                onClick={openAuthModal}
                className="text-sm font-semibold px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
              >
                {t("signup")}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
