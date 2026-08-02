import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  const favorites = await prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ favorites });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const { targetType, targetId } = (await request.json()) as { targetType: "JOURNAL" | "ARTICLE"; targetId: string };

  const favorite = await prisma.favorite.upsert({
    where: { userId_targetType_targetId: { userId: user.id, targetType, targetId } },
    update: {},
    create: { userId: user.id, targetType, targetId },
  });

  return NextResponse.json({ favorite }, { status: 201 });
}

// Keyed by the (userId, targetType, targetId) compound unique constraint
// rather than a favorite row id — the client only ever knows the target
// it's toggling, not the Favorite row that represents it.
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  const { targetType, targetId } = (await request.json()) as { targetType: "JOURNAL" | "ARTICLE"; targetId: string };

  await prisma.favorite
    .delete({ where: { userId_targetType_targetId: { userId: user.id, targetType, targetId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
