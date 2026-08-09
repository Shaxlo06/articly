"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Article, ArticleSection, ArticleSource } from "@prisma/client";
import { LanguageSelector } from "./LanguageSelector";
import { SectionEditor } from "./SectionEditor";
import { ArticleSettingsPanel } from "./ArticleSettingsPanel";
import { RecommendationList, type Issue } from "./RecommendationList";
import { VersionHistoryPanel } from "./VersionHistoryPanel";
import { ExportToolbar } from "./ExportToolbar";
import { DocumentPreview } from "./DocumentPreview";

interface AnalysisResult {
  quality: { grammar: Issue[]; style: Issue[]; formatting: Issue[] };
  plagiarism: { available: boolean; similarityPercent: number | null; note?: string; upgradeTo?: string };
}

type InfoFields = {
  topic: string;
  field: string;
  language: string;
  authors: string;
  affiliation: string;
  keywords: string;
};

const SOURCE_OPTIONS: { value: ArticleSource; label: string }[] = [
  { value: "SCRATCH", label: "0 dan yozish" },
  { value: "UPLOADED", label: "Tahrirlash" },
  { value: "PARTIAL", label: "To'ldirish" },
];

export function ArticleWorkspace({ article: initialArticle, sections: initialSections }: { article: Article; sections: ArticleSection[] }) {
  const [article, setArticle] = useState(initialArticle);
  const [sections, setSections] = useState(initialSections.sort((a, b) => a.order - b.order));
  const [topic, setTopic] = useState(initialArticle.title);
  const [field, setField] = useState(initialArticle.field);
  const [language, setLanguage] = useState(initialArticle.language);
  const [authors, setAuthors] = useState(initialArticle.authors ?? "");
  const [affiliation, setAffiliation] = useState(initialArticle.affiliation ?? "");
  const [keywords, setKeywords] = useState(initialArticle.keywords ?? "");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState<"analysis" | "finalize" | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sourceMode, setSourceMode] = useState<ArticleSource>(initialArticle.source);
  const [pastedText, setPastedText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  async function saveInfo(overrides: Partial<InfoFields> = {}) {
    const payload: InfoFields = { topic, field, language, authors, affiliation, keywords, ...overrides };
    const res = await fetch(`/api/articles/${article.id}/topic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) setArticle(data.article);
  }

  async function changeSourceMode(mode: ArticleSource) {
    setSourceMode(mode);
    await fetch(`/api/articles/${article.id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: mode }),
    });
  }

  async function generateFullArticle() {
    setGenError(null);
    if (!topic.trim()) {
      setGenError("Mavzuni kiriting.");
      return;
    }
    if (sourceMode !== "SCRATCH" && pastedText.trim().length < 40) {
      setGenError("Kamida bir necha paragraf matn joylashtiring.");
      return;
    }

    setGenerating(true);
    try {
      if (sourceMode !== "SCRATCH") {
        setGenProgress("Matn tahlil qilinmoqda…");
        const res = await fetch(`/api/articles/${article.id}/segment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pastedText }),
        });
        const data = await res.json();
        if (res.ok) setSections(data.sections.sort((a: ArticleSection, b: ArticleSection) => a.order - b.order));
        else setGenError(data.error ?? "Xatolik yuz berdi.");
      } else {
        setGenProgress("Struktura tayyorlanmoqda…");
        const structRes = await fetch(`/api/articles/${article.id}/structure`, { method: "POST" });
        const structData = await structRes.json();
        if (!structRes.ok) {
          setGenError(structData.error ?? "Xatolik yuz berdi.");
          return;
        }
        const skeleton: ArticleSection[] = structData.sections.sort((a: ArticleSection, b: ArticleSection) => a.order - b.order);
        setSections(skeleton);

        for (let i = 0; i < skeleton.length; i++) {
          setGenProgress(`${skeleton[i].title} yozilmoqda… (${i + 1}/${skeleton.length})`);
          const genRes = await fetch(`/api/articles/${article.id}/sections/${skeleton[i].id}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: "draft" }),
          });
          const genData = await genRes.json();
          if (genRes.ok) {
            setSections((prev) => prev.map((s) => (s.id === genData.section.id ? genData.section : s)));
          }
        }
      }
    } finally {
      setGenerating(false);
      setGenProgress(null);
    }
  }

  async function runAnalysis() {
    setBusy("analysis");
    try {
      const res = await fetch(`/api/articles/${article.id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setAnalysis(data);
    } finally {
      setBusy(null);
    }
  }

  async function finalize() {
    setBusy("finalize");
    try {
      const res = await fetch(`/api/articles/${article.id}/finalize`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setArticle(data.article);
    } finally {
      setBusy(null);
    }
  }

  function updateSection(updated: ArticleSection) {
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  function addSection(section: ArticleSection) {
    setSections((prev) => [...prev, section]);
  }

  function removeSection(sectionId: string) {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">
            Edit Article <span className="text-muted normal-case font-normal">&gt; {topic || "Yangi maqola"}</span>
          </p>
          <h1 className="font-serif text-3xl font-semibold mt-1">{topic || "Untitled article"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAnalysis}
            disabled={busy !== null}
            className="rounded-md border border-border-strong px-4 py-2 text-sm font-semibold hover:border-accent-strong disabled:opacity-50"
          >
            {busy === "analysis" ? "Tahlil qilinmoqda…" : "Tahlil qilish"}
          </button>
          {article.status !== "FINAL" ? (
            <button
              onClick={finalize}
              disabled={busy !== null}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50"
            >
              {busy === "finalize" ? "Yakunlanmoqda…" : "Yakunlash"}
            </button>
          ) : (
            <span className="rounded-md bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-strong">Yakunlangan</span>
          )}
        </div>
      </div>

      {analysis && (
        <div className="rounded-lg border border-border bg-surface p-5 flex flex-col gap-5">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Summary label="Grammar issues" count={analysis.quality.grammar.length} />
            <Summary label="Style issues" count={analysis.quality.style.length} />
            <Summary label="Formatting/citation issues" count={analysis.quality.formatting.length} />
          </div>
          <div className="text-sm">
            {analysis.plagiarism.available ? (
              <p className="text-muted">{analysis.plagiarism.note}</p>
            ) : (
              <p className="text-muted">
                Plagiarism check isn&apos;t included in your plan.{" "}
                <Link href="/account" className="underline font-semibold text-accent-strong">
                  Upgrade
                </Link>
              </p>
            )}
          </div>
          <RecommendationList title="Grammar" issues={analysis.quality.grammar} />
          <RecommendationList title="Style & tone" issues={analysis.quality.style} />
          <RecommendationList title="Formatting & citation consistency" issues={analysis.quality.formatting} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
            <h3 className="font-serif text-lg font-semibold">Maqola ma&apos;lumotlari</h3>

            <div className="flex rounded-md border border-border-strong p-0.5">
              {SOURCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => changeSourceMode(opt.value)}
                  className={`flex-1 rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
                    sourceMode === opt.value ? "bg-accent text-ink-fixed" : "text-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {sourceMode !== "SCRATCH" && (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-semibold">Fayl yuklash yoki matn joylash</span>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={6}
                  placeholder="Mavjud qoralamangizni shu yerga joylashtiring…"
                  className="rounded-md border border-border-strong p-3 text-sm focus:border-accent-strong focus:outline-none"
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Mavzu</span>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value.slice(0, 200))}
                onBlur={() => saveInfo()}
                maxLength={200}
                className="rounded-md border border-border-strong p-3 focus:border-accent-strong focus:outline-none"
                placeholder="e.g. Urban green space and cognitive restoration"
              />
              <span className="self-end text-xs text-muted">{topic.length}/200</span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Field / specialization</span>
              <input
                value={field}
                onChange={(e) => setField(e.target.value)}
                onBlur={() => saveInfo()}
                className="rounded-md border border-border-strong p-3 focus:border-accent-strong focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Author(s)</span>
              <input
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                onBlur={() => saveInfo()}
                placeholder="e.g. Jane Doe, John Smith"
                className="rounded-md border border-border-strong p-3 focus:border-accent-strong focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Affiliation</span>
              <input
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                onBlur={() => saveInfo()}
                placeholder="e.g. Department of Biology, University X"
                className="rounded-md border border-border-strong p-3 focus:border-accent-strong focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Keywords</span>
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value.slice(0, 200))}
                onBlur={() => saveInfo()}
                maxLength={200}
                placeholder="comma-separated, e.g. urban ecology, cognition, restoration"
                className="rounded-md border border-border-strong p-3 focus:border-accent-strong focus:outline-none"
              />
              <span className="self-end text-xs text-muted">{keywords.length}/200</span>
            </label>
            <LanguageSelector
              value={language}
              onChange={(code) => {
                setLanguage(code);
                saveInfo({ language: code });
              }}
              label="Target writing language"
            />
          </div>

          <ArticleSettingsPanel
            articleId={article.id}
            initial={{
              wordLimit: article.wordLimit,
              academicLevel: article.academicLevel,
              method: article.method,
              articleType: article.articleType,
              includeReferences: article.includeReferences,
            }}
            sections={sections}
            onSectionAdded={addSection}
            onSectionRemoved={removeSection}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {sections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border-strong bg-tint/40 p-10 text-center flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-accent-soft flex items-center justify-center text-accent-strong">
                <SparkleIcon />
              </div>
              <h3 className="font-serif text-xl font-semibold">Tadqiqot muhiti tayyor</h3>
              <p className="text-muted max-w-md">Chap panelda mavzuni kiriting va generatsiya tugmasini bosing.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <InfoBadge>⚡ 2–3 daqiqada</InfoBadge>
                <InfoBadge>🅰️ 3 ta tilda</InfoBadge>
                <InfoBadge>📄 PDF / Word</InfoBadge>
              </div>
              {genError && <p className="text-sm text-accent-strong">{genError}</p>}
              <button
                onClick={generateFullArticle}
                disabled={generating}
                className="rounded-md bg-accent px-6 py-2.5 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50"
              >
                {generating ? genProgress ?? "Yaratilmoqda…" : "✨ Maqola yaratish"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Bo&apos;limlarni yozing yoki AI yordamida generatsiya qiling.</p>
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="shrink-0 rounded-md border border-border-strong px-3 py-1.5 text-xs font-semibold hover:border-accent-strong"
                >
                  {showPreview ? "Hide A4 preview" : "Show A4 preview"}
                </button>
              </div>
              <div className={showPreview ? "grid gap-4 xl:grid-cols-2 items-start" : ""}>
                <div className="flex flex-col gap-4">
                  {sections.map((s) => (
                    <SectionEditor key={s.id} articleId={article.id} section={s} onChange={updateSection} />
                  ))}
                </div>
                {showPreview && (
                  <div className="xl:sticky xl:top-4">
                    <DocumentPreview title={topic} authors={authors} affiliation={affiliation} keywords={keywords} sections={sections} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <h3 className="font-serif text-lg font-semibold">Export</h3>
        <ExportToolbar
          title={article.title}
          articleId={article.id}
          sections={sections.map((s) => ({ title: s.title, content: s.content }))}
        />
        <VersionHistoryPanel articleId={article.id} />
      </div>
    </div>
  );
}

function Summary({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-semibold ${count > 0 ? "text-accent-strong" : "text-muted"}`}>{count}</span>
    </div>
  );
}

function InfoBadge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-surface border border-border-strong px-3 py-1 text-xs font-medium">{children}</span>;
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" />
    </svg>
  );
}
