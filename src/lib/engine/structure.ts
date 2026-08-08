import { completeJson, hasAnthropicKey } from "@/lib/anthropic";

export interface StructureSection {
  key: string;
  title: string;
  order: number;
}

const DEFAULT_IMRAD: StructureSection[] = [
  { key: "abstract", title: "Abstract", order: 0 },
  { key: "introduction", title: "Introduction", order: 1 },
  { key: "methods", title: "Methods", order: 2 },
  { key: "results", title: "Results", order: 3 },
  { key: "discussion", title: "Discussion", order: 4 },
  { key: "conclusion", title: "Conclusion", order: 5 },
  { key: "references", title: "References", order: 6 },
];

/** For "write from scratch": propose a section skeleton before any prose exists. */
export async function generateStructure(
  topic: string,
  field: string,
  articleType?: string,
  includeReferences = true
): Promise<StructureSection[]> {
  if (!hasAnthropicKey()) {
    return includeReferences ? DEFAULT_IMRAD : DEFAULT_IMRAD.filter((s) => s.key !== "references");
  }

  const referencesInstruction = includeReferences
    ? 'Start with an "Abstract" section and end with a "References" section.'
    : 'Start with an "Abstract" section. Do not include a "References" section.';
  const typeInstruction = articleType ? ` This is a ${articleType}.` : "";

  const { sections } = await completeJson<{ sections: StructureSection[] }>(
    `Propose an IMRAD-style section skeleton for a ${field} research article on "${topic}".${typeInstruction} ${referencesInstruction} Between them, use the standard Introduction/Methods/Results/Discussion/Conclusion structure unless the field conventionally uses different section names (e.g. Materials and Methods, Literature Review, Related Work) — in that case use the field-appropriate names instead.\n\nReturn JSON: { "sections": [{ "key": string (snake_case), "title": string, "order": number }] }`
  );
  return sections;
}

export interface SegmentedSection extends StructureSection {
  content: string;
}

const HEADING_PATTERNS: [RegExp, string][] = [
  [/^(abstract)\b/i, "abstract"],
  [/^(keywords)\b/i, "keywords"],
  [/^(introduction|background)\b/i, "introduction"],
  [/^(literature review|related work)\b/i, "literature_review"],
  [/^(materials? and methods|methodology|methods)\b/i, "methods"],
  [/^(results|findings)\b/i, "results"],
  [/^(discussion)\b/i, "discussion"],
  [/^(conclusion|conclusions)\b/i, "conclusion"],
  [/^(references|bibliography)\b/i, "references"],
];

function mockSegment(text: string): SegmentedSection[] {
  const lines = text.split(/\n+/);
  const sections: SegmentedSection[] = [];
  let current: SegmentedSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.length < 60 ? HEADING_PATTERNS.find(([pattern]) => pattern.test(trimmed)) : undefined;
    if (match) {
      current = { key: match[1], title: trimmed, order: sections.length, content: "" };
      sections.push(current);
    } else if (current) {
      current.content += (current.content ? "\n" : "") + line;
    } else {
      current = { key: "introduction", title: "Introduction", order: 0, content: line };
      sections.push(current);
    }
  }

  return sections.length ? sections : [{ key: "introduction", title: "Introduction", order: 0, content: text }];
}

/** For "edit existing"/"complete draft": split already-written text into IMRAD sections. */
export async function segmentStructure(text: string): Promise<SegmentedSection[]> {
  if (!hasAnthropicKey()) return mockSegment(text);

  const { sections } = await completeJson<{ sections: SegmentedSection[] }>(
    `Split this research article draft into its IMRAD-style sections, preserving the original prose verbatim inside each section's content (do not summarize or rewrite).\n\nTEXT:\n${text}\n\nReturn JSON: { "sections": [{ "key": string, "title": string, "order": number, "content": string }] }`
  );
  return sections;
}
