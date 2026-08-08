import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || "section";
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({ where: { id }, include: { sections: true } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title } = (await request.json()) as { title: string };
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const nextOrder = article.sections.reduce((max, s) => Math.max(max, s.order), -1) + 1;

  const section = await prisma.articleSection.create({
    data: { articleId: id, key: slugify(title), title: title.trim(), order: nextOrder, content: "" },
  });

  return NextResponse.json({ section }, { status: 201 });
}
