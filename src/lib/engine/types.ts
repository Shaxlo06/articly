export interface DetectionResult {
  aiPercent: number;
  humanPercent: number;
}

export interface ChangedPassage {
  before: string;
  after: string;
}

export interface HumanizeResult {
  rewritten: string;
  changedPassages: ChangedPassage[];
}

export interface FlaggedSegment {
  original: string;
  translated: string;
  reason: string;
}

export interface TranslateResult {
  translated: string;
  flaggedSegments: FlaggedSegment[];
}

export interface QualityIssue {
  passage: string;
  issue: string;
  suggestion: string;
}

export interface QualityResult {
  grammar: QualityIssue[];
  style: QualityIssue[];
  formatting: QualityIssue[];
}

export interface ClassifyResult {
  field: string;
  subfields: string[];
}

export interface KeywordResult {
  keywords: string[];
  field: string;
}

export type SectionMode = "draft" | "expand" | "shorten" | "regenerate";

export interface GenerateSectionInput {
  sectionKey: string;
  sectionTitle: string;
  topic: string;
  field: string;
  language: string;
  mode: SectionMode;
  existingContent?: string;
}
