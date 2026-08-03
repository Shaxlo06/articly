import Link from "next/link";

const PREVIEW_ROWS = [
  { label: "Edit Article", detail: "Discussion section — draft 3", tone: "accent" as const },
  { label: "Humanize", detail: "AI-detection score 63% → 12%", tone: "muted" as const },
  { label: "Journal Match", detail: "94% — Scopus Q1", tone: "muted" as const },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight text-foreground">
          From first outline to published paper.
        </h1>
        <p className="mt-5 text-lg text-muted leading-relaxed max-w-lg">
          ArticlyApp guides researchers through drafting, academic translation, journal matching, and
          Google Scholar indexing — one AI-assisted workspace, from scratch to submission-ready.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/signup"
            className="text-sm font-semibold px-6 py-3 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
          >
            Sign Up free
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold px-6 py-3 rounded-md border border-border-strong hover:border-accent-strong hover:text-accent-strong transition-colors"
          >
            Login
          </Link>
        </div>

        <p className="mt-6 text-xs uppercase tracking-wide text-muted">
          Built for researchers, from early-career to established academics
        </p>
      </div>

      <div className="relative">
        <div className="rounded-xl border border-border bg-surface shadow-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="font-serif text-sm font-semibold">Dashboard preview</span>
            <span className="text-xs rounded-full bg-tint text-foreground px-2 py-0.5 border border-border-strong">
              Demo
            </span>
          </div>
          <div className="space-y-3">
            {PREVIEW_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-lg border border-border bg-tint/40 px-4 py-3"
              >
                <span className="text-sm font-medium">{row.label}</span>
                <span
                  className={
                    row.tone === "accent"
                      ? "text-xs font-semibold text-accent-strong"
                      : "text-xs text-muted"
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
