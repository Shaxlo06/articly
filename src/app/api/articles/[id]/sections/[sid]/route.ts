import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { id, sid } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as { content?: string; title?: string; order?: number };

  const section = await prisma.articleSection.update({
    where: { id: sid },
    data: body,
  });

  await prisma.article.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ section });
}
