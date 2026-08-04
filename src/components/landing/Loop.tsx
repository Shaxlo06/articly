import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";

type Step = { n: string; title: string; description: string };

export function Loop() {
  const t = useTranslations("landing.loop");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">{t("eyebrow")}</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold">{t("title")}</h2>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <Reveal key={step.n} delayMs={i * 80}>
            <div className="h-full rounded-lg border border-border bg-surface p-6 transition-shadow hover:shadow-md">
              <span className="font-serif text-2xl font-semibold text-accent-strong">{step.n}</span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
