import type { Journal } from "@prisma/client";
import { FavoriteToggle } from "./FavoriteToggle";

export function JournalCard({
  journal,
  matchPercent,
  acceptanceEstimate,
  favorited,
}: {
  journal: Journal;
  matchPercent?: number;
  acceptanceEstimate?: number;
  favorited: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-semibold leading-snug">{journal.name}</h3>
          <p className="text-xs text-muted mt-1">{journal.field}</p>
        </div>
        <FavoriteToggle targetType="JOURNAL" targetId={journal.id} initialFavorited={favorited} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {matchPercent != null && <span className="rounded-full bg-accent-soft text-accent-strong font-semibold px-2.5 py-1">{matchPercent}% match</span>}
        {journal.quartile && <span className="rounded-full bg-silver-wash px-2.5 py-1 font-semibold">{journal.quartile}</span>}
        {journal.impactFactor != null && <span className="rounded-full bg-silver-wash px-2.5 py-1">IF {journal.impactFactor.toFixed(1)}</span>}
        {journal.citeScore != null && <span className="rounded-full bg-silver-wash px-2.5 py-1">CiteScore {journal.citeScore.toFixed(1)}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm pt-1 border-t border-border">
        <div>
          <p className="text-muted text-xs">Typical review time</p>
          <p className="font-semibold">{journal.avgReviewWeeks ? `${journal.avgReviewWeeks} weeks` : "—"}</p>
        </div>
        {acceptanceEstimate != null && (
          <div>
            <p className="text-muted text-xs">Estimated acceptance</p>
            <p className="font-semibold">{Math.round(acceptanceEstimate * 100)}%</p>
          </div>
        )}
      </div>
      {acceptanceEstimate != null && (
        <p className="text-[11px] text-muted leading-snug">
          Acceptance is a rough estimate from journal selectivity signals, not a guarantee.
        </p>
      )}

      <a
        href={journal.websiteUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 text-sm font-semibold text-accent-strong hover:underline self-start"
      >
        Visit journal website ↗
      </a>
    </div>
  );
}
