export interface ChangedPassage {
  before: string;
  after: string;
}

export function DiffViewer({ passages }: { passages: ChangedPassage[] }) {
  if (passages.length === 0) {
    return <p className="text-sm text-muted">No sentence-level changes detected.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {passages.map((p, i) => (
        <li key={i} className="rounded-lg border border-border overflow-hidden text-sm">
          {p.before && (
            <p className="px-4 py-2 bg-accent-soft">
              <span className="line-through decoration-accent-strong/70">{p.before}</span>
            </p>
          )}
          {p.after && (
            <p className="px-4 py-2 bg-tint/60 border-t border-border">
              {p.after}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
