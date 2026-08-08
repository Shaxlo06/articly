import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateSection } from "@/lib/engine";
import type { SectionMode } from "@/lib/engine/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { id, sid } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const section = await prisma.articleSection.findUnique({ where: { id: sid } });
  if (!section || section.articleId !== id) return NextResponse.json({ error: "Section not found" }, { status: 404 });

  const { mode } = (await request.json()) as { mode: SectionMode };

  const job = await prisma.engineJob.create({
    data: {
      userId: user.id,
      articleId: id,
      type: "GENERATE_SECTION",
      status: "PROCESSING",
      input: JSON.stringify({ sectionKey: section.key, mode }),
    },
  });

  try {
    const content = await generateSection({
      sectionKey: section.key,
      sectionTitle: section.title,
      topic: article.title,
      field: article.field,
      language: article.language,
      mode,
      existingContent: section.content || undefined,
      wordLimit: article.wordLimit ?? undefined,
      academicLevel: article.academicLevel ?? undefined,
      method: article.method ?? undefined,
      articleType: article.articleType ?? undefined,
    });

    const updated = await prisma.articleSection.update({ where: { id: sid }, data: { content } });
    await prisma.engineJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED", output: JSON.stringify({ content }), completedAt: new Date() },
    });

    return NextResponse.json({ section: updated });
  } catch (err) {
    await prisma.engineJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: err instanceof Error ? err.message : "Generation failed", completedAt: new Date() },
    });
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
