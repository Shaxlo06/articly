import { diffSentences } from "diff";
import { completeText, hasAnthropicKey } from "@/lib/anthropic";
import type { ChangedPassage, HumanizeResult } from "./types";

const FILLER_REWRITES: [RegExp, string][] = [
  [/in order to/gi, "to"],
  [/it is important to note that\s*/gi, ""],
  [/a large number of/gi, "many"],
  [/due to the fact that/gi, "because"],
  [/in the majority of cases/gi, "usually"],
  [/utiliz(e|ed|ing)/gi, "us$1"],
  [/it should be noted that\s*/gi, ""],
];

function mockRewrite(text: string): string {
  let out = text;
  for (const [pattern, replacement] of FILLER_REWRITES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function diffToPassages(original: string, rewritten: string): ChangedPassage[] {
  const parts = diffSentences(original, rewritten);
  const passages: ChangedPassage[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.removed) {
      const next = parts[i + 1];
      passages.push({
        before: part.value.trim(),
        after: next?.added ? next.value.trim() : "",
      });
      if (next?.added) i++;
    } else if (part.added) {
      passages.push({ before: "", after: part.value.trim() });
    }
  }
  return passages.filter((p) => p.before || p.after);
}

export async function humanizeRewrite(text: string): Promise<HumanizeResult> {
  const rewritten = hasAnthropicKey()
    ? await completeText(
        `Rewrite the following academic text to reduce AI-generated-text signal: vary sentence structure, remove generic filler phrasing, and use a more specific authorial voice. Preserve every citation, technical term, number, and the original meaning exactly. Do not shorten or summarize.\n\nTEXT:\n${text}`,
        "You are an academic rewriting engine. Output only the rewritten text, no preamble or explanation."
      )
    : mockRewrite(text);

  return {
    rewritten,
    changedPassages: diffToPassages(text, rewritten),
  };
}
