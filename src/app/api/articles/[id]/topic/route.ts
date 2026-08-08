import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const { topic, field, language, authors, affiliation, keywords } = (await request.json()) as {
    topic: string;
    field: string;
    language: string;
    authors?: string;
    affiliation?: string;
    keywords?: string;
  };

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.article.update({
    where: { id },
    data: { title: topic, field, language, authors, affiliation, keywords },
  });

  return NextResponse.json({ article: updated });
}
