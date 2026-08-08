import { completeJson, hasAnthropicKey } from "@/lib/anthropic";
import { ABSTRACT_WORD_RANGE, REQUIRED_SECTIONS } from "@/lib/format/config";
import { stripHtmlToText } from "@/lib/format/htmlDocument";
import type { QualityIssue, QualityResult } from "./types";

export interface QualitySection {
  key: string;
  title: string;
  content: string;
}

function isAbstractSection(section: QualitySection): boolean {
  return section.key.toLowerCase() === "abstract" || /abstract/i.test(section.title);
}

function isReferencesSection(section: QualitySection): boolean {
  return section.key.toLowerCase() === "references" || /references|bibliography/i.test(section.title);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const CITATION_PATTERN = /\(([A-Z][a-zA-Z'-]+)(?:\s(?:et al\.|&|and)\s[A-Z][a-zA-Z'-]+)?,\s((?:19|20)\d{2})\)/g;

/**
 * Deterministic, rule-based checks that run regardless of whether the LLM
 * pass is available — the LLM's free-form "formatting" review is useful but
 * not guaranteed to catch these, and these are cheap to check exactly.
 */
export function runFormatChecks(rawSections: QualitySection[]): QualityIssue[] {
  // section.content is HTML (TipTap output) — flatten to plain text before
  // running word counts / citation regex against it.
  const sections = rawSections.map((s) => ({ ...s, content: stripHtmlToText(s.content) }));
  const issues: QualityIssue[] = [];

  const abstract = sections.find(isAbstractSection);
  if (abstract && abstract.content.trim()) {
    const count = wordCount(abstract.content);
    if (count < ABSTRACT_WORD_RANGE.min || count > ABSTRACT_WORD_RANGE.max) {
      issues.push({
        passage: abstract.content.slice(0, 120) + (abstract.content.length > 120 ? "…" : ""),
        issue: `Abstract is ${count} words; standard range is ${ABSTRACT_WORD_RANGE.min}–${ABSTRACT_WORD_RANGE.max}.`,
        suggestion: count < ABSTRACT_WORD_RANGE.min ? "Expand the abstract with more detail on method and findings." : "Tighten the abstract to the core contribution.",
      });
    }
  }

  const presentKeys = new Set(sections.map((s) => s.key.toLowerCase()));
  const presentTitles = sections.map((s) => s.title.toLowerCase());
  for (const required of REQUIRED_SECTIONS) {
    const present = presentKeys.has(required) || presentTitles.some((t) => t.includes(required));
    if (!present) {
      issues.push({
        passage: "(document structure)",
        issue: `No "${required}" section found.`,
        suggestion: `Add a ${required} section — it's expected in standard IMRAD structure.`,
      });
    }
  }

  const references = sections.find(isReferencesSection);
  const refEntries = references
    ? references.content.split(/\n+/).filter((e) => e.trim().length > 0)
    : [];

  if (references && refEntries.length) {
    refEntries.forEach((entry) => {
      if (!/^\s*(\[\d+\]|\d+[.)])/.test(entry)) {
        issues.push({
          passage: entry.slice(0, 120) + (entry.length > 120 ? "…" : ""),
          issue: "Reference entry isn't numbered.",
          suggestion: "Use a numbered, hanging-indent format, e.g. \"1. Author, A. (Year). Title…\".",
        });
      }
    });
  }

  const bodyText = sections
    .filter((s) => !isReferencesSection(s))
    .map((s) => s.content)
    .join("\n");
  const citations = [...bodyText.matchAll(CITATION_PATTERN)];
  const seen = new Set<string>();
  for (const match of citations) {
    const [full, author, year] = match;
    const key = `${author}:${year}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const hasMatchingReference = refEntries.some((entry) => entry.includes(author) && entry.includes(year));
    if (!hasMatchingReference) {
      issues.push({
        passage: full,
        issue: `In-text citation ${full} has no matching entry in References.`,
        suggestion: `Add a reference entry for ${author} (${year}), or correct the citation.`,
      });
    }
  }

  return issues;
}

function mockQuality(text: string, sections?: QualitySection[]): QualityResult {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const style = sentences
    .filter((s) => s.split(/\s+/).length > 40)
    .slice(0, 5)
    .map((s) => ({
      passage: s.slice(0, 120) + (s.length > 120 ? "…" : ""),
      issue: "Sentence is long enough to obscure the main claim.",
      suggestion: "Consider splitting into two sentences.",
    }));

  const passive = sentences
    .filter((s) => /\b(is|are|was|were|been)\s+\w+ed\b/i.test(s))
    .slice(0, 5)
    .map((s) => ({
      passage: s.slice(0, 120) + (s.length > 120 ? "…" : ""),
      issue: "Passive voice.",
      suggestion: "Consider naming the actor directly for a more direct claim.",
    }));

  const formatting = sections ? runFormatChecks(sections) : [];

  return { grammar: [], style: [...style, ...passive], formatting };
}

export async function analyzeQuality(text: string, sections?: QualitySection[]): Promise<QualityResult> {
  const deterministic = sections ? runFormatChecks(sections) : [];

  if (!hasAnthropicKey()) return mockQuality(text, sections);

  const llmResult = await completeJson<QualityResult>(
    `Review this academic article excerpt for grammar errors, style/tone issues, and formatting/citation-consistency problems. For each, quote the exact passage.\n\nTEXT:\n${text}\n\nReturn JSON: { "grammar": [{ "passage": string, "issue": string, "suggestion": string }], "style": [...], "formatting": [...] }`
  );

  return { ...llmResult, formatting: [...deterministic, ...llmResult.formatting] };
}
