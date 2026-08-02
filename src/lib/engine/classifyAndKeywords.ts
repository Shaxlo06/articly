import { completeJson, hasAnthropicKey } from "@/lib/anthropic";
import type { ClassifyResult, KeywordResult } from "./types";

const STOPWORDS = new Set(
  "the a an of to in and is are was were for on with as by that this these those from at be have has it its into can may study which we our results were show shows shown paper article using between".split(" ")
);

function mockKeywords(text: string): string[] {
  const freq = new Map<string, number>();
  for (const raw of text.toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? []) {
    if (STOPWORDS.has(raw)) continue;
    freq.set(raw, (freq.get(raw) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

export async function extractKeywords(text: string, fallbackField: string): Promise<KeywordResult> {
  if (!hasAnthropicKey()) return { keywords: mockKeywords(text), field: fallbackField };

  return completeJson<KeywordResult>(
    `Extract 6-10 domain keywords and the primary research field from this article excerpt.\n\nTEXT:\n${text}\n\nReturn JSON: { "keywords": string[], "field": string }`
  );
}

export async function classifyTopic(text: string, fallbackField: string): Promise<ClassifyResult> {
  if (!hasAnthropicKey()) return { field: fallbackField, subfields: [] };

  return completeJson<ClassifyResult>(
    `Classify the research field and up to 3 subfields of this article excerpt.\n\nTEXT:\n${text}\n\nReturn JSON: { "field": string, "subfields": string[] }`
  );
}
