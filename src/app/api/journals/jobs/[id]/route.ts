import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getEnrichedJournalJob } from "@/lib/journalJob";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const result = await getEnrichedJournalJob(id, user.id, user.subscription.plan);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(result);
}
