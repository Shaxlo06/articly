import { completeJson, hasAnthropicKey } from "@/lib/anthropic";
import type { TranslateResult } from "./types";

export { SUPPORTED_LANGUAGES } from "@/lib/languages";
export type { LanguageCode } from "@/lib/languages";

function mockTranslate(text: string, targetLang: string): TranslateResult {
  return {
    translated: `[Mock translation to ${targetLang} — add ANTHROPIC_API_KEY for a real academic translation]\n\n${text}`,
    flaggedSegments: [],
  };
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslateResult> {
  if (!hasAnthropicKey()) return mockTranslate(text, targetLang);

  return completeJson<TranslateResult>(
    `Translate the following research article text from ${sourceLang} to ${targetLang} using formal academic register (not casual or literal word-for-word translation). Preserve headings, table/formula placeholders, and citation markers exactly as-is — do not translate citation keys or numbers. Map domain-specific terminology to its standard scientific equivalent in the target language.\n\nFor any segment where a domain term is ambiguous or you are not confident in the standard target-language equivalent, add it to flaggedSegments instead of silently guessing.\n\nTEXT:\n${text}\n\nReturn JSON: { "translated": string, "flaggedSegments": [{ "original": string, "translated": string, "reason": string }] }`,
    "You are an academic translation engine preserving scientific register and document structure."
  );
}
