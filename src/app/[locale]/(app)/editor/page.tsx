import { getLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { canUseFeature } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";

/**
 * No more "how would you like to start" chooser screen — landing here reuses
 * the user's existing empty draft (so repeated nav clicks don't spawn junk
 * rows) or creates a fresh one, then drops straight into the workspace. The
 * scratch/edit/complete choice now lives inside ArticleWorkspace itself.
 */
export default async function EditorEntryPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user.subscription) {
    return (
      <div className="max-w-md">
        <p className="text-sm text-muted">Obuna topilmadi. Iltimos qaytadan kiring.</p>
      </div>
    );
  }

  const reusable = await prisma.article.findFirst({
    where: { ownerId: user.id, status: "DRAFT", sections: { none: {} } },
    orderBy: { createdAt: "desc" },
  });

  if (reusable) {
    redirect({ href: `/editor/${reusable.id}`, locale });
  }

  const activeCount = await prisma.article.count({
    where: { ownerId: user.id, status: { in: ["DRAFT", "IN_REVIEW"] } },
  });
  const entitlement = canUseFeature(user.subscription, "editArticle", activeCount);

  if (!entitlement.allowed) {
    return (
      <div className="max-w-md flex flex-col gap-3">
        <h1 className="font-serif text-2xl font-semibold">Faol maqolalar limitiga yetdingiz</h1>
        <p className="text-sm text-muted">
          Joriy rejangizda faol maqolalar soni cheklangan. Davom etish uchun rejangizni oshiring.
        </p>
        <Link href="/account" className="self-start rounded-md bg-accent px-5 py-2.5 font-semibold text-ink-fixed hover:brightness-95 transition">
          Rejani oshirish
        </Link>
      </div>
    );
  }

  const article = await prisma.article.create({
    data: {
      ownerId: user.id,
      title: "Untitled article",
      field: user.field,
      language: user.preferredLanguage,
      source: "SCRATCH",
      status: "DRAFT",
    },
  });

  redirect({ href: `/editor/${article.id}`, locale });
}
