"use client";

import { useEffect, useRef, useState } from "react";
import type { ArticleSection } from "@prisma/client";
import { RichTextEditor } from "./RichTextEditor";
import { plainTextToHtml } from "@/lib/format/htmlDocument";

const ACTIONS: { mode: "draft" | "regenerate" | "expand" | "shorten"; label: string }[] = [
  { mode: "draft", label: "Draft with AI" },
  { mode: "regenerate", label: "Regenerate" },
  { mode: "expand", label: "Expand" },
  { mode: "shorten", label: "Shorten" },
];

const AUTOSAVE_DELAY_MS = 4000;

/** Content saved before the rich-text editor existed is plain text, not HTML. */
function isLegacyPlainText(content: string): boolean {
  return content.length > 0 && !content.includes("<");
}

export function SectionEditor({
  articleId,
  section,
  onChange,
}: {
  articleId: string;
  section: ArticleSection;
  onChange: (section: ArticleSection) => void;
}) {
  const [initialContent] = useState(() =>
    isLegacyPlainText(section.content) ? plainTextToHtml(section.content) : section.content
  );
  const [displayContent, setDisplayContent] = useState(initialContent);
  // Bumped only when AI generation replaces the whole document, forcing
  // RichTextEditor to remount with the new seed content — plain typing must
  // NOT bump this, or the editor would lose focus/cursor on every keystroke.
  const [contentVersion, setContentVersion] = useState(0);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const latestContent = useRef(initialContent);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function save(nextContent: string) {
    setSaveState("saving");
    const res = await fetch(`/api/articles/${articleId}/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: nextContent }),
    });
    const data = await res.json();
    setSaveState("saved");
    onChange(data.section);
  }

  function handleUpdate(html: string) {
    latestContent.current = html;
    setDisplayContent(html);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(latestContent.current), AUTOSAVE_DELAY_MS);
  }

  function handleBlur() {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    save(latestContent.current);
  }

  async function runAction(mode: (typeof ACTIONS)[number]["mode"]) {
    setPendingMode(mode);
    try {
      const res = await fetch(`/api/articles/${articleId}/sections/${section.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (res.ok) {
        latestContent.current = data.section.content;
        setDisplayContent(data.section.content);
        setContentVersion((v) => v + 1);
        onChange(data.section);
      }
    } finally {
      setPendingMode(null);
    }
  }

  const isEmpty = displayContent.replace(/<[^>]*>/g, "").trim().length === 0;

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg font-semibold">{section.title}</h3>
        <span className="text-xs text-muted">
          {saveState === "saving" ? "Saqlanmoqda…" : saveState === "saved" ? "Saqlangan" : ""}
        </span>
      </div>

      <RichTextEditor
        key={contentVersion}
        content={displayContent}
        onUpdate={handleUpdate}
        onBlur={handleBlur}
        placeholder={`Write or generate the ${section.title.toLowerCase()} section…`}
      />

      <div className="flex flex-wrap gap-2 mt-3">
        {ACTIONS.filter((a) => a.mode !== "draft" || isEmpty).map((a) => (
          <button
            key={a.mode}
            onClick={() => runAction(a.mode)}
            disabled={pendingMode !== null}
            className="text-xs font-semibold rounded-md border border-border-strong px-3 py-1.5 hover:border-accent-strong disabled:opacity-50 transition-colors"
          >
            {pendingMode === a.mode ? "Working…" : a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
