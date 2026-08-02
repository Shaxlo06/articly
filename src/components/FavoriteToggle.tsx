"use client";

import { useState } from "react";

export function FavoriteToggle({
  targetType,
  targetId,
  initialFavorited,
}: {
  targetType: "JOURNAL" | "ARTICLE";
  targetId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const next = !favorited;
    setFavorited(next);
    try {
      await fetch("/api/favorites", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className="shrink-0 h-8 w-8 rounded-full border border-border-strong flex items-center justify-center hover:border-accent-strong transition-colors disabled:opacity-60"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill={favorited ? "var(--accent)" : "none"} stroke="currentColor" strokeWidth="1.4">
        <path d="M8 13.5s-5.5-3.3-5.5-7.3A3.2 3.2 0 0 1 8 4.2a3.2 3.2 0 0 1 5.5 2c0 4-5.5 7.3-5.5 7.3Z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
