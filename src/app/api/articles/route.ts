import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canUseFeature } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { segmentStructure } from "@/lib/engine";
import { plainTextToHtml } from "@/lib/format/htmlDocument";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const { source, existingText } = (await request.json()) as {
    source: "SCRATCH" | "UPLOADED" | "PARTIAL";
    existingText?: string;
  };

  const activeCount = await prisma.article.count({
    where: { ownerId: user.id, status: { in: ["DRAFT", "IN_REVIEW"] } },
  });
  const entitlement = canUseFeature(user.subscription, "editArticle", activeCount);
  if (!entitlement.allowed) {
    return NextResponse.json(
      { error: "You've reached the active-article limit on your plan.", upgradeTo: entitlement.upgradeTo },
      { status: 403 }
    );
  }

  const article = await prisma.article.create({
    data: {
      ownerId: user.id,
      title: "Untitled article",
      field: user.field,
      language: user.preferredLanguage,
      source,
      status: "DRAFT",
    },
  });

  if ((source === "UPLOADED" || source === "PARTIAL") && existingText?.trim()) {
    // segmentStructure returns the user's pasted text verbatim (plain text,
    // not HTML) — wrap it the same way AI-generated content is wrapped, since
    // ArticleSection.content is trusted as HTML everywhere downstream now.
    const segments = await segmentStructure(existingText);
    await prisma.articleSection.createMany({
      data: segments.map((s) => ({
        articleId: article.id,
        key: s.key,
        title: s.title,
        order: s.order,
        content: plainTextToHtml(s.content),
      })),
    });
  }

  return NextResponse.json({ articleId: article.id }, { status: 201 });
}
