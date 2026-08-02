import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canUseFeature } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { analyzeQuality } from "@/lib/engine";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const article = await prisma.article.findUnique({ where: { id }, include: { sections: true } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fullText = article.sections
    .sort((a, b) => a.order - b.order)
    .map((s) => s.content)
    .join("\n\n");

  const job = await prisma.engineJob.create({
    data: { userId: user.id, articleId: id, type: "ANALYZE_QUALITY", status: "PROCESSING", input: JSON.stringify({}) },
  });

  const quality = await analyzeQuality(fullText);

  const plagiarismEntitlement = canUseFeature(user.subscription, "plagiarismCheck");
  const plagiarism = plagiarismEntitlement.allowed
    ? {
        available: true,
        similarityPercent: null,
        note:
          "Plagiarism detection requires a licensed provider (e.g. Turnitin/iThenticate) or an in-house corpus — not wired up in this build. This placeholder demonstrates the plan gate and UI slot only.",
      }
    : { available: false, upgradeTo: plagiarismEntitlement.upgradeTo };

  await prisma.engineJob.update({
    where: { id: job.id },
    data: { status: "COMPLETED", output: JSON.stringify({ quality, plagiarism }), completedAt: new Date() },
  });

  await prisma.article.update({ where: { id }, data: { status: "IN_REVIEW" } });

  return NextResponse.json({ quality, plagiarism });
}
