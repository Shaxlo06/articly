import type { Journal } from "@prisma/client";

export interface JournalScored {
  journal: Journal;
  matchPercent: number;
  acceptanceEstimate: number;
}

/**
 * Deterministic scoring against the maintained Journal catalog — this is
 * intentionally not an AI call. The catalog itself (Section 6 of the spec)
 * is a separately-updated dataset; only the article's field/keywords come
 * from the Engine's classify/extract-keywords steps upstream.
 */
export function matchJournals(
  articleField: string,
  keywords: string[],
  journals: Journal[]
): JournalScored[] {
  const normalizedKeywords = keywords.map((k) => k.toLowerCase());
  const normalizedField = articleField.toLowerCase();

  const scored = journals.map((journal) => {
    const tags = journal.field.toLowerCase().split(",").map((t) => t.trim());
    const fieldMatch = tags.some((t) => t === normalizedField || t.includes(normalizedField) || normalizedField.includes(t));
    const keywordOverlap = normalizedKeywords.filter((k) => tags.some((t) => t.includes(k) || k.includes(t))).length;
    const overlapRatio = normalizedKeywords.length ? keywordOverlap / normalizedKeywords.length : 0;

    let score = (fieldMatch ? 55 : 15) + overlapRatio * 40;
    // Small, deterministic nudge so results aren't all-identical when overlap ties.
    score += (journal.impactFactor ?? 0) * 1.5;
    const matchPercent = Math.max(5, Math.min(99, Math.round(score)));

    // Acceptance is inversely related to selectivity signals (impact factor,
    // quartile) — always presented to users with an explicit disclaimer.
    const selectivityPenalty = (journal.impactFactor ?? 0) * 4 + (journal.quartile === "Q1" ? 15 : 0);
    const acceptanceEstimate = Math.max(0.05, Math.min(0.9, 0.75 - selectivityPenalty / 100));

    return { journal, matchPercent, acceptanceEstimate };
  });

  return scored.sort((a, b) => b.matchPercent - a.matchPercent);
}
