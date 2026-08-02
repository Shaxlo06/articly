import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getEnrichedIndexingJob } from "@/lib/indexingJob";
import { IndexingJobView } from "@/components/IndexingJobView";
import type { JobState } from "@/hooks/useJobPolling";

export default async function IndexingJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const user = await getCurrentUser();

  const result = await getEnrichedIndexingJob(jobId, user.id);
  if (!result) notFound();

  return (
    <div className="max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Google Scholar Indexing</p>
      <h1 className="font-serif text-3xl font-semibold mt-1 mb-6">Readiness report</h1>
      <IndexingJobView initial={result as unknown as JobState} />
    </div>
  );
}
