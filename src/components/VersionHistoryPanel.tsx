"use client";

import { useEffect, useState } from "react";
import type { ArticleVersion } from "@prisma/client";

export function VersionHistoryPanel({ articleId, onRestored }: { articleId: string; onRestored?: () => void }) {
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch(`/api/articles/${articleId}/versions`);
    const data = await res.json();
    setVersions(data.versions ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/articles/${articleId}/versions`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setVersions(data.versions ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  async function saveVersion() {
    setLoading(true);
    try {
      await fetch(`/api/articles/${articleId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: `Manual save — ${new Date().toLocaleString()}` }),
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function restore(vid: string) {
    setLoading(true);
    try {
      await fetch(`/api/articles/${articleId}/versions/${vid}/restore`, { method: "POST" });
      onRestored?.();
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg font-semibold">Versions</h3>
        <button
          onClick={saveVersion}
          disabled={loading}
          className="text-xs font-semibold rounded-md border border-border-strong px-3 py-1.5 hover:border-accent-strong disabled:opacity-50"
        >
          Save version
        </button>
      </div>
      {versions.length === 0 ? (
        <p className="text-sm text-muted">No saved versions yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {versions.map((v) => (
            <li key={v.id} className="flex items-center justify-between text-sm border-t border-border pt-2">
              <div>
                <p className="font-medium">{v.label}</p>
                <p className="text-xs text-muted">{new Date(v.createdAt).toLocaleString()} · {v.createdBy}</p>
              </div>
              <button onClick={() => restore(v.id)} disabled={loading} className="text-xs font-semibold text-accent-strong hover:underline">
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
