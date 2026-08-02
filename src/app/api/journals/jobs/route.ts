import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createAndRunJob } from "@/lib/jobs/runJob";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const { text } = (await request.json()) as { text: string };
  if (!text || text.trim().length < 20) {
    return NextResponse.json({ error: "Paste at least a paragraph of text (ideally the abstract)." }, { status: 400 });
  }

  // Journal Recommendation isn't run-limited in the plan matrix — Free is
  // gated on result depth instead (enforced when the job is read back).
  const job = await createAndRunJob({
    userId: user.id,
    type: "MATCH_JOURNALS",
    input: { text, fallbackField: user.field },
  });

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
}
