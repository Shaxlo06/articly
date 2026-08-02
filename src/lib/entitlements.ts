import type { PlanTier, Subscription } from "@prisma/client";

export const PLAN_LIMITS = {
  FREE: {
    editArticle: { maxActiveArticles: 1, aiSectionGenerations: 20 },
    humanize: { runsPerMonth: 2 },
    // "1 language pair" (spec §9) is enforced here as a monthly run cap
    // rather than literally locking one pair — a deliberate MVP
    // interpretation of a rule the spec itself flags as a placeholder.
    translate: { languagePairs: 1, runsPerMonth: 3 },
    journalRecommendation: { maxResults: 3, advancedFilters: false },
    plagiarismCheck: false,
    exportFormats: ["pdf"] as const,
    versionHistory: { maxVersions: 1 },
  },
  PRO: {
    editArticle: { maxActiveArticles: 10, aiSectionGenerations: 200 },
    humanize: { runsPerMonth: 20 },
    translate: { languagePairs: "multiple" as const, runsPerMonth: 30 },
    journalRecommendation: { maxResults: "all" as const, advancedFilters: false },
    plagiarismCheck: true,
    exportFormats: ["docx", "pdf", "txt"] as const,
    versionHistory: { maxVersions: 10 },
  },
  MAX: {
    editArticle: { maxActiveArticles: "unlimited" as const, aiSectionGenerations: "unlimited" as const },
    humanize: { runsPerMonth: "unlimited" as const },
    translate: { languagePairs: "all" as const, priority: true, runsPerMonth: "unlimited" as const },
    journalRecommendation: { maxResults: "all" as const, advancedFilters: true },
    plagiarismCheck: true,
    exportFormats: ["docx", "pdf", "txt"] as const,
    versionHistory: { maxVersions: "unlimited" as const },
  },
} satisfies Record<PlanTier, Record<string, unknown>>;

export type FeatureKey = keyof typeof PLAN_LIMITS.FREE;

export interface EntitlementResult {
  allowed: boolean;
  reason?: "not_in_plan" | "monthly_limit_reached" | "count_limit_reached";
  upgradeTo?: PlanTier;
  limit?: unknown;
}

function nextTier(plan: PlanTier): PlanTier | undefined {
  if (plan === "FREE") return "PRO";
  if (plan === "PRO") return "MAX";
  return undefined;
}

/**
 * Centralized entitlement check — every module action calls this instead of
 * hardcoding plan comparisons. `usageValue` is the caller's current count for
 * whichever monthly counter applies to this feature (e.g.
 * subscription.humanizeRunsThisMonth); features without a monthly counter
 * ignore it.
 */
export function canUseFeature(
  subscription: Pick<Subscription, "plan">,
  featureKey: FeatureKey,
  usageValue = 0
): EntitlementResult {
  const limit = PLAN_LIMITS[subscription.plan][featureKey];

  if (limit === false) {
    return { allowed: false, reason: "not_in_plan", upgradeTo: nextTier(subscription.plan) };
  }

  if (typeof limit === "object" && limit !== null) {
    const monthly = (limit as { runsPerMonth?: number | "unlimited" }).runsPerMonth;
    if (typeof monthly === "number" && usageValue >= monthly) {
      return { allowed: false, reason: "monthly_limit_reached", upgradeTo: nextTier(subscription.plan), limit };
    }

    const maxActive = (limit as { maxActiveArticles?: number | "unlimited" }).maxActiveArticles;
    if (typeof maxActive === "number" && usageValue >= maxActive) {
      return { allowed: false, reason: "count_limit_reached", upgradeTo: nextTier(subscription.plan), limit };
    }
  }

  return { allowed: true, limit };
}

export function canExportFormat(subscription: Pick<Subscription, "plan">, format: "docx" | "pdf" | "txt") {
  const formats = PLAN_LIMITS[subscription.plan].exportFormats as readonly string[];
  return formats.includes(format);
}

export function maxVersionsFor(subscription: Pick<Subscription, "plan">): number | "unlimited" {
  return PLAN_LIMITS[subscription.plan].versionHistory.maxVersions;
}
