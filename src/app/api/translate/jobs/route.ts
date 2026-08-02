import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canUseFeature } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { createAndRunJob } from "@/lib/jobs/runJob";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const { text, sourceLang, targetLang } = (await request.json()) as {
    text: string;
    sourceLang?: string;
    targetLang: string;
  };

  if (!text || text.trim().length < 20) {
    return NextResponse.json({ error: "Paste at least a paragraph of text." }, { status: 400 });
  }
  if (!targetLang) {
    return NextResponse.json({ error: "Choose a target language." }, { status: 400 });
  }

  const entitlement = canUseFeature(user.subscription, "translate", user.subscription.translateRunsThisMonth);
  if (!entitlement.allowed) {
    return NextResponse.json(
      { error: "You've used all translations on your plan this month.", upgradeTo: entitlement.upgradeTo },
      { status: 403 }
    );
  }

  const job = await createAndRunJob({
    userId: user.id,
    type: "TRANSLATE",
    input: { text, sourceLang: sourceLang ?? "auto", targetLang },
  });

  await prisma.subscription.update({
    where: { userId: user.id },
    data: { translateRunsThisMonth: { increment: 1 } },
  });

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
}
