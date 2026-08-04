import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "./Reveal";

type Plan = {
  tier: string;
  price: string;
  cadence: string;
  who: string;
  features: string[];
  cta: string;
};

const HIGHLIGHT_INDEX = 1;

export function Pricing() {
  const t = useTranslations("landing.pricing");
  const plans = t.raw("plans") as Plan[];

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">{t("eyebrow")}</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold">{t("title")}</h2>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6 items-start">
        {plans.map((plan, i) => {
          const highlight = i === HIGHLIGHT_INDEX;
          return (
            <Reveal key={plan.tier} delayMs={i * 80} className="h-full">
              <div
                className={
                  highlight
                    ? "relative h-full rounded-lg border-2 border-accent bg-surface p-6 shadow-md transition-shadow hover:shadow-lg"
                    : "relative h-full rounded-lg border border-border bg-surface p-6 transition-shadow hover:shadow-md"
                }
              >
                {highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-accent text-white text-xs font-semibold px-3 py-1">
                    {t("recommended")}
                  </span>
                )}
                <h3 className="font-serif text-xl font-semibold">{plan.tier}</h3>
                <p className="mt-1 text-sm text-muted">{plan.who}</p>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-semibold">{plan.price}</span>
                  <span className="text-sm text-muted">{plan.cadence}</span>
                </p>

                <ul className="mt-6 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-foreground/90">
                      <span className="text-accent-strong">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={
                    highlight
                      ? "mt-6 block text-center text-sm font-semibold px-4 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
                      : "mt-6 block text-center text-sm font-semibold px-4 py-2.5 rounded-md border border-border-strong hover:border-accent-strong hover:text-accent-strong transition-colors"
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted">{t("disclaimer")}</p>
    </section>
  );
}
