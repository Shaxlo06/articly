"use client";

import { useState } from "react";
import { useJobPolling, type JobState } from "@/hooks/useJobPolling";
import { AsyncJobStatus } from "@/components/AsyncJobStatus";
import { ExportToolbar } from "@/components/ExportToolbar";

interface TranslateOutput {
  translated: string;
  flaggedSegments: { original: string; translated: string; reason: string }[];
  sourceLang: string;
  targetLang: string;
}

export function TranslateJobView({ initial, originalText }: { initial: JobState; originalText: string }) {
  const job = useJobPolling("/api/translate/jobs", initial);
  const output = job.output as TranslateOutput | null;
  const [view, setView] = useState<"side-by-side" | "toggle">("side-by-side");

  return (
    <div className="flex flex-col gap-6">
      <AsyncJobStatus status={job.status} error={job.error} />

      {output && (
        <>
          {output.flaggedSegments.length > 0 && (
            <div className="rounded-lg border border-accent-strong bg-accent-soft p-4">
              <p className="font-semibold text-sm mb-2">Flagged for your review</p>
              <ul className="flex flex-col gap-2 text-sm">
                {output.flaggedSegments.map((seg, i) => (
                  <li key={i}>
                    <span className="font-semibold">{seg.original}</span> → {seg.translated}
                    <p className="text-muted">{seg.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">Preview</h2>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setView("side-by-side")}
                className={`rounded px-2 py-1 ${view === "side-by-side" ? "bg-accent-soft font-semibold" : ""}`}
              >
                Side-by-side
              </button>
              <button
                onClick={() => setView("toggle")}
                className={`rounded px-2 py-1 ${view === "toggle" ? "bg-accent-soft font-semibold" : ""}`}
              >
                Translated only
              </button>
            </div>
          </div>

          <div className={view === "side-by-side" ? "grid sm:grid-cols-2 gap-4" : "grid gap-4"}>
            {view === "side-by-side" && (
              <div className="rounded-lg border border-border p-4 text-sm whitespace-pre-wrap">
                <p className="text-xs font-semibold uppercase text-muted mb-2">Original</p>
                {originalText}
              </div>
            )}
            <div className="rounded-lg border border-border bg-tint/40 p-4 text-sm whitespace-pre-wrap">
              <p className="text-xs font-semibold uppercase text-muted mb-2">Translated ({output.targetLang})</p>
              {output.translated}
            </div>
          </div>

          <ExportToolbar
            title="Translated article"
            sections={[{ title: `Translated (${output.targetLang})`, content: output.translated }]}
          />
        </>
      )}
    </div>
  );
}
