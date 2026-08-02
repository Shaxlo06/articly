"use client";

import { useState } from "react";

export interface Issue {
  passage: string;
  issue: string;
  suggestion: string;
}

export function RecommendationList({ title, issues }: { title: string; issues: Issue[] }) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const visible = issues.map((issue, i) => ({ issue, i })).filter(({ i }) => !dismissed.has(i));

  if (issues.length === 0) {
    return (
      <div>
        <p className="text-sm font-semibold mb-2">{title}</p>
        <p className="text-sm text-muted">No issues found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">{title}</p>
        {visible.length > 0 && (
          <button
            onClick={() => setDismissed(new Set(issues.map((_, i) => i)))}
            className="text-xs font-semibold text-accent-strong hover:underline"
          >
            Accept all
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {visible.map(({ issue, i }) => (
          <li key={i} className="rounded-lg border border-border p-3 text-sm">
            <p className="text-muted italic">&ldquo;{issue.passage}&rdquo;</p>
            <p className="mt-1"><span className="font-semibold">{issue.issue}</span> — {issue.suggestion}</p>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setDismissed((prev) => new Set(prev).add(i))} className="text-xs font-semibold text-accent-strong hover:underline">
                Accept
              </button>
              <button onClick={() => setDismissed((prev) => new Set(prev).add(i))} className="text-xs font-semibold text-muted hover:underline">
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
