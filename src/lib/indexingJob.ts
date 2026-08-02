import { prisma } from "@/lib/prisma";
import type { ScholarReadinessResult } from "@/lib/engine";

export type ScholarStatus = "NOT_SUBMITTED" | "PENDING" | "INDEXED";

export interface IndexingJobOutput extends ScholarReadinessResult {
  manualStatus: ScholarStatus;
}

/**
 * Shared by the indexing job page (initial server render) and the polling
 * API route. `manualStatus` lives inside the stored EngineJob.output JSON
 * rather than a separate table — Google Scholar's own crawl/index decision
 * can't be checked automatically here, so the user sets it by hand (see
 * README's "honest placeholder" pattern for plagiarism check).
 */
export async function getEnrichedIndexingJob(jobId: string, userId: string) {
  const job = await prisma.engineJob.findUnique({ where: { id: jobId } });
  if (!job || job.userId !== userId) return null;

  if (job.status !== "COMPLETED" || !job.output) {
    return { id: job.id, status: job.status, output: null, error: job.error };
  }

  return {
    id: job.id,
    status: job.status,
    error: job.error,
    output: JSON.parse(job.output) as IndexingJobOutput,
  };
}

export async function setManualStatus(jobId: string, userId: string, status: ScholarStatus) {
  const job = await prisma.engineJob.findUnique({ where: { id: jobId } });
  if (!job || job.userId !== userId || job.type !== "CHECK_SCHOLAR_READINESS" || !job.output) return null;

  const output = JSON.parse(job.output) as IndexingJobOutput;
  output.manualStatus = status;

  await prisma.engineJob.update({ where: { id: jobId }, data: { output: JSON.stringify(output) } });
  return output;
}
