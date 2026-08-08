type Colorway = "lavender" | "accent" | "green";

const COLOR_CLASSES: Record<Colorway, { bg: string; strong: string }> = {
  lavender: { bg: "bg-lavender-soft", strong: "text-lavender-strong" },
  accent: { bg: "bg-accent-soft", strong: "text-accent-strong" },
  green: { bg: "bg-green-soft", strong: "text-green-strong" },
};

export function StatCard({
  colorway,
  icon,
  value,
  label,
  deltaLabel,
}: {
  colorway: Colorway;
  icon: React.ReactNode;
  value: number | string;
  label: string;
  deltaLabel?: string;
}) {
  const c = COLOR_CLASSES[colorway];

  return (
    <div className={`flex items-center gap-4 rounded-2xl ${c.bg} p-5`}>
      <div className={`h-12 w-12 shrink-0 rounded-full bg-surface flex items-center justify-center ${c.strong}`}>{icon}</div>
      <div>
        <p className="text-2xl font-serif font-bold tabular-nums">{value}</p>
        <p className="text-sm text-muted">{label}</p>
        {deltaLabel && <p className="text-xs font-semibold text-green-strong mt-0.5">{deltaLabel}</p>}
      </div>
    </div>
  );
}
