import { after } from "next/server";
import type { EngineJobType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  analyzeQuality,
  checkScholarReadiness,
  classifyTopic,
  extractKeywords,
  generateSection,
  humanizeRewrite,
  matchJournals,
  scoreAiDetection,
  translateText,
} from "@/lib/engine";
import type { GenerateSectionInput } from "@/lib/engine/types";

type JobInput = Record<string, unknown>;
type JobOutput = object;

async function execute(type: EngineJobType, input: JobInput): Promise<JobOutput> {
  switch (type) {
    case "SCORE_AI_DETECTION":
      return scoreAiDetection(input.text as string);

    case "HUMANIZE_REWRITE": {
      const before = await scoreAiDetection(input.text as string);
      const { rewritten, changedPassages } = await humanizeRewrite(input.text as string);
      const after = await scoreAiDetection(rewritten);
      return { rewritten, changedPassages, aiPercentBefore: before.aiPercent, aiPercentAfter: after.aiPercent };
    }

    case "TRANSLATE": {
      const result = await translateText(
        input.text as string,
        (input.sourceLang as string) ?? "auto",
        input.targetLang as string
      );
      return { ...result, sourceLang: input.sourceLang, targetLang: input.targetLang };
    }

    case "MATCH_JOURNALS": {
      const field = await classifyTopic(input.text as string, (input.fallbackField as string) ?? "General");
      const kw = await extractKeywords(input.text as string, field.field);
      const journals = await prisma.journal.findMany();
      const matches = matchJournals(field.field, kw.keywords, journals);
      return {
        field: field.field,
        keywords: kw.keywords,
        matches: matches.map((m) => ({
          journalId: m.journal.id,
          matchPercent: m.matchPercent,
          acceptanceEstimate: m.acceptanceEstimate,
        })),
      };
    }

    case "ANALYZE_QUALITY":
      return analyzeQuality(input.text as string);

    case "CHECK_SCHOLAR_READINESS": {
      const result = await checkScholarReadiness(input.url as string);
      return { ...result, manualStatus: "NOT_SUBMITTED" as const };
    }

    case "GENERATE_SECTION":
      return { content: await generateSection(input as unknown as GenerateSectionInput) };

    default:
      throw new Error(`No handler wired for job type ${type}`);
  }
}

export async function processJob(jobId: string) {
  const job = await prisma.engineJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  await prisma.engineJob.update({ where: { id: jobId }, data: { status: "PROCESSING" } });

  try {
    const output = await execute(job.type, JSON.parse(job.input));
    await prisma.engineJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED", output: JSON.stringify(output), completedAt: new Date() },
    });
  } catch (err) {
    await prisma.engineJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: err instanceof Error ? err.message : "Unknown engine error",
        completedAt: new Date(),
      },
    });
  }
}

/**
 * Creates a QUEUED job row and schedules processing to run after the
 * response is sent (via `next/server`'s `after`), so the route can return
 * `{ jobId }` immediately and the client polls `GET /jobs/:id` for status.
 * There's no durable queue behind this — fine for this scale, but a real
 * deployment should swap `after` for a proper worker/queue so jobs survive
 * a crashed request.
 */
export async function createAndRunJob(params: {
  userId: string;
  articleId?: string;
  type: EngineJobType;
  input: JobInput;
}) {
  const job = await prisma.engineJob.create({
    data: {
      userId: params.userId,
      articleId: params.articleId,
      type: params.type,
      status: "QUEUED",
      input: JSON.stringify(params.input),
    },
  });

  after(() => processJob(job.id));

  return job;
}
