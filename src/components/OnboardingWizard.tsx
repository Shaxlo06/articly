"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/Stepper";
import { LanguageSelector } from "@/components/LanguageSelector";

const STEPS = [
  { key: "personal", label: "Personal info" },
  { key: "language", label: "Language" },
  { key: "field", label: "Field" },
  { key: "plans", label: "Plans" },
];

const PLAN_OVERVIEW = [
  { tier: "Free", blurb: "1 active article, limited monthly AI runs, PDF export only." },
  { tier: "Pro", blurb: "10 active articles, plagiarism check, Word/PDF/TXT export." },
  { tier: "Max", blurb: "Unlimited articles and runs, advanced journal filters." },
];

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(initialName);
  const [institution, setInstitution] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [field, setField] = useState("");

  const step = STEPS[stepIndex];
  const canAdvance = step.key === "personal" ? name.trim().length > 0 : step.key === "field" ? field.trim().length > 0 : true;

  async function finish() {
    setSubmitting(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, institution, field, preferredLanguage }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-xl">
      <Stepper steps={STEPS} current={step.key} />

      <div className="mt-8 rounded-xl border border-border bg-surface p-8">
        {step.key === "personal" && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Tell us about you</h2>
            <label className="block">
              <span className="text-sm font-semibold">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Smith"
                className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Institution / affiliation</span>
              <input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="University of..."
                className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
          </div>
        )}

        {step.key === "language" && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Preferred language</h2>
            <p className="text-sm text-muted">Used for the app interface and as your default draft/translation language.</p>
            <LanguageSelector label="Language" value={preferredLanguage} onChange={setPreferredLanguage} />
          </div>
        )}

        {step.key === "field" && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Field / specialization</h2>
            <p className="text-sm text-muted">Helps personalize topic suggestions and journal matching later.</p>
            <input
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g. Environmental Psychology"
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        )}

        {step.key === "plans" && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">You&apos;re starting on the Free plan</h2>
            <p className="text-sm text-muted">You can upgrade any time from Account. Here&apos;s what each tier includes:</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {PLAN_OVERVIEW.map((p) => (
                <div key={p.tier} className="rounded-lg border border-border p-4">
                  <p className="font-semibold text-sm">{p.tier}</p>
                  <p className="mt-1 text-xs text-muted leading-relaxed">{p.blurb}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="text-sm font-semibold px-4 py-2 rounded-md border border-border-strong disabled:opacity-40"
          >
            Back
          </button>

          {step.key === "plans" ? (
            <button
              type="button"
              onClick={finish}
              disabled={submitting}
              className="text-sm font-semibold px-6 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors disabled:opacity-60"
            >
              {submitting ? "Finishing…" : "Go to dashboard"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}
              disabled={!canAdvance}
              className="text-sm font-semibold px-6 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors disabled:opacity-40"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
