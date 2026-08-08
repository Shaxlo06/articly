import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateStructure } from "@/lib/engine";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({ where: { id }, include: { sections: true } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (article.sections.length > 0) {
    return NextResponse.json({ sections: article.sections.sort((a, b) => a.order - b.order) });
  }

  const skeleton = await generateStructure(article.title, article.field, article.articleType ?? undefined, article.includeReferences);
  await prisma.articleSection.createMany({
    data: skeleton.map((s) => ({ articleId: id, key: s.key, title: s.title, order: s.order, content: "" })),
  });

  const sections = await prisma.articleSection.findMany({ where: { articleId: id }, orderBy: { order: "asc" } });
  return NextResponse.json({ sections });
}
