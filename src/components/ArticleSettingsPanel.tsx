"use client";

import { useState } from "react";
import type { ArticleSection } from "@prisma/client";

const WORD_LIMITS = [1000, 2000, 3000, 5000, 10000];
const ACADEMIC_LEVELS = ["Bakalavr", "Magistr", "PhD", "Doktorantura"];
const METHODS = ["Analitik", "Empirik", "Aralash", "Sifat tahlili", "Miqdoriy tahlil"];
const ARTICLE_TYPES = ["Ilmiy maqola", "Referat", "Dissertatsiya bobi", "Konferensiya maqolasi", "Tezis"];

interface Settings {
  wordLimit: number | null;
  academicLevel: string | null;
  method: string | null;
  articleType: string | null;
  includeReferences: boolean;
}

export function ArticleSettingsPanel({
  articleId,
  initial,
  sections,
  onSectionAdded,
  onSectionRemoved,
}: {
  articleId: string;
  initial: Settings;
  sections: ArticleSection[];
  onSectionAdded: (section: ArticleSection) => void;
  onSectionRemoved: (sectionId: string) => void;
}) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function patchSettings(next: Partial<Settings>) {
    const merged = { ...settings, ...next };
    setSettings(merged);
    await fetch(`/api/articles/${articleId}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
  }

  async function addSection() {
    const title = newSectionTitle.trim();
    if (!title) return;
    setAddingSection(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (res.ok) {
        onSectionAdded(data.section);
        setNewSectionTitle("");
      }
    } finally {
      setAddingSection(false);
    }
  }

  async function removeSection(sectionId: string) {
    setRemovingId(sectionId);
    try {
      const res = await fetch(`/api/articles/${articleId}/sections/${sectionId}`, { method: "DELETE" });
      if (res.ok) onSectionRemoved(sectionId);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 h-fit">
      <h3 className="font-serif text-lg font-semibold">Maqola sozlamalari</h3>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">So&apos;z limiti</span>
          <select
            value={settings.wordLimit ?? 5000}
            onChange={(e) => patchSettings({ wordLimit: Number(e.target.value) })}
            className="rounded-md border border-border-strong p-2 text-sm focus:border-accent-strong focus:outline-none"
          >
            {WORD_LIMITS.map((w) => (
              <option key={w} value={w}>
                {w} so&apos;z
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Daraja</span>
          <select
            value={settings.academicLevel ?? ""}
            onChange={(e) => patchSettings({ academicLevel: e.target.value || null })}
            className="rounded-md border border-border-strong p-2 text-sm focus:border-accent-strong focus:outline-none"
          >
            <option value="">—</option>
            {ACADEMIC_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Metod</span>
        <select
          value={settings.method ?? ""}
          onChange={(e) => patchSettings({ method: e.target.value || null })}
          className="rounded-md border border-border-strong p-2 text-sm focus:border-accent-strong focus:outline-none"
        >
          <option value="">—</option>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Maqola turi</span>
        <select
          value={settings.articleType ?? ""}
          onChange={(e) => patchSettings({ articleType: e.target.value || null })}
          className="rounded-md border border-border-strong p-2 text-sm focus:border-accent-strong focus:outline-none"
        >
          <option value="">—</option>
          {ARTICLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Bo&apos;limlar</span>
        <div className="flex flex-wrap gap-1.5">
          {sections.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full bg-tint px-2.5 py-1 text-xs font-medium"
            >
              {s.title}
              <button
                type="button"
                onClick={() => removeSection(s.id)}
                disabled={removingId === s.id}
                aria-label={`${s.title} bo'limini o'chirish`}
                className="text-muted hover:text-accent-strong disabled:opacity-40"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSection();
              }
            }}
            placeholder="Yangi bo'lim nomi"
            className="flex-1 min-w-0 rounded-md border border-border-strong p-1.5 text-xs focus:border-accent-strong focus:outline-none"
          />
          <button
            type="button"
            onClick={addSection}
            disabled={addingSection || !newSectionTitle.trim()}
            className="shrink-0 rounded-md border border-border-strong px-2.5 text-xs font-semibold hover:border-accent-strong disabled:opacity-40"
          >
            + Qo&apos;sh
          </button>
        </div>
      </div>

      <label className="flex items-center justify-between gap-2 text-sm">
        <div>
          <p className="font-semibold">Adabiyotlar kiritish</p>
          <p className="text-xs text-muted">Manbalarni avtomatik qo&apos;shish</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.includeReferences}
          onClick={() => patchSettings({ includeReferences: !settings.includeReferences })}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${settings.includeReferences ? "bg-accent" : "bg-silver"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              settings.includeReferences ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </label>
    </div>
  );
}
