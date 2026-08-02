import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { EngineJobType } from "@prisma/client";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const type = searchParams.get("type") as EngineJobType | null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const jobs = await prisma.engineJob.findMany({
    where: {
      userId: user.id,
      ...(type ? { type } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { article: { select: { title: true } } },
  });

  return NextResponse.json({ jobs });
}
