import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ModuleCard } from "@/components/ModuleCard";
import { ActivityFeed, type ActivityItem } from "@/components/ActivityFeed";

const JOB_KIND: Record<string, ActivityItem["kind"]> = {
  HUMANIZE_REWRITE: "Humanize",
  TRANSLATE: "Translate",
  MATCH_JOURNALS: "Journal match",
  CHECK_SCHOLAR_READINESS: "Scholar Indexing",
};

const JOB_HREF_BASE: Record<string, string> = {
  HUMANIZE_REWRITE: "/humanize",
  TRANSLATE: "/translate",
  MATCH_JOURNALS: "/journals",
  CHECK_SCHOLAR_READINESS: "/indexing",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [articles, jobs, exportCount] = await Promise.all([
    prisma.article.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { sections: true },
    }),
    prisma.engineJob.findMany({
      where: {
        userId: user.id,
        type: { in: ["HUMANIZE_REWRITE", "TRANSLATE", "MATCH_JOURNALS", "CHECK_SCHOLAR_READINESS"] },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.exportRecord.count({ where: { article: { ownerId: user.id } } }),
  ]);

  const isEmpty = articles.length === 0 && jobs.length === 0;

  const activityItems: ActivityItem[] = [
    ...articles.map((article) => ({
      id: article.id,
      kind: "Article" as const,
      label: article.title,
      subtitle: `${article.sections.length} sections · ${article.status.toLowerCase().replace("_", " ")}`,
      href: `/editor/${article.id}`,
      timestamp: article.updatedAt.toISOString(),
    })),
    ...jobs.map((job) => {
      const output = job.output ? (JSON.parse(job.output) as Record<string, unknown>) : null;
      let subtitle = job.status === "COMPLETED" ? "Completed" : job.status === "FAILED" ? "Failed" : "Processing…";
      if (job.type === "HUMANIZE_REWRITE" && output) {
        subtitle = `AI score ${output.aiPercentBefore}% → ${output.aiPercentAfter}%`;
      }
      if (job.type === "CHECK_SCHOLAR_READINESS" && output) {
        subtitle = output.error ? "Couldn't reach URL" : output.metadataOk ? "Metadata OK" : "Metadata incomplete";
      }
      const label =
        job.type === "HUMANIZE_REWRITE"
          ? "Humanize job"
          : job.type === "TRANSLATE"
            ? "Translation job"
            : job.type === "MATCH_JOURNALS"
              ? "Journal match run"
              : "Scholar indexing check";
      return {
        id: job.id,
        kind: JOB_KIND[job.type],
        label,
        subtitle,
        href: `${JOB_HREF_BASE[job.type]}/${job.id}`,
        timestamp: job.createdAt.toISOString(),
      };
    }),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const inProgressCount = articles.filter((a) => a.status !== "FINAL" && a.status !== "ARCHIVED").length;
  const latestHumanize = jobs.find((j) => j.type === "HUMANIZE_REWRITE" && j.status === "COMPLETED" && j.output);
  const latestAiScore = latestHumanize
    ? (JSON.parse(latestHumanize.output!) as { aiPercentAfter: number }).aiPercentAfter
    : null;

  const latestIndexing = jobs.find((j) => j.type === "CHECK_SCHOLAR_READINESS" && j.status === "COMPLETED" && j.output);
  const latestIndexingStatus = latestIndexing
    ? (JSON.parse(latestIndexing.output!) as { manualStatus: "NOT_SUBMITTED" | "PENDING" | "INDEXED" }).manualStatus
    : null;
  const INDEXING_LABEL = { NOT_SUBMITTED: "Not submitted", PENDING: "Pending", INDEXED: "Indexed" };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Dashboard</p>
        <h1 className="font-serif text-3xl font-semibold mt-1">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="text-muted mt-2">Pick up where you left off, or start something new below.</p>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-tint/40 p-10 text-center flex flex-col items-center gap-4">
          <h2 className="font-serif text-xl font-semibold">Start your first article</h2>
          <p className="text-muted max-w-md">
            Write from scratch, upload a draft to finish, or bring in an existing article to edit —
            ArticlyApp will guide you the rest of the way.
          </p>
          <Link
            href="/editor/new"
            className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 font-semibold text-ink-fixed hover:brightness-95 transition"
          >
            Start Writing Free
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Stat label="Articles in progress" value={inProgressCount} />
          <Stat label="Articles exported" value={exportCount} />
          <Stat label="Latest AI-detection score" value={latestAiScore !== null ? `${latestAiScore}%` : "—"} />
          <Stat
            label="Scholar indexing status"
            value={latestIndexingStatus ? INDEXING_LABEL[latestIndexingStatus] : "—"}
          />
          <Stat label="Plan" value={user.subscription?.plan ?? "FREE"} />
        </div>
      )}

      <div>
        <h2 className="font-serif text-lg font-semibold mb-4">Modules</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <ModuleCard
            href="/editor/new"
            title="Edit Article"
            description="Draft, structure, and polish a research article from outline to final, export-ready version."
            inProgressCount={inProgressCount}
          />
          <ModuleCard
            href="/humanize/new"
            title="Humanize"
            description="Detect AI-generated signal and rewrite toward a more natural academic voice, meaning intact."
          />
          <ModuleCard
            href="/translate/new"
            title="Academic Translate"
            description="Translate between Uzbek, English, and Russian in formal academic register — structure preserved."
          />
          <ModuleCard
            href="/journals/new"
            title="Journal Recommendation"
            description="Match a finished article against a maintained catalog of journals, ranked by fit."
          />
          <ModuleCard
            href="/indexing/new"
            title="Google Scholar Indexing"
            description="Check a published article's page for the metadata and reachability Google Scholar needs to index it."
          />
        </div>
      </div>

      {!isEmpty && (
        <div>
          <h2 className="font-serif text-lg font-semibold mb-4">Recent activity</h2>
          <ActivityFeed items={activityItems} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-2xl font-serif font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
