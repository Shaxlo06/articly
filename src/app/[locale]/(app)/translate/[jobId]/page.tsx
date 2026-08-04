import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TranslateJobView } from "@/components/TranslateJobView";

export default async function TranslateJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const user = await getCurrentUser();

  const job = await prisma.engineJob.findUnique({ where: { id: jobId } });
  if (!job || job.userId !== user.id) notFound();

  const input = JSON.parse(job.input) as { text: string };

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Academic Translate</p>
      <h1 className="font-serif text-3xl font-semibold mt-1 mb-6">Translation preview</h1>
      <TranslateJobView
        originalText={input.text}
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
