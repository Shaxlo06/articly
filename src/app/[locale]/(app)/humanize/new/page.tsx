"use client";

import { useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function NewHumanizeJobPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".txt")) {
      setError("Upload a .txt file, or paste your text below — .docx/.pdf extraction isn't wired up in this build.");
      return;
    }
    setText(await file.text());
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/humanize/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/humanize/${data.jobId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Humanize</p>
      <h1 className="font-serif text-3xl font-semibold mt-1">Reduce AI-generated signal</h1>
      <p className="text-muted mt-2">
        Paste your article text (or upload a .txt file). We&apos;ll score it for AI-detection, rewrite it toward a more
        natural academic voice, and show you exactly what changed.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste your article text here…"
          className="w-full rounded-md border border-border-strong p-4 text-sm focus:border-accent-strong focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="text-sm font-semibold text-accent-strong hover:underline"
          >
            Upload .txt file
          </button>
          <input ref={fileInput} type="file" accept=".txt" onChange={handleFile} className="hidden" />
          <span className="text-xs text-muted">{text.length > 0 ? `${text.length.toLocaleString()} characters` : ""}</span>
        </div>

        {error && <p className="text-sm text-accent-strong">{error}</p>}

        <button
          type="submit"
          disabled={submitting || text.trim().length < 20}
          className="self-start rounded-md bg-accent px-6 py-2.5 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50 transition"
        >
          {submitting ? "Starting…" : "Check &amp; Humanize"}
        </button>
      </form>
    </div>
  );
}
