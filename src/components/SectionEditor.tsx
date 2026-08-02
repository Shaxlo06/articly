"use client";

import { useState } from "react";
import type { ArticleSection } from "@prisma/client";

const ACTIONS: { mode: "draft" | "regenerate" | "expand" | "shorten"; label: string }[] = [
  { mode: "draft", label: "Draft with AI" },
  { mode: "regenerate", label: "Regenerate" },
  { mode: "expand", label: "Expand" },
  { mode: "shorten", label: "Shorten" },
];

export function SectionEditor({
  articleId,
  section,
  onChange,
}: {
  articleId: string;
  section: ArticleSection;
  onChange: (section: ArticleSection) => void;
}) {
  const [content, setContent] = useState(section.content);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  async function save(nextContent: string) {
    setSaveState("saving");
    const res = await fetch(`/api/articles/${articleId}/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: nextContent }),
    });
    const data = await res.json();
    setSaveState("saved");
    onChange(data.section);
  }

  async function runAction(mode: (typeof ACTIONS)[number]["mode"]) {
    setPendingMode(mode);
    try {
      const res = await fetch(`/api/articles/${articleId}/sections/${section.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (res.ok) {
        setContent(data.section.content);
        onChange(data.section);
      }
    } finally {
      setPendingMode(null);
    }
  }

  const isEmpty = content.trim().length === 0;

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg font-semibold">{section.title}</h3>
        <span className="text-xs text-muted">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => save(content)}
        rows={8}
        placeholder={`Write or generate the ${section.title.toLowerCase()} section…`}
        className="w-full rounded-md border border-border-strong p-3 text-sm focus:border-accent-strong focus:outline-none"
      />

      <div className="flex flex-wrap gap-2 mt-3">
        {ACTIONS.filter((a) => a.mode !== "draft" || isEmpty).map((a) => (
          <button
            key={a.mode}
            onClick={() => runAction(a.mode)}
            disabled={pendingMode !== null}
            className="text-xs font-semibold rounded-md border border-border-strong px-3 py-1.5 hover:border-accent-strong disabled:opacity-50 transition-colors"
          >
            {pendingMode === a.mode ? "Working…" : a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
