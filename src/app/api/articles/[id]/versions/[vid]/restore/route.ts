import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Article, ArticleSection } from "@prisma/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; vid: string }> }
) {
  const { id, vid } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const version = await prisma.articleVersion.findUnique({ where: { id: vid } });
  if (!version || version.articleId !== id) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  const snapshot = JSON.parse(version.snapshot) as Article & { sections: ArticleSection[] };

  await prisma.$transaction([
    prisma.article.update({
      where: { id },
      data: { title: snapshot.title, field: snapshot.field, language: snapshot.language, status: "DRAFT" },
    }),
    prisma.articleSection.deleteMany({ where: { articleId: id } }),
    prisma.articleSection.createMany({
      data: snapshot.sections.map((s) => ({ articleId: id, key: s.key, title: s.title, order: s.order, content: s.content })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
