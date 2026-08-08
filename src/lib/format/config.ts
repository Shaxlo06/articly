/**
 * Single source of truth for academic document formatting. Every exporter
 * (DOCX/PDF/HTML) and the live preview read these same values, so a change
 * here changes the whole pipeline consistently instead of drifting per format.
 */

export const PAGE_MM = { width: 210, height: 297 }; // A4

export const MARGIN_MM = { top: 25, bottom: 25, left: 30, right: 20 };

export const FONT_FAMILY = "Times New Roman";

export const FONT_SIZE_PT = {
  title: 16,
  author: 12,
  heading1: 14,
  heading2: 13,
  body: 12,
  caption: 10,
};

export const LINE_SPACING = 1.5;

export const ABSTRACT_WORD_RANGE = { min: 150, max: 250 };

export const REQUIRED_SECTIONS = [
  "abstract",
  "introduction",
  "methods",
  "results",
  "discussion",
  "conclusion",
  "references",
] as const;

const MM_PER_INCH = 25.4;

export function mmToPt(mm: number): number {
  return (mm / MM_PER_INCH) * 72;
}

export function mmToTwip(mm: number): number {
  return (mm / MM_PER_INCH) * 1440;
}

export function mmToPx(mm: number, dpi = 96): number {
  return (mm / MM_PER_INCH) * dpi;
}

export const PAGE_PT = { width: mmToPt(PAGE_MM.width), height: mmToPt(PAGE_MM.height) };
export const MARGIN_PT = {
  top: mmToPt(MARGIN_MM.top),
  bottom: mmToPt(MARGIN_MM.bottom),
  left: mmToPt(MARGIN_MM.left),
  right: mmToPt(MARGIN_MM.right),
};
