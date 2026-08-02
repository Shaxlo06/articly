import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { PlanTier } from "@prisma/client";

// Demo-only: real billing would go through a payment provider webhook, not
// a direct client-triggered plan change. Kept here so the gating logic
// throughout the app (entitlements, export formats, result depth) can
// actually be exercised without wiring up Stripe/etc.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const { plan } = (await request.json()) as { plan: PlanTier };

  await prisma.subscription.update({ where: { userId: user.id }, data: { plan } });
  return NextResponse.json({ plan });
}
