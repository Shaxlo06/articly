import { Link } from "@/i18n/navigation";

export interface ActivityItem {
  id: string;
  kind: "Article" | "Humanize" | "Translate" | "Journal match" | "Scholar Indexing";
  label: string;
  subtitle: string;
  href: string;
  timestamp: string;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted rounded-lg border border-dashed border-border p-6 text-center">
        No activity yet — start from one of the modules above and it will show up here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-strong">
              {item.kind}
            </div>
            <p className="font-medium truncate">{item.label}</p>
            <p className="text-sm text-muted truncate">{item.subtitle}</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs text-muted">{timeAgo(item.timestamp)}</span>
            <Link
              href={item.href}
              className="text-sm font-semibold text-accent-strong hover:underline"
            >
              Resume
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
