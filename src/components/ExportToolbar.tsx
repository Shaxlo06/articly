"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

const FORMATS = [
  { key: "docx", label: "Word" },
  { key: "pdf", label: "PDF" },
  { key: "txt", label: "TXT" },
] as const;

export function ExportToolbar({
  title,
  sections,
  articleId,
}: {
  title: string;
  sections: { title: string; content: string }[];
  articleId?: string;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleExport(format: (typeof FORMATS)[number]["key"]) {
    setPending(format);
    setNotice(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, title, sections, articleId }),
      });

      if (res.status === 403) {
        const data = await res.json();
        setNotice(data.error ?? "Upgrade required for this export format.");
        return;
      }
      if (!res.ok) {
        setNotice("Export failed — try again.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "article"}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {FORMATS.map((f) => (
          <button
            key={f.key}
            onClick={() => handleExport(f.key)}
            disabled={pending !== null}
            className="rounded-md border border-border-strong px-4 py-2 text-sm font-semibold hover:border-accent-strong disabled:opacity-50 transition-colors"
          >
            {pending === f.key ? "Preparing…" : `Download ${f.label}`}
          </button>
        ))}
      </div>
      {notice && (
        <p className="text-sm text-accent-strong">
          {notice} <Link href="/account" className="underline font-semibold">Upgrade plan</Link>
        </p>
      )}
    </div>
  );
}
