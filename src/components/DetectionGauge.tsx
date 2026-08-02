export function DetectionGauge({ aiPercent, label }: { aiPercent: number; label?: string }) {
  const humanPercent = 100 - aiPercent;

  return (
    <div>
      {label && <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{label}</p>}
      <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
        <span className="text-accent-strong">AI {aiPercent}%</span>
        <span className="text-muted">Human {humanPercent}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-silver-wash overflow-hidden flex" role="img" aria-label={`${aiPercent}% AI-detected, ${humanPercent}% human`}>
        <div className="h-full bg-accent transition-all" style={{ width: `${aiPercent}%` }} />
      </div>
    </div>
  );
}
