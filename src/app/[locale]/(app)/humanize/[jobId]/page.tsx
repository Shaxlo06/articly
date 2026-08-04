import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { HumanizeJobView } from "@/components/HumanizeJobView";

export default async function HumanizeJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const user = await getCurrentUser();

  const job = await prisma.engineJob.findUnique({ where: { id: jobId } });
  if (!job || job.userId !== user.id) notFound();

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Humanize</p>
      <h1 className="font-serif text-3xl font-semibold mt-1 mb-6">Humanize report</h1>
      <HumanizeJobView
        initial={{
          id: job.id,
          status: job.status,
          output: job.output ? JSON.parse(job.output) : null,
          error: job.error,
        }}
      />
    </div>
  );
}
