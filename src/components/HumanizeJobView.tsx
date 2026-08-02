"use client";

import { useJobPolling, type JobState } from "@/hooks/useJobPolling";
import { AsyncJobStatus } from "@/components/AsyncJobStatus";
import { DetectionGauge } from "@/components/DetectionGauge";
import { DiffViewer } from "@/components/DiffViewer";
import { ExportToolbar } from "@/components/ExportToolbar";

interface HumanizeOutput {
  rewritten: string;
  changedPassages: { before: string; after: string }[];
  aiPercentBefore: number;
  aiPercentAfter: number;
}

export function HumanizeJobView({ initial }: { initial: JobState }) {
  const job = useJobPolling("/api/humanize/jobs", initial);
  const output = job.output as HumanizeOutput | null;

  return (
    <div className="flex flex-col gap-6">
      <AsyncJobStatus status={job.status} error={job.error} />

      {output && (
        <>
          <div className="grid sm:grid-cols-2 gap-6 rounded-lg border border-border bg-surface p-6">
            <DetectionGauge aiPercent={output.aiPercentBefore} label="Before" />
            <DetectionGauge aiPercent={output.aiPercentAfter} label="After" />
          </div>

          <div>
            <h2 className="font-serif text-lg font-semibold mb-3">What changed</h2>
            <DiffViewer passages={output.changedPassages} />
          </div>

          <div>
            <h2 className="font-serif text-lg font-semibold mb-3">Rewritten article</h2>
            <p className="rounded-lg border border-border bg-surface p-5 text-sm whitespace-pre-wrap leading-relaxed">
              {output.rewritten}
            </p>
          </div>

          <ExportToolbar
            title="Humanize report"
            sections={[
              { title: "Summary", content: `AI score before: ${output.aiPercentBefore}%\nAI score after: ${output.aiPercentAfter}%` },
              { title: "Rewritten article", content: output.rewritten },
            ]}
          />
        </>
      )}
    </div>
  );
}
