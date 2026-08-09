import { Link } from "@/i18n/navigation";
import type { ProjectItem } from "@/lib/dashboardStats";
import { articleStatusBadge, formatThousands, formatUzbekDate } from "@/lib/dashboardStats";

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
    </svg>
  );
}

function statusBadge(item: ProjectItem): { label: string; className: string } {
  if (item.type === "article") {
    return articleStatusBadge(item.status);
  }
  switch (item.status) {
    case "QUEUED":
    case "PROCESSING":
      return { label: "Tarjimada", className: "bg-accent-soft text-accent-strong" };
    case "COMPLETED":
      return { label: "Tarjima tayyor", className: "bg-green-soft text-green-strong" };
    default:
      return { label: "Xatolik", className: "bg-tint text-muted" };
  }
}

export function RecentProjects({ items }: { items: ProjectItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-tint/40 p-10 text-center flex flex-col items-center gap-4">
        <h3 className="font-serif text-xl font-semibold">Hali loyihalaringiz yo&apos;q</h3>
        <p className="text-muted max-w-md">
          Birinchi maqolangizni yarating — u shu yerda, so&apos;nggi loyihalar qatorida ko&apos;rinadi.
        </p>
        <Link
          href="/editor"
          className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 font-semibold text-ink-fixed hover:brightness-95 transition"
        >
          Birinchi maqolangizni yarating
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {items.map((item) => {
        const badge = statusBadge(item);
        const title = item.type === "article" ? item.title : `${item.sourceLang.toUpperCase()} → ${item.targetLang.toUpperCase()} tarjima`;
        const subtitle =
          item.type === "article"
            ? `${formatUzbekDate(item.updatedAt)} · ${formatThousands(item.wordCount)} so'z`
            : formatUzbekDate(item.updatedAt);

        return (
          <Link
            key={`${item.type}-${item.id}`}
            href={item.href}
            className="shrink-0 w-[85vw] max-w-xs sm:w-64 sm:max-w-none flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm hover:border-accent-strong hover:shadow-md transition-all"
          >
            <div className="h-9 w-9 rounded-md bg-tint flex items-center justify-center text-accent-strong">
              <DocIcon />
            </div>
            <p className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{title}</p>
            <p className="text-xs text-muted">{subtitle}</p>
            <span className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
