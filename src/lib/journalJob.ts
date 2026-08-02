import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/entitlements";
import type { PlanTier } from "@prisma/client";

/**
 * Shared by the journals job page (initial server render) and the polling
 * API route, so both apply the same plan-based result truncation and
 * favorite-flag enrichment against the same stored EngineJob output.
 */
export async function getEnrichedJournalJob(jobId: string, userId: string, plan: PlanTier) {
  const job = await prisma.engineJob.findUnique({ where: { id: jobId } });
  if (!job || job.userId !== userId) return null;

  if (job.status !== "COMPLETED" || !job.output) {
    return { id: job.id, status: job.status, output: null, error: job.error };
  }

  const raw = JSON.parse(job.output) as {
    field: string;
    keywords: string[];
    matches: { journalId: string; matchPercent: number; acceptanceEstimate: number }[];
  };

  const journals = await prisma.journal.findMany({ where: { id: { in: raw.matches.map((m) => m.journalId) } } });
  const journalById = new Map(journals.map((j) => [j.id, j]));

  const favorites = await prisma.favorite.findMany({ where: { userId, targetType: "JOURNAL" } });
  const favoritedIds = new Set(favorites.map((f) => f.targetId));

  const enriched = raw.matches
    .map((m) => ({ ...m, journal: journalById.get(m.journalId), favorited: favoritedIds.has(m.journalId) }))
    .filter((m) => m.journal);

  const maxResults = PLAN_LIMITS[plan].journalRecommendation.maxResults;
  const limited = maxResults === "all" ? enriched : enriched.slice(0, maxResults as number);

  return {
    id: job.id,
    status: job.status,
    error: job.error,
    output: {
      field: raw.field,
      keywords: raw.keywords,
      totalMatches: enriched.length,
      shownMatches: limited.length,
      matches: limited,
    },
  };
}
