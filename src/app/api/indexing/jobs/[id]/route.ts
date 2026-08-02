import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getEnrichedIndexingJob, setManualStatus, type ScholarStatus } from "@/lib/indexingJob";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const result = await getEnrichedIndexingJob(id, user.id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(result);
}

const VALID_STATUSES: ScholarStatus[] = ["NOT_SUBMITTED", "PENDING", "INDEXED"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const { status } = (await request.json()) as { status: ScholarStatus };
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const output = await setManualStatus(id, user.id, status);
  if (!output) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ output });
}
