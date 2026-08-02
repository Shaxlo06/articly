import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { EngineJobType } from "@prisma/client";

const TYPE_LABEL: Record<EngineJobType, string> = {
  EXTRACT_TEXT: "Text extraction",
  DETECT_LANGUAGE: "Language detection",
  SEGMENT_STRUCTURE: "Structure detection",
  GENERATE_SECTION: "Section draft",
  EXTRACT_KEYWORDS: "Keyword extraction",
  SCORE_AI_DETECTION: "AI detection score",
  CLASSIFY_TOPIC: "Topic classification",
  ANALYZE_QUALITY: "Quality analysis",
  TRANSLATE: "Translation",
  HUMANIZE_REWRITE: "Humanize",
  MATCH_JOURNALS: "Journal match",
  PLAGIARISM_CHECK: "Plagiarism check",
  CHECK_SCHOLAR_READINESS: "Scholar indexing check",
};

const JOB_HREF: Partial<Record<EngineJobType, (job: { id: string; articleId: string | null }) => string>> = {
  HUMANIZE_REWRITE: (job) => `/humanize/${job.id}`,
  TRANSLATE: (job) => `/translate/${job.id}`,
  MATCH_JOURNALS: (job) => `/journals/${job.id}`,
  GENERATE_SECTION: (job) => `/editor/${job.articleId}`,
  ANALYZE_QUALITY: (job) => `/editor/${job.articleId}`,
  CHECK_SCHOLAR_READINESS: (job) => `/indexing/${job.id}`,
};

const FILTERS: { key: EngineJobType | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "HUMANIZE_REWRITE", label: "Humanize" },
  { key: "TRANSLATE", label: "Translate" },
  { key: "MATCH_JOURNALS", label: "Journal match" },
  { key: "GENERATE_SECTION", label: "Section drafts" },
  { key: "ANALYZE_QUALITY", label: "Analysis" },
  { key: "CHECK_SCHOLAR_READINESS", label: "Scholar indexing" },
];

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const user = await getCurrentUser();

  const jobs = await prisma.engineJob.findMany({
    where: { userId: user.id, ...(type && type !== "ALL" ? { type: type as EngineJobType } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { article: { select: { title: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">History</p>
        <h1 className="font-serif text-3xl font-semibold mt-1">All activity</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "ALL" ? "/history" : `/history?type=${f.key}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              (type ?? "ALL") === f.key ? "border-accent-strong bg-accent-soft" : "border-border-strong"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <p className="text-sm text-muted">No activity yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {jobs.map((job) => {
            const href = JOB_HREF[job.type]?.(job);
            const row = (
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">{TYPE_LABEL[job.type]}</p>
                  <p className="font-medium truncate">{job.article?.title ?? "Untitled"}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-sm">
                  <StatusPill status={job.status} />
                  <span className="text-xs text-muted">{new Date(job.createdAt).toLocaleString()}</span>
                </div>
              </div>
            );
            return <li key={job.id}>{href ? <Link href={href}>{row}</Link> : row}</li>;
          })}
        </ul>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "COMPLETED" ? "text-accent-strong" : status === "FAILED" ? "text-accent-strong" : "text-muted";
  return <span className={`font-semibold ${color}`}>{status.toLowerCase()}</span>;
}
