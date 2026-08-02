const STEPS = [
  {
    n: "01",
    title: "Write & structure",
    description: "AI-guided IMRAD drafting turns an outline into a full, section-by-section article.",
  },
  {
    n: "02",
    title: "Translate academically",
    description: "Multi-language translation that preserves scientific register and terminology, not just words.",
  },
  {
    n: "03",
    title: "Match the right journals",
    description: "Ranked recommendations by field, quality, and fit — from OAK titles to Scopus-indexed journals.",
  },
  {
    n: "04",
    title: "Get indexed on Scholar",
    description: "Readiness checks and metadata so your published article is actually discoverable.",
  },
];

export function Loop() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">How it works</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold">One workspace, four steps to publication.</h2>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step) => (
          <div key={step.n} className="rounded-lg border border-border bg-surface p-6">
            <span className="font-serif text-2xl font-semibold text-accent-strong">{step.n}</span>
            <h3 className="mt-3 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
