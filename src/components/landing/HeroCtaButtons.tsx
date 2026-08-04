"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

export function HeroCtaButtons() {
  const t = useTranslations("landing.hero");
  const tNav = useTranslations("nav");
  const { openAuthModal, isAuthenticated } = useAuthModal();

  if (isAuthenticated) {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold px-6 py-3 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
        >
          {tNav("goToDashboard")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={openAuthModal}
        className="text-sm font-semibold px-6 py-3 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
      >
        {t("signupCta")}
      </button>
      <button
        type="button"
        onClick={openAuthModal}
        className="text-sm font-semibold px-6 py-3 rounded-md border border-border-strong hover:border-accent-strong hover:text-accent-strong transition-colors"
      >
        {t("loginCta")}
      </button>
    </div>
  );
}
