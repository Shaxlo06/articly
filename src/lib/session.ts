import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "sa_session_user";

/**
 * Stands in for real auth (Login/Register + Profile Setup are out of scope
 * for this build). `proxy.ts` assigns an anonymous session id cookie on
 * first visit; this upserts a demo User + Free subscription keyed by that
 * id, so the rest of the app has a real, persisted owner to attach
 * articles/jobs/favorites to. Cookie writes can't happen here (Server
 * Components can only read cookies), which is why the id is assigned
 * upstream in Proxy instead.
 */
export async function getCurrentUser() {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    // Proxy didn't run (e.g. matcher miss) — fall back to a per-request user
    // rather than throwing, since this is a demo session, not real auth.
    return prisma.user.create({
      data: {
        email: `researcher-${Date.now()}@example.com`,
        name: "",
        field: "",
        subscription: { create: { plan: "FREE" } },
      },
      include: { subscription: true },
    });
  }

  return prisma.user.upsert({
    where: { id: sessionId },
    update: {},
    create: {
      id: sessionId,
      email: `researcher-${sessionId}@example.com`,
      name: "",
      field: "",
      subscription: { create: { plan: "FREE" } },
    },
    include: { subscription: true },
  });
}
