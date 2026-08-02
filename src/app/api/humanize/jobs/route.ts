import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canUseFeature } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { createAndRunJob } from "@/lib/jobs/runJob";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const { text } = (await request.json()) as { text: string };
  if (!text || text.trim().length < 20) {
    return NextResponse.json({ error: "Paste at least a paragraph of text." }, { status: 400 });
  }

  const entitlement = canUseFeature(user.subscription, "humanize", user.subscription.humanizeRunsThisMonth);
  if (!entitlement.allowed) {
    return NextResponse.json(
      { error: "You've used all Humanize runs on your plan this month.", upgradeTo: entitlement.upgradeTo },
      { status: 403 }
    );
  }

  const job = await createAndRunJob({ userId: user.id, type: "HUMANIZE_REWRITE", input: { text } });

  await prisma.subscription.update({
    where: { userId: user.id },
    data: { humanizeRunsThisMonth: { increment: 1 } },
  });

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
}
