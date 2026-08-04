"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";

const COLUMNS = [
  {
    key: "product",
    links: [
      { key: "howItWorks", href: "#how-it-works" },
      { key: "pricing", href: "#pricing" },
      { key: "templates", href: "#" },
      { key: "journalGuides", href: "#" },
    ],
  },
  {
    key: "company",
    links: [
      { key: "about", href: "#" },
      { key: "blog", href: "#" },
      { key: "careers", href: "#" },
      { key: "contact", href: "#contact" },
    ],
  },
  {
    key: "legal",
    links: [
      { key: "privacy", href: "#" },
      { key: "terms", href: "#" },
      { key: "cookies", href: "#" },
    ],
  },
] as const;

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "#",
    path: "M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.1 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.84v2.05h.05c.53-1 1.83-2.05 3.77-2.05C19.4 8 21 10.2 21 14.03V23h-4v-8.1c0-1.93-.03-4.42-2.7-4.42-2.7 0-3.12 2.11-3.12 4.28V23H7V8z",
  },
  {
    label: "X",
    href: "#",
    path: "M18.9 2H22l-7.6 8.7L23.4 22h-7.1l-5.5-7.2L4.5 22H1.4l8.1-9.3L.8 2h7.3l5 6.6L18.9 2zm-1.2 18h1.9L6.4 4H4.4l13.3 16z",
  },
  {
    label: "ResearchGate",
    href: "#",
    path: "M19.6 6.3c-.6-1.8-2.3-3-4.3-3-2.5 0-4.5 2-4.5 4.5 0 1.4.6 2.6 1.6 3.5-1.7.6-3 2.1-3.4 4-.1.4-.1.8-.1 1.2v6h3v-5.8c0-1.7 1.2-3.1 2.8-3.4h.1c.2 0 .4-.1.6-.1 2.5 0 4.5-2 4.5-4.5 0-1-.3-1.9-.9-2.6.1-.2.4-.5.6-.8zM4 8h3v14H4V8zM5.5 2C6.9 2 8 3.1 8 4.5S6.9 7 5.5 7 3 5.9 3 4.5 4.1 2 5.5 2z",
  },
];

export function Footer() {
  const t = useTranslations("landing.footer");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-14 grid sm:grid-cols-2 md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 text-sm text-muted max-w-xs">{t("tagline")}</p>

          <div className="mt-5 flex items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-muted hover:text-foreground transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>

          <form onSubmit={handleSubscribe} className="mt-6 max-w-xs">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t("newsletter.heading")}
            </p>
            {subscribed ? (
              <p className="mt-2 text-sm text-foreground/90">{t("newsletter.subscribedNotice")}</p>
            ) : (
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  required
                  placeholder={t("newsletter.placeholder")}
                  aria-label={t("newsletter.emailAriaLabel")}
                  className="min-w-0 flex-1 rounded-md border border-border-strong bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="submit"
                  className="shrink-0 text-sm font-semibold px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
                >
                  {t("newsletter.subscribeCta")}
                </button>
              </div>
            )}
          </form>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.key}>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t(`columns.${col.key}.heading`)}
            </h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="text-sm hover:text-accent-strong transition-colors">
                    {t(`columns.${col.key}.links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
