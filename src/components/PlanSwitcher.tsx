"use client";

import { useRouter } from "@/i18n/navigation";
import type { PlanTier } from "@prisma/client";

const PLANS: { key: PlanTier; label: string; blurb: string }[] = [
  { key: "FREE", label: "Free", blurb: "Try the core workflow with limited runs and PDF-only export." },
  { key: "PRO", label: "Pro", blurb: "Full export formats, plagiarism check, and higher monthly limits." },
  { key: "MAX", label: "Max", blurb: "Unlimited runs, full journal results, and advanced filters." },
];

export function PlanSwitcher({ current }: { current: PlanTier }) {
  const router = useRouter();

  async function choose(plan: PlanTier) {
    await fetch("/api/account/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    router.refresh();
  }

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {PLANS.map((p) => (
        <div
          key={p.key}
          className={`rounded-lg border p-5 flex flex-col gap-3 ${p.key === current ? "border-accent-strong bg-accent-soft" : "border-border"}`}
        >
          <div>
            <p className="font-serif text-lg font-semibold">{p.label}</p>
            <p className="text-sm text-muted mt-1">{p.blurb}</p>
          </div>
          <button
            onClick={() => choose(p.key)}
            disabled={p.key === current}
            className="mt-auto text-sm font-semibold rounded-md border border-border-strong px-3 py-1.5 hover:border-accent-strong disabled:opacity-50"
          >
            {p.key === current ? "Current plan" : `Switch to ${p.label}`}
          </button>
        </div>
      ))}
    </div>
  );
}
