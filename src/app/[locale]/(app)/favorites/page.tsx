import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { JournalCard } from "@/components/JournalCard";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const favorites = await prisma.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  const journalFavorites = favorites.filter((f) => f.targetType === "JOURNAL");
  const articleFavorites = favorites.filter((f) => f.targetType === "ARTICLE");

  const journals = await prisma.journal.findMany({ where: { id: { in: journalFavorites.map((f) => f.targetId) } } });
  const articles = await prisma.article.findMany({ where: { id: { in: articleFavorites.map((f) => f.targetId) }, ownerId: user.id } });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Favorites</p>
        <h1 className="font-serif text-3xl font-semibold mt-1">Saved journals &amp; articles</h1>
      </div>

      <div>
        <h2 className="font-serif text-lg font-semibold mb-4">Journals</h2>
        {journals.length === 0 ? (
          <p className="text-sm text-muted">
            No saved journals yet — star one from a{" "}
            <Link href="/journals/new" className="underline font-semibold text-accent-strong">Journal Recommendation</Link> run.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {journals.map((j) => (
              <JournalCard key={j.id} journal={j} favorited />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-serif text-lg font-semibold mb-4">Articles</h2>
        {articles.length === 0 ? (
          <p className="text-sm text-muted">No saved articles yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {articles.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted">{a.status.toLowerCase().replace("_", " ")}</p>
                </div>
                <Link href={`/editor/${a.id}`} className="text-sm font-semibold text-accent-strong hover:underline">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
