"use client";

import { useState } from "react";
import type { ArticleSource } from "@prisma/client";
import { Link, useRouter } from "@/i18n/navigation";
import { ArticleFormatGuide } from "./ArticleFormatGuide";

type CreateMode = Extract<ArticleSource, "SCRATCH" | "UPLOADED">;

export function ArticleFormatEntry() {
  const router = useRouter();
  const [pendingMode, setPendingMode] = useState<CreateMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createArticle(source: CreateMode) {
    setPendingMode(source);
    setError(null);

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.article?.id) {
        throw new Error(result?.error ?? "Maqola yaratib bo‘lmadi. Qayta urinib ko‘ring.");
      }

      router.push(`/editor/${result.article.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Maqola yaratib bo‘lmadi. Qayta urinib ko‘ring.");
      setPendingMode(null);
    }
  }

  const isPending = pendingMode !== null;

  const actions = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <p className="mr-auto text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4e6579]">Maqola bilan ishlashni boshlang</p>
      <button
        type="button"
        onClick={() => createArticle("SCRATCH")}
        disabled={isPending}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-sm bg-[#123f7d] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0d3265] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123f7d] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <ActionIcon name="new" />
        {pendingMode === "SCRATCH" ? "Yaratilmoqda…" : "Yangi maqola yaratish"}
      </button>
      <button
        type="button"
        onClick={() => createArticle("UPLOADED")}
        disabled={isPending}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-sm border border-[#7ea3c5] bg-[#eef5fb] px-3.5 py-2 text-xs font-bold text-[#123f7d] hover:bg-[#dfeefa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123f7d] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <ActionIcon name="upload" />
        {pendingMode === "UPLOADED" ? "Ochilmoqda…" : "Maqola yuklash"}
      </button>
      <Link href="/articles" className="inline-flex min-h-9 items-center justify-center gap-2 rounded-sm px-2.5 py-2 text-xs font-bold text-[#315f86] hover:bg-[#eef5fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123f7d] focus-visible:ring-offset-2">
        <ActionIcon name="folder" /> Mavjud maqolalar
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <ArticleFormatGuide actions={actions} />
      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</div>}
    </div>
  );
}

function ActionIcon({ name }: { name: "new" | "upload" | "folder" }) {
  if (name === "new") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "upload") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v4h14v-4" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5h7l2 2h9v9.5H3z" /></svg>;
}
