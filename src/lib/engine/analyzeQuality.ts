import { completeJson, hasAnthropicKey } from "@/lib/anthropic";
import type { QualityResult } from "./types";

function mockQuality(text: string): QualityResult {
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

  return { grammar: [], style, formatting: passive };
}

export async function analyzeQuality(text: string): Promise<QualityResult> {
  if (!hasAnthropicKey()) return mockQuality(text);

  return completeJson<QualityResult>(
    `Review this academic article excerpt for grammar errors, style/tone issues, and formatting/citation-consistency problems. For each, quote the exact passage.\n\nTEXT:\n${text}\n\nReturn JSON: { "grammar": [{ "passage": string, "issue": string, "suggestion": string }], "style": [...], "formatting": [...] }`
  );
}
