import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({ where: { id }, include: { sections: true } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.article.update({ where: { id }, data: { status: "FINAL" } });

  const version = await prisma.articleVersion.create({
    data: { articleId: id, label: "Final version", createdBy: "user", snapshot: JSON.stringify(article) },
  });

  await prisma.article.update({ where: { id }, data: { currentVersionId: version.id } });

  return NextResponse.json({ article: updated });
}
