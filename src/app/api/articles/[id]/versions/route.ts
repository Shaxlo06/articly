import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { maxVersionsFor } from "@/lib/entitlements";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const versions = await prisma.articleVersion.findMany({ where: { articleId: id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ versions });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const { label, createdBy } = (await request.json()) as { label: string; createdBy?: "user" | "engine" };

  const article = await prisma.article.findUnique({ where: { id }, include: { sections: true } });
  if (!article || article.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const version = await prisma.articleVersion.create({
    data: {
      articleId: id,
      label,
      createdBy: createdBy ?? "user",
      snapshot: JSON.stringify(article),
    },
  });

  // Retention model: keep the plan's most recent N versions, pruning older
  // ones rather than blocking the save — matches the "last N" framing in
  // the plan matrix better than a hard-stop entitlement gate would.
  const max = maxVersionsFor(user.subscription);
  if (max !== "unlimited") {
    const excess = await prisma.articleVersion.findMany({
      where: { articleId: id },
      orderBy: { createdAt: "desc" },
      skip: max,
    });
    if (excess.length > 0) {
      await prisma.articleVersion.deleteMany({ where: { id: { in: excess.map((v) => v.id) } } });
    }
  }

  return NextResponse.json({ version }, { status: 201 });
}
