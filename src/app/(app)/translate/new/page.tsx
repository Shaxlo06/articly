"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function NewTranslateJobPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/translate/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceLang, targetLang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/translate/${data.jobId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Academic Translate</p>
      <h1 className="font-serif text-3xl font-semibold mt-1">Translate in academic register</h1>
      <p className="text-muted mt-2">
        Source language is auto-detected. Ambiguous terminology is flagged for your review instead of a silent guess.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste your article text here…"
          className="w-full rounded-md border border-border-strong p-4 text-sm focus:border-accent-strong focus:outline-none"
        />

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Source language</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSourceLang("auto")}
              className={`rounded-md border px-3 py-2 ${sourceLang === "auto" ? "border-accent-strong bg-accent-soft font-semibold" : "border-border-strong"}`}
            >
              Auto-detect
            </button>
          </div>
          <LanguageSelector value={sourceLang} onChange={setSourceLang} label="" />
        </div>

        <LanguageSelector value={targetLang} onChange={setTargetLang} label="Target language" />

        {error && <p className="text-sm text-accent-strong">{error}</p>}

        <button
          type="submit"
          disabled={submitting || text.trim().length < 20}
          className="self-start rounded-md bg-accent px-6 py-2.5 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50 transition"
        >
          {submitting ? "Starting…" : "Translate"}
        </button>
      </form>
    </div>
  );
}
