import { completeText, hasAnthropicKey } from "@/lib/anthropic";
import { plainTextToHtml, stripHtmlToText } from "@/lib/format/htmlDocument";
import type { GenerateSectionInput } from "./types";

function mockSection({ sectionTitle, topic, field }: GenerateSectionInput): string {
  return `[Sample ${sectionTitle} — add ANTHROPIC_API_KEY for AI-drafted content]\n\nThis section would outline the ${sectionTitle.toLowerCase()} for a ${field} study on "${topic}". Replace this placeholder by configuring the AI Core Engine, then use Regenerate to draft real content here.`;
}

const MODE_INSTRUCTION: Record<GenerateSectionInput["mode"], string> = {
  draft: "Write a first draft of this section from scratch.",
  regenerate: "Write an alternative draft of this section, different in phrasing and structure from a typical first attempt.",
  expand: "Expand the existing section with more supporting detail, without changing its claims or citations.",
  shorten: "Tighten the existing section, cutting redundancy while preserving every claim and citation.",
};

/** section.content (and thus existingContent) is HTML — the model should only ever see/produce plain prose. */
export async function generateSection(input: GenerateSectionInput): Promise<string> {
  if (!hasAnthropicKey()) return plainTextToHtml(mockSection(input));

  const { sectionKey, sectionTitle, topic, field, language, mode, existingContent, wordLimit, academicLevel, method, articleType } = input;
  const existingBlock = existingContent ? `\n\nEXISTING CONTENT:\n${stripHtmlToText(existingContent)}` : "";
  const constraints = [
    wordLimit ? `Target roughly ${wordLimit} words across the whole article, so scale this section's length accordingly.` : null,
    academicLevel ? `Write at a ${academicLevel} academic level.` : null,
    method ? `Research method/approach: ${method}.` : null,
    articleType ? `Document type: ${articleType}.` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const text = await completeText(
    `${MODE_INSTRUCTION[mode]}\n\nSection: ${sectionTitle} (IMRAD key: ${sectionKey})\nResearch topic: ${topic}\nField: ${field}\nWrite in: ${language}${constraints ? `\n${constraints}` : ""}${existingBlock}\n\nWrite in formal academic register appropriate for a peer-reviewed journal submission. Output only the section prose, no heading, no meta-commentary.`,
    "You are an academic drafting engine that writes IMRAD-structured research article sections."
  );

  return plainTextToHtml(text);
}
