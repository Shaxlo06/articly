import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getEnrichedJournalJob } from "@/lib/journalJob";
import { PLAN_LIMITS } from "@/lib/entitlements";
import { JournalJobView } from "@/components/JournalJobView";

export default async function JournalJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const user = await getCurrentUser();
  if (!user.subscription) notFound();

  const result = await getEnrichedJournalJob(jobId, user.id, user.subscription.plan);
  if (!result) notFound();

  const advancedFilters = PLAN_LIMITS[user.subscription.plan].journalRecommendation.advancedFilters;

  return (
    <div className="max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Journal Recommendation</p>
      <h1 className="font-serif text-3xl font-semibold mt-1 mb-6">Recommended journals</h1>
      <JournalJobView advancedFilters={advancedFilters} initial={result} />
    </div>
  );
}
