"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Journal, JournalCategory } from "@prisma/client";
import { JournalCard } from "./JournalCard";

export interface JournalResult {
  journal: Journal;
  matchPercent: number;
  acceptanceEstimate: number;
  favorited: boolean;
}

const CATEGORY_LABEL: Record<JournalCategory, string> = {
  OAK_REPUBLIC: "OAK Republic",
  OAK_INTERNATIONAL: "OAK International",
  PRESTIGIOUS: "Internationally Prestigious",
  IMPACT_FACTOR: "Impact-Factor Journals",
  SCOPUS: "Scopus-Indexed",
};

type SortKey = "match" | "impactFactor" | "acceptance";

export function JournalGroupTabs({ results, advancedFilters }: { results: JournalResult[]; advancedFilters: boolean }) {
  const [tab, setTab] = useState<JournalCategory | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("match");

  const categoriesPresent = useMemo(
    () => Array.from(new Set(results.map((r) => r.journal.category))),
    [results]
  );

  const filtered = useMemo(() => {
    const scoped = tab === "ALL" ? results : results.filter((r) => r.journal.category === tab);
    const sorted = [...scoped].sort((a, b) => {
      if (sort === "impactFactor") return (b.journal.impactFactor ?? 0) - (a.journal.impactFactor ?? 0);
      if (sort === "acceptance") return b.acceptanceEstimate - a.acceptanceEstimate;
      return b.matchPercent - a.matchPercent;
    });
    return sorted;
  }, [results, tab, sort]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab("ALL")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${tab === "ALL" ? "border-accent-strong bg-accent-soft" : "border-border-strong"}`}
          >
            All
          </button>
          {categoriesPresent.map((cat) => (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${tab === cat ? "border-accent-strong bg-accent-soft" : "border-border-strong"}`}
            >
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        {advancedFilters ? (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-xs font-semibold rounded-md border border-border-strong px-2 py-1.5"
          >
            <option value="match">Sort: Best match</option>
            <option value="impactFactor">Sort: Impact factor</option>
            <option value="acceptance">Sort: Acceptance likelihood</option>
          </select>
        ) : (
          <span className="text-xs text-muted">
            Sort options are a <Link href="/account" className="underline font-semibold text-accent-strong">Max plan</Link> feature
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <JournalCard
            key={r.journal.id}
            journal={r.journal}
            matchPercent={r.matchPercent}
            acceptanceEstimate={r.acceptanceEstimate}
            favorited={r.favorited}
          />
        ))}
      </div>
    </div>
  );
}
