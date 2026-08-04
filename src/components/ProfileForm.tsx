"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { LanguageSelector } from "@/components/LanguageSelector";

export function ProfileForm({
  initialName,
  initialInstitution,
  initialField,
  initialPreferredLanguage,
}: {
  initialName: string;
  initialInstitution: string;
  initialField: string;
  initialPreferredLanguage: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [institution, setInstitution] = useState(initialInstitution);
  const [field, setField] = useState(initialField);
  const [preferredLanguage, setPreferredLanguage] = useState(initialPreferredLanguage);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, institution, field, preferredLanguage }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
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

      <label className="block">
        <span className="text-sm font-semibold">Field / specialization</span>
        <input
          value={field}
          onChange={(e) => setField(e.target.value)}
          placeholder="e.g. Environmental Psychology"
          className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <span className="mt-1 block text-xs text-muted">Helps personalize topic suggestions and journal matching.</span>
      </label>

      <LanguageSelector label="Preferred language" value={preferredLanguage} onChange={setPreferredLanguage} />

      <div className="flex items-center gap-3 mt-2">
        <button
          type="submit"
          disabled={saving}
          className="text-sm font-semibold px-5 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-sm text-muted">Saved.</span>}
      </div>
    </form>
  );
}
