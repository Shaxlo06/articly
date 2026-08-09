import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { segmentStructure } from "@/lib/engine";
import { plainTextToHtml } from "@/lib/format/htmlDocument";

/** Turns pasted/uploaded draft text into sections — the "Tahrirlash"/"To'ldirish" path for the one-click generate button. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({ where: { id }, include: { sections: true } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { text } = (await request.json()) as { text?: string };
  if (!text?.trim() || text.trim().length < 40) {
    return NextResponse.json({ error: "Paste at least a few paragraphs so we can detect the structure." }, { status: 400 });
  }

  if (article.sections.length > 0) {
    return NextResponse.json({ sections: article.sections.sort((a, b) => a.order - b.order) });
  }

  const segments = await segmentStructure(text);
  await prisma.articleSection.createMany({
    data: segments.map((s) => ({
      articleId: id,
      key: s.key,
      title: s.title,
      order: s.order,
      // segmentStructure returns plain text verbatim — wrap it the same way
      // AI-generated content is wrapped, since content is trusted as HTML everywhere downstream.
      content: plainTextToHtml(s.content),
    })),
  });

  const sections = await prisma.articleSection.findMany({ where: { articleId: id }, orderBy: { order: "asc" } });
  return NextResponse.json({ sections });
}
