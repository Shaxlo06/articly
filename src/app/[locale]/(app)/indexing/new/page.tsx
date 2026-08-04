"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function NewIndexingJobPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/indexing/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/indexing/${data.jobId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Google Scholar Indexing</p>
      <h1 className="font-serif text-3xl font-semibold mt-1">Check indexing readiness</h1>
      <p className="text-muted mt-2">
        Paste the public URL where your article is hosted (your own site, a journal page, or a repository). We&apos;ll
        check that it&apos;s reachable and carries the citation metadata Google Scholar looks for — ArticlyApp
        doesn&apos;t host articles itself, so the page needs to already be live somewhere public.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          required
          placeholder="https://journal.example.com/articles/my-paper"
          className="w-full rounded-md border border-border-strong p-4 text-sm focus:border-accent-strong focus:outline-none"
        />

        {error && <p className="text-sm text-accent-strong">{error}</p>}

        <button
          type="submit"
          disabled={submitting || url.trim().length === 0}
          className="self-start rounded-md bg-accent px-6 py-2.5 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50 transition"
        >
          {submitting ? "Checking…" : "Check Readiness"}
        </button>
      </form>
    </div>
  );
}
