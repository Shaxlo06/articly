import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createAndRunJob } from "@/lib/jobs/runJob";

// This route fetches whatever URL the user supplies (server-side, in the
// readiness-check engine call), so it's a textbook SSRF vector unless we
// block requests aimed at localhost/private/link-local network ranges.
const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /^\[?fe80:/i,
  /^\[?fc00:/i,
  /^\[?fd/i,
];

function isBlockedHost(hostname: string) {
  return BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname));
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const { url, articleId } = (await request.json()) as { url: string; articleId?: string };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Enter a full URL, including https://" }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http:// and https:// URLs are supported." }, { status: 400 });
  }
  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: "That host can't be checked (internal/private addresses are blocked)." }, { status: 400 });
  }

  const job = await createAndRunJob({
    userId: user.id,
    articleId,
    type: "CHECK_SCHOLAR_READINESS",
    input: { url: parsed.toString() },
  });

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 202 });
}
