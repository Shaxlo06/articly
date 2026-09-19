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

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-2xl border border-[#cbd8e6] bg-white shadow-[0_14px_40px_rgba(31,65,101,0.07)] dark:border-border dark:bg-surface">
        <div className="grid gap-5 px-5 py-5 sm:px-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2a628d] dark:text-[#91c4e7]">Edit Article</p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-[#173b60] sm:text-3xl dark:text-[#d8ecfa]">Article Format</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Yozishni boshlashdan oldin akademik format talablarini ko‘ring, so‘ng yangi maqola yarating yoki mavjud matnni tahrirlash uchun yuklash rejimini oching.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:max-w-[520px] lg:justify-end">
            <button
              type="button"
              onClick={() => createArticle("SCRATCH")}
              disabled={isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#214f76] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173b60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#214f76] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              <ActionIcon name="new" />
              {pendingMode === "SCRATCH" ? "Yaratilmoqda…" : "Yangi maqola yaratish"}
            </button>
            <button
              type="button"
              onClick={() => createArticle("UPLOADED")}
              disabled={isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#8aa7bd] bg-[#f3f8fc] px-4 py-2.5 text-sm font-semibold text-[#173b60] transition-colors hover:border-[#214f76] hover:bg-[#e8f2f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#214f76] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:border-border-strong dark:bg-[#142630] dark:text-[#d8ecfa]"
            >
              <ActionIcon name="upload" />
              {pendingMode === "UPLOADED" ? "Ochilmoqda…" : "Maqola yuklash"}
            </button>
            <Link
              href="/articles"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#315f86] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#214f76] focus-visible:ring-offset-2 dark:text-[#9bc7e5]"
            >
              <ActionIcon name="folder" />
              Mavjud maqolalar
            </Link>
          </div>
        </div>

        {error && (
          <div className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 sm:px-7 lg:px-8 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
            {error}
          </div>
        )}
      </section>

      <ArticleFormatGuide />
    </div>
  );
}

function ActionIcon({ name }: { name: "new" | "upload" | "folder" }) {
  if (name === "new") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (name === "upload") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v4h14v-4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5h7l2 2h9v9.5H3z" />
    </svg>
  );
}
