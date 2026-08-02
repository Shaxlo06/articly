"use client";

import { useState } from "react";
import { useJobPolling, type JobState } from "@/hooks/useJobPolling";
import { AsyncJobStatus } from "@/components/AsyncJobStatus";
import { ExportToolbar } from "@/components/ExportToolbar";
import type { IndexingJobOutput, ScholarStatus } from "@/lib/indexingJob";

const STATUS_OPTIONS: { key: ScholarStatus; label: string }[] = [
  { key: "NOT_SUBMITTED", label: "Not yet submitted" },
  { key: "PENDING", label: "Pending" },
  { key: "INDEXED", label: "Indexed" },
];

function CheckRow({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
      <span
        className={`mt-0.5 h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
          ok ? "bg-accent-soft text-accent-strong" : "bg-silver-wash text-muted"
        }`}
      >
        {ok ? "✓" : "!"}
      </span>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {detail && <p className="text-xs text-muted mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

export function IndexingJobView({ initial }: { initial: JobState }) {
  const job = useJobPolling("/api/indexing/jobs", initial);
  const output = job.output as unknown as IndexingJobOutput | null;
  const [status, setStatus] = useState<ScholarStatus | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const currentStatus = status ?? output?.manualStatus ?? "NOT_SUBMITTED";

  async function updateStatus(next: ScholarStatus) {
    setSavingStatus(true);
    setStatus(next);
    try {
      await fetch(`/api/indexing/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AsyncJobStatus status={job.status} error={job.error} />

      {output && (
        <>
          {output.error ? (
            <div className="rounded-lg border border-accent-strong bg-accent-soft p-5">
              <p className="font-semibold text-sm">Couldn&apos;t complete the readiness check</p>
              <p className="text-sm text-muted mt-1">{output.error}</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="text-xs text-muted">Checked URL</p>
                <p className="font-semibold break-all">{output.url}</p>
                {output.title && <p className="text-sm text-muted mt-1">Page title: {output.title}</p>}
              </div>

              {output.pdfNote && (
                <div className="rounded-lg border border-accent-strong bg-accent-soft p-4 text-sm">{output.pdfNote}</div>
              )}

              {!output.pdfNote && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <CheckRow ok={output.reachable} label="Publicly reachable" detail={`HTTP ${output.httpStatus ?? "—"}`} />
                  <CheckRow
                    ok={output.metadataOk}
                    label="Citation metadata present"
                    detail={
                      output.metadataOk
                        ? "All required Highwire tags found."
                        : `Missing: ${output.missingTags.join(", ")}`
                    }
                  />
                </div>
              )}

              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="text-sm font-semibold mb-3">Indexing status</p>
                <p className="text-xs text-muted mb-3">
                  Smart Article can&apos;t query Google Scholar directly — set this by hand once you&apos;ve checked
                  Scholar yourself or submitted the URL via Search Console.
                </p>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => updateStatus(opt.key)}
                      disabled={savingStatus}
                      className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                        currentStatus === opt.key
                          ? "border-accent-strong bg-accent-soft"
                          : "border-border-strong hover:border-accent-strong"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-tint/40 p-5 text-sm">
                <p className="font-semibold mb-2">Requesting a crawl</p>
                <ol className="list-decimal list-inside space-y-1 text-muted">
                  <li>Fix any missing metadata above, then re-run this check.</li>
                  <li>Add the URL to a public sitemap if your site has one.</li>
                  <li>
                    Submit the URL for crawling in{" "}
                    <span className="font-semibold text-foreground">Google Search Console</span> (URL Inspection →
                    Request Indexing).
                  </li>
                  <li>Google decides its own crawl timing — this can take days to weeks.</li>
                </ol>
              </div>

              <ExportToolbar
                title="Scholar indexing readiness report"
                sections={[
                  {
                    title: "Readiness report",
                    content: [
                      `URL: ${output.url}`,
                      output.title ? `Title: ${output.title}` : null,
                      `Publicly reachable: ${output.reachable ? "Yes" : "No"} (HTTP ${output.httpStatus ?? "—"})`,
                      `Citation metadata: ${output.metadataOk ? "All present" : `Missing ${output.missingTags.join(", ")}`}`,
                      `Indexing status: ${STATUS_OPTIONS.find((o) => o.key === currentStatus)?.label}`,
                    ]
                      .filter(Boolean)
                      .join("\n"),
                  },
                ]}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
