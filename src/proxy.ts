import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "sa_session_user";

// Assigns an anonymous session id on first visit so the app has a stable
// owner for articles/jobs/favorites without building real auth (Login/
// Register + Profile Setup are out of scope here). Only touches the cookie —
// no DB access — since Proxy should stay fast and isn't a full session
// management solution.
export function proxy(request: NextRequest) {
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (existing) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(SESSION_COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
