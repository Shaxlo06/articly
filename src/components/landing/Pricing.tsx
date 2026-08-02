import Link from "next/link";

const PLANS = [
  {
    tier: "Free",
    price: "$0",
    cadence: "forever",
    who: "Trying out the workflow on a single article",
    features: [
      "1 active article, 20 AI section generations",
      "Humanize: 2 runs / month",
      "Translate: 3 runs / month",
      "Top 3 journal matches",
      "PDF export only",
      "1 saved version",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    tier: "Pro",
    price: "$19",
    cadence: "/ month",
    who: "Researchers actively preparing articles for submission",
    features: [
      "10 active articles, 200 AI section generations",
      "Humanize: 20 runs / month",
      "Translate: multiple language pairs, 30 runs / month",
      "Full journal match list",
      "Plagiarism check included",
      "Word / PDF / TXT export",
      "10 saved versions",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    tier: "Max",
    price: "$49",
    cadence: "/ month",
    who: "Labs and frequent publishers who need no limits",
    features: [
      "Unlimited active articles & AI generations",
      "Unlimited humanize runs",
      "All language pairs, priority translation",
      "Full match list + advanced filters",
      "Plagiarism check included",
      "Word / PDF / TXT export",
      "Unlimited version history",
    ],
    cta: "Go Max",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Pricing</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold">Simple, transparent pricing.</h2>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6 items-start">
        {PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={
              plan.highlight
                ? "relative rounded-lg border-2 border-accent bg-surface p-6 shadow-md"
                : "relative rounded-lg border border-border bg-surface p-6"
            }
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-6 rounded-full bg-accent text-white text-xs font-semibold px-3 py-1">
                Recommended
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
                plan.highlight
                  ? "mt-6 block text-center text-sm font-semibold px-4 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
                  : "mt-6 block text-center text-sm font-semibold px-4 py-2.5 rounded-md border border-border-strong hover:border-accent-strong hover:text-accent-strong transition-colors"
              }
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted">
        Prices shown are indicative placeholders pending final billing setup — no payment provider is wired up yet.
      </p>
    </section>
  );
}
