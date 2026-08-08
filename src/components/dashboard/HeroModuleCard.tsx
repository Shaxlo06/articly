import { Link } from "@/i18n/navigation";

type Colorway = "accent" | "pink" | "green";

// Tailwind's scanner needs full static class strings — can't build these
// from a template like `bg-${color}-soft` — so the colorway maps to a fixed set.
const COLOR_CLASSES: Record<Colorway, { bg: string; strong: string; iconBg: string }> = {
  accent: { bg: "bg-accent-soft", strong: "text-accent-strong", iconBg: "bg-accent/20" },
  pink: { bg: "bg-pink-soft", strong: "text-pink-strong", iconBg: "bg-pink/20" },
  green: { bg: "bg-green-soft", strong: "text-green-strong", iconBg: "bg-green/20" },
};

export function HeroModuleCard({
  href,
  colorway,
  title,
  subtitle,
  icon,
}: {
  href: string;
  colorway: Colorway;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  const c = COLOR_CLASSES[colorway];

  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between gap-4 sm:gap-6 rounded-2xl ${c.bg} p-5 sm:p-6 min-h-[180px] sm:min-h-[220px] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all`}
    >
      <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full ${c.iconBg} flex items-center justify-center ${c.strong}`}>{icon}</div>

      <div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">{title}</h3>
        <p className="text-sm text-muted mt-1">{subtitle}</p>
      </div>

      <span
        className={`absolute bottom-5 right-5 h-11 w-11 rounded-full bg-surface shadow flex items-center justify-center ${c.strong} transition-transform group-hover:translate-x-0.5`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
