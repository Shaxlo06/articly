import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the signed-in Supabase user and the Prisma User row attached to
 * them (created on first login, keyed by Supabase's auth.users.id). Throws
 * if there's no session — every caller lives behind proxy.ts's auth redirect,
 * so reaching this without a session means the matcher didn't cover the
 * route rather than a normal "logged out" state.
 */
export async function getCurrentUser() {
  const user = await getOptionalCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/** Same as getCurrentUser but returns null instead of throwing — for public pages. */
export async function getOptionalCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // Email/password signup passes `name` via signUp's options.data; Google
  // populates `name`/`full_name` itself. Either way we get a real name on
  // first login instead of leaving it blank for the user to fill in later.
  const metadataName = authUser.user_metadata?.name ?? authUser.user_metadata?.full_name ?? "";

  return prisma.user.upsert({
    where: { authId: authUser.id },
    update: {},
    create: {
      authId: authUser.id,
      email: authUser.email ?? `${authUser.id}@users.noreply.articly`,
      name: typeof metadataName === "string" ? metadataName.trim() : "",
      field: "",
      subscription: { create: { plan: "FREE" } },
    },
    include: { subscription: true },
  });
}
