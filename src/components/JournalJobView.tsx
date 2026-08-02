"use client";

import { useJobPolling, type JobState } from "@/hooks/useJobPolling";
import { AsyncJobStatus } from "@/components/AsyncJobStatus";
import { JournalGroupTabs, type JournalResult } from "@/components/JournalGroupTabs";
import { ExportToolbar } from "@/components/ExportToolbar";

interface JournalJobOutput {
  field: string;
  keywords: string[];
  totalMatches: number;
  shownMatches: number;
  matches: JournalResult[];
}

export function JournalJobView({ initial, advancedFilters }: { initial: JobState; advancedFilters: boolean }) {
  const job = useJobPolling("/api/journals/jobs", initial);
  const output = job.output as JournalJobOutput | null;

  return (
    <div className="flex flex-col gap-6">
      <AsyncJobStatus status={job.status} error={job.error} />

      {output && (
        <>
          <div className="rounded-lg border border-border bg-surface p-5 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-muted">Detected field</p>
              <p className="font-semibold">{output.field}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {output.keywords.map((k) => (
                <span key={k} className="rounded-full bg-silver-wash px-2.5 py-1 text-xs">{k}</span>
              ))}
            </div>
          </div>

          {output.shownMatches < output.totalMatches && (
            <p className="text-sm text-muted">
              Showing {output.shownMatches} of {output.totalMatches} matches —{" "}
              <a href="/account" className="underline font-semibold text-accent-strong">upgrade</a> to see the full list.
            </p>
          )}

          <JournalGroupTabs results={output.matches} advancedFilters={advancedFilters} />

          <ExportToolbar
            title="Journal shortlist"
            sections={[
              {
                title: "Recommended journals",
                content: output.matches
                  .map((m) => `${m.journal.name} — ${m.matchPercent}% match, ${m.journal.quartile ?? "n/a"}, IF ${m.journal.impactFactor ?? "n/a"}`)
                  .join("\n"),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}
