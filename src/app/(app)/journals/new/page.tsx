"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJournalJobPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/journals/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/journals/${data.jobId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Journal Recommendation</p>
      <h1 className="font-serif text-3xl font-semibold mt-1">Find your journal</h1>
      <p className="text-muted mt-2">
        Paste your finished article (the abstract is usually enough). We&apos;ll classify the field, extract keywords, and
        rank matching journals from the catalog.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste your abstract or full article…"
          className="w-full rounded-md border border-border-strong p-4 text-sm focus:border-accent-strong focus:outline-none"
        />

        {error && <p className="text-sm text-accent-strong">{error}</p>}

        <button
          type="submit"
          disabled={submitting || text.trim().length < 20}
          className="self-start rounded-md bg-accent px-6 py-2.5 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50 transition"
        >
          {submitting ? "Analyzing…" : "Find Matching Journals"}
        </button>
      </form>
    </div>
  );
}
