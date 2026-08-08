import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { articleStatusBadge, formatThousands, formatUzbekDate } from "@/lib/dashboardStats";

export default async function ArticlesPage() {
  const user = await getCurrentUser();

  const articles = await prisma.article.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { sections: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Maqolalar</p>
        <h1 className="font-serif text-3xl font-semibold mt-1">Barcha maqolalarim</h1>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-muted">Hali maqolalaringiz yo&apos;q.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {articles.map((a) => {
            const wordCount = a.sections.reduce((sum, s) => sum + (s.content.trim() ? s.content.trim().split(/\s+/).length : 0), 0);
            const badge = articleStatusBadge(a.status);
            return (
              <li key={a.id}>
                <Link href={`/editor/${a.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-tint/40 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.title}</p>
                    <p className="text-sm text-muted">
                      {formatUzbekDate(a.updatedAt)} · {formatThousands(wordCount)} so&apos;z
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
