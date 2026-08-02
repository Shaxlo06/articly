"use client";

import { useState } from "react";
import type { Article, ArticleSection } from "@prisma/client";
import { Stepper } from "./Stepper";
import { LanguageSelector } from "./LanguageSelector";
import { SectionEditor } from "./SectionEditor";
import { RecommendationList, type Issue } from "./RecommendationList";
import { VersionHistoryPanel } from "./VersionHistoryPanel";
import { ExportToolbar } from "./ExportToolbar";

const STEPS = [
  { key: "topic", label: "Topic" },
  { key: "language", label: "Language" },
  { key: "structure", label: "Structure" },
  { key: "draft", label: "Draft" },
  { key: "edit", label: "Edit" },
  { key: "analysis", label: "Analysis" },
  { key: "review", label: "Review" },
  { key: "final", label: "Final" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

interface AnalysisResult {
  quality: { grammar: Issue[]; style: Issue[]; formatting: Issue[] };
  plagiarism: { available: boolean; similarityPercent: number | null; note?: string; upgradeTo?: string };
}

export function ArticleWorkspace({ article: initialArticle, sections: initialSections }: { article: Article; sections: ArticleSection[] }) {
  const [step, setStep] = useState<StepKey>(initialSections.length > 0 ? "draft" : "topic");
  const [article, setArticle] = useState(initialArticle);
  const [sections, setSections] = useState(initialSections.sort((a, b) => a.order - b.order));
  const [topic, setTopic] = useState(initialArticle.title);
  const [field, setField] = useState(initialArticle.field);
  const [language, setLanguage] = useState(initialArticle.language);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  function goTo(key: StepKey) {
    setStep(key);
  }
  function next() {
    goTo(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)].key);
  }
  function back() {
    goTo(STEPS[Math.max(stepIndex - 1, 0)].key);
  }

  async function saveTopicAndLanguage() {
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${article.id}/topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, field, language }),
      });
      const data = await res.json();
      if (res.ok) setArticle(data.article);
    } finally {
      setBusy(false);
    }
  }

  async function generateStructure() {
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${article.id}/structure`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setSections(data.sections.sort((a: ArticleSection, b: ArticleSection) => a.order - b.order));
    } finally {
      setBusy(false);
    }
  }

  async function runAnalysis() {
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${article.id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setAnalysis(data);
    } finally {
      setBusy(false);
    }
  }

  async function finalize() {
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${article.id}/finalize`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setArticle(data.article);
    } finally {
      setBusy(false);
    }
  }

  function updateSection(updated: ArticleSection) {
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Edit Article</p>
        <h1 className="font-serif text-3xl font-semibold mt-1 mb-5">{article.title}</h1>
        <Stepper steps={STEPS as unknown as { key: string; label: string }[]} current={step} />
      </div>

      {step === "topic" && (
        <div className="max-w-xl flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">Research topic / working title</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-md border border-border-strong p-3 focus:border-accent-strong focus:outline-none"
              placeholder="e.g. Urban green space and cognitive restoration"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold">Field / specialization</span>
            <input
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="rounded-md border border-border-strong p-3 focus:border-accent-strong focus:outline-none"
            />
          </label>
          <StepActions onNext={next} nextLabel="Continue" busy={busy} />
        </div>
      )}

      {step === "language" && (
        <div className="max-w-xl flex flex-col gap-4">
          <LanguageSelector value={language} onChange={setLanguage} label="Target writing language" />
          <StepActions
            onBack={back}
            onNext={async () => {
              await saveTopicAndLanguage();
              next();
            }}
            nextLabel="Continue"
            busy={busy}
          />
        </div>
      )}

      {step === "structure" && (
        <div className="max-w-xl flex flex-col gap-4">
          {sections.length === 0 ? (
            <>
              <p className="text-sm text-muted">Generate an IMRAD-style section skeleton for this topic and field.</p>
              <button
                onClick={generateStructure}
                disabled={busy}
                className="self-start rounded-md bg-accent px-5 py-2 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50"
              >
                {busy ? "Generating…" : "Generate structure"}
              </button>
            </>
          ) : (
            <ul className="flex flex-col gap-2">
              {sections.map((s) => (
                <li key={s.id} className="rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium">
                  {s.title}
                </li>
              ))}
            </ul>
          )}
          <StepActions onBack={back} onNext={next} nextLabel="Continue" busy={busy} disableNext={sections.length === 0} />
        </div>
      )}

      {(step === "draft" || step === "edit") && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted max-w-2xl">
            {step === "draft"
              ? "Generate a first pass for each section, then move on to polish the prose."
              : "Refine the wording directly, or ask the engine to expand or tighten a section."}
          </p>
          {sections.map((s) => (
            <SectionEditor key={s.id} articleId={article.id} section={s} onChange={updateSection} />
          ))}
          <StepActions onBack={back} onNext={next} nextLabel="Continue" busy={busy} />
        </div>
      )}

      {step === "analysis" && (
        <div className="max-w-2xl flex flex-col gap-4">
          <button
            onClick={runAnalysis}
            disabled={busy}
            className="self-start rounded-md bg-accent px-5 py-2 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50"
          >
            {busy ? "Analyzing…" : "Run analysis"}
          </button>
          {analysis && (
            <div className="rounded-lg border border-border bg-surface p-5 flex flex-col gap-4">
              <Summary label="Grammar issues" count={analysis.quality.grammar.length} />
              <Summary label="Style issues" count={analysis.quality.style.length} />
              <Summary label="Formatting/citation issues" count={analysis.quality.formatting.length} />
              <div className="text-sm">
                {analysis.plagiarism.available ? (
                  <p className="text-muted">{analysis.plagiarism.note}</p>
                ) : (
                  <p className="text-muted">
                    Plagiarism check isn&apos;t included in your plan.{" "}
                    <a href="/account" className="underline font-semibold text-accent-strong">Upgrade</a>
                  </p>
                )}
              </div>
            </div>
          )}
          <StepActions onBack={back} onNext={next} nextLabel="Continue to review" busy={busy} disableNext={!analysis} />
        </div>
      )}

      {step === "review" && analysis && (
        <div className="max-w-2xl flex flex-col gap-6">
          <RecommendationList title="Grammar" issues={analysis.quality.grammar} />
          <RecommendationList title="Style & tone" issues={analysis.quality.style} />
          <RecommendationList title="Formatting & citation consistency" issues={analysis.quality.formatting} />
          <StepActions onBack={back} onNext={next} nextLabel="Continue to final" busy={busy} />
        </div>
      )}

      {step === "final" && (
        <div className="max-w-2xl flex flex-col gap-6">
          {article.status !== "FINAL" ? (
            <button
              onClick={finalize}
              disabled={busy}
              className="self-start rounded-md bg-accent px-6 py-2.5 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50"
            >
              {busy ? "Finalizing…" : "Lock as final version"}
            </button>
          ) : (
            <p className="text-sm font-semibold text-accent-strong">This article is finalized and ready to export.</p>
          )}

          <ExportToolbar
            title={article.title}
            articleId={article.id}
            sections={sections.map((s) => ({ title: s.title, content: s.content }))}
          />

          <VersionHistoryPanel articleId={article.id} />

          <StepActions onBack={back} busy={busy} />
        </div>
      )}
    </div>
  );
}

function Summary({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <span className={`font-semibold ${count > 0 ? "text-accent-strong" : "text-muted"}`}>{count}</span>
    </div>
  );
}

function StepActions({
  onBack,
  onNext,
  nextLabel = "Continue",
  busy,
  disableNext,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  busy?: boolean;
  disableNext?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button onClick={onBack} className="rounded-md border border-border-strong px-5 py-2 font-semibold hover:border-accent-strong">
          Back
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={busy || disableNext}
          className="rounded-md bg-accent px-5 py-2 font-semibold text-ink-fixed hover:brightness-95 disabled:opacity-50"
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}
