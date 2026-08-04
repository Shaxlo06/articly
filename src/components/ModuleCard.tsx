import { Link } from "@/i18n/navigation";

export function ModuleCard({
  href,
  title,
  description,
  inProgressCount,
}: {
  href: string;
  title: string;
  description: string;
  inProgressCount?: number;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-sm hover:border-accent-strong hover:shadow-md transition-all"
    >
      {typeof inProgressCount === "number" && inProgressCount > 0 && (
        <span className="absolute top-4 right-4 rounded-full bg-accent-soft text-accent-strong text-xs font-semibold px-2 py-0.5">
          {inProgressCount} in progress
        </span>
      )}
      <h3 className="font-serif text-xl font-semibold pr-20">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
      <span className="mt-auto text-sm font-semibold text-accent-strong inline-flex items-center gap-1 pt-2">
        Open
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
