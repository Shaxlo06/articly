import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { ArticleSource } from "@prisma/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const { wordLimit, academicLevel, method, articleType, includeReferences, source } = (await request.json()) as {
    wordLimit?: number | null;
    academicLevel?: string | null;
    method?: string | null;
    articleType?: string | null;
    includeReferences?: boolean;
    source?: ArticleSource;
  };

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.article.update({
    where: { id },
    data: { wordLimit, academicLevel, method, articleType, includeReferences, source },
  });

  return NextResponse.json({ article: updated });
}
