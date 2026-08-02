import Link from "next/link";
import type { PlanTier } from "@prisma/client";

const PLAN_LABEL: Record<PlanTier, string> = {
  FREE: "Free",
  PRO: "Pro",
  MAX: "Max",
};

export function PlanBadge({ plan }: { plan: PlanTier }) {
  return (
    <Link
      href="/account"
      className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-silver-wash px-3 py-1 text-xs font-semibold text-foreground hover:border-accent-strong transition-colors"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      {PLAN_LABEL[plan]} plan
    </Link>
  );
}
