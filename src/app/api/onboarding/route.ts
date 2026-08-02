import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const { name, institution, field, preferredLanguage } = (await request.json()) as {
    name: string;
    institution: string;
    field: string;
    preferredLanguage: string;
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name.trim(),
      institution: institution.trim() || null,
      field: field.trim(),
      preferredLanguage,
      onboardedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
