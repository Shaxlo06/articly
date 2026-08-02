import { completeText, hasAnthropicKey } from "@/lib/anthropic";
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

export async function generateSection(input: GenerateSectionInput): Promise<string> {
  if (!hasAnthropicKey()) return mockSection(input);

  const { sectionKey, sectionTitle, topic, field, language, mode, existingContent } = input;
  const existingBlock = existingContent ? `\n\nEXISTING CONTENT:\n${existingContent}` : "";

  return completeText(
    `${MODE_INSTRUCTION[mode]}\n\nSection: ${sectionTitle} (IMRAD key: ${sectionKey})\nResearch topic: ${topic}\nField: ${field}\nWrite in: ${language}${existingBlock}\n\nWrite in formal academic register appropriate for a peer-reviewed journal submission. Output only the section prose, no heading, no meta-commentary.`,
    "You are an academic drafting engine that writes IMRAD-structured research article sections."
  );
}
