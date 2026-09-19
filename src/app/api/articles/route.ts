import { NextResponse } from "next/server";
import type { ArticleSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type CreateArticleBody = {
  source?: ArticleSource;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = (await request.json().catch(() => ({}))) as CreateArticleBody;
  const source: ArticleSource = body.source === "UPLOADED" ? "UPLOADED" : "SCRATCH";

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

  return NextResponse.json({ article }, { status: 201 });
}
