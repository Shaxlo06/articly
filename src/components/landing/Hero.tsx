import { useTranslations } from "next-intl";
import { HeroCtaButtons } from "./HeroCtaButtons";

export function Hero() {
  const t = useTranslations("landing.hero");
  const previewRows = t.raw("previewRows") as { label: string; detail: string }[];
  const tones = ["accent", "muted", "muted"] as const;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-5 text-lg text-muted leading-relaxed max-w-lg">{t("subtitle")}</p>

        <HeroCtaButtons />

        <p className="mt-6 text-xs uppercase tracking-wide text-muted">{t("tagline")}</p>
      </div>

      <div className="relative">
        <div className="rounded-xl border border-border bg-surface shadow-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="font-serif text-sm font-semibold">{t("previewTitle")}</span>
            <span className="text-xs rounded-full bg-tint text-foreground px-2 py-0.5 border border-border-strong">
              {t("previewBadge")}
            </span>
          </div>
          <div className="space-y-3">
            {previewRows.map((row, i) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-lg border border-border bg-tint/40 px-4 py-3"
              >
                <span className="text-sm font-medium">{row.label}</span>
                <span
                  className={
                    tones[i] === "accent" ? "text-xs font-semibold text-accent-strong" : "text-xs text-muted"
                  }
                >
                  {row.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -z-10 inset-0 translate-x-4 translate-y-4 rounded-xl bg-tint hidden md:block" />
      </div>
    </section>
  );
}
