"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Choice = "SCRATCH" | "UPLOADED" | "PARTIAL";

const CHOICES: { key: Choice; title: string; description: string }[] = [
  { key: "SCRATCH", title: "Write from scratch", description: "Start with a topic and let the guided steps build your outline and draft." },
  { key: "UPLOADED", title: "Edit an existing article", description: "Paste or upload a finished draft to structure, polish, and export." },
  { key: "PARTIAL", title: "Complete a partial draft", description: "Upload what you have so far and finish the remaining sections." },
];

export default function NewArticlePage() {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice>("SCRATCH");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue() {
    setError(null);
    if (choice !== "SCRATCH" && text.trim().length < 40) {
      setError("Paste at least a few paragraphs so we can detect the structure.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: choice, existingText: choice === "SCRATCH" ? undefined : text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/editor/${data.articleId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Edit Article</p>
      <h1 className="font-serif text-3xl font-semibold mt-1">How would you like to start?</h1>

      <div className="grid gap-3 mt-8">
        {CHOICES.map((c) => (
          <button
            key={c.key}
            onClick={() => setChoice(c.key)}
            className={`text-left rounded-lg border p-5 transition-colors ${
              choice === c.key ? "border-accent-strong bg-accent-soft" : "border-border-strong hover:border-accent-strong"
            }`}
          >
            <p className="font-semibold">{c.title}</p>
            <p className="text-sm text-muted mt-1">{c.description}</p>
          </button>
        ))}
      </div>

      {choice !== "SCRATCH" && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste your draft here…"
          className="w-full mt-5 rounded-md border border-border-strong p-4 text-sm focus:border-accent-strong focus:outline-none"
        />
      )}

      {error && <p className="text-sm text-accent-strong mt-3">{error}</p>}

      <button
        onClick={handleContinue}
        disabled={submitting}
        className="mt-6 rounded-md bg-accent px-6 py-2.5 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50 transition"
      >
        {submitting ? "Setting up…" : "Continue"}
      </button>
    </div>
  );
}
