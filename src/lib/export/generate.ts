import {
  AlignmentType,
  convertMillimetersToTwip,
  Document,
  Footer,
  HeadingLevel,
  LineRuleType,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";
import { PDFDocument, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { FONT_SIZE_PT, LINE_SPACING, MARGIN_MM, MARGIN_PT, PAGE_PT } from "@/lib/format/config";
import { buildHtmlDocument, stripHtmlToText } from "@/lib/format/htmlDocument";

export interface ExportSection {
  title: string;
  content: string;
}

export interface ExportPayload {
  title: string;
  sections: ExportSection[];
  ownerName: string;
  authors?: string;
  affiliation?: string;
  keywords?: string;
}

const WATERMARK = (owner: string) => `Prepared with ArticlyApp — owner: ${owner}`;

function isReferencesSection(section: ExportSection): boolean {
  return /references|bibliography/i.test(section.title);
}

function stripReferenceNumbering(entry: string): string {
  return entry.replace(/^\s*(\[\d+\]|\d+[.)])\s*/, "");
}

/** docx's "auto" line rule takes the multiplier in 240ths-of-a-line units. */
const DOCX_LINE = Math.round(240 * LINE_SPACING);
const DOCX_BODY_SIZE = FONT_SIZE_PT.body * 2; // half-points

/**
 * section.content is HTML (TipTap output). DOCX/PDF/TXT only render plain
 * paragraphs here, so rich formatting (bold/lists/tables) doesn't survive
 * these three exports — only the HTML export and live preview keep it,
 * since buildHtmlDocument renders HTML natively.
 */
function flattenSections(sections: ExportSection[]): ExportSection[] {
  return sections.map((s) => ({ ...s, content: stripHtmlToText(s.content) }));
}

export async function toDocxBuffer(rawPayload: ExportPayload): Promise<Buffer> {
  const payload: ExportPayload = { ...rawPayload, sections: flattenSections(rawPayload.sections) };
  const metaParagraphs = [payload.authors, payload.affiliation]
    .filter((v): v is string => Boolean(v))
    .map(
      (line) =>
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: DOCX_LINE, lineRule: LineRuleType.AUTO },
          children: [new TextRun({ text: line, size: FONT_SIZE_PT.author * 2 })],
        })
    );

  const keywordsParagraph = payload.keywords
    ? [
        new Paragraph({
          spacing: { line: DOCX_LINE, lineRule: LineRuleType.AUTO, before: 200 },
          children: [
            new TextRun({ text: "Keywords: ", bold: true, size: DOCX_BODY_SIZE }),
            new TextRun({ text: payload.keywords, size: DOCX_BODY_SIZE }),
          ],
        }),
      ]
    : [];

  const doc = new Document({
    creator: "ArticlyApp",
    title: payload.title,
    description: WATERMARK(payload.ownerName),
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: DOCX_BODY_SIZE },
          paragraph: { spacing: { line: DOCX_LINE, lineRule: LineRuleType.AUTO } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297),
            },
            margin: {
              top: convertMillimetersToTwip(MARGIN_MM.top),
              bottom: convertMillimetersToTwip(MARGIN_MM.bottom),
              left: convertMillimetersToTwip(MARGIN_MM.left),
              right: convertMillimetersToTwip(MARGIN_MM.right),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES], size: FONT_SIZE_PT.caption * 2 }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: payload.title, bold: true, size: FONT_SIZE_PT.title * 2 })],
          }),
          ...metaParagraphs,
          new Paragraph({
            children: [new TextRun({ text: WATERMARK(payload.ownerName), italics: true, size: FONT_SIZE_PT.caption * 2 })],
          }),
          ...keywordsParagraph,
          ...payload.sections.flatMap((section) => [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 150, line: DOCX_LINE, lineRule: LineRuleType.AUTO },
              children: [new TextRun({ text: section.title, bold: true, size: FONT_SIZE_PT.heading1 * 2 })],
            }),
            ...(isReferencesSection(section)
              ? section.content
                  .split(/\n+/)
                  .filter(Boolean)
                  .map(
                    (entry, i) =>
                      new Paragraph({
                        indent: { left: 360, hanging: 360 },
                        spacing: { line: DOCX_LINE, lineRule: LineRuleType.AUTO },
                        text: `${i + 1}. ${stripReferenceNumbering(entry)}`,
                      })
                  )
              : section.content
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((para) => new Paragraph({ text: para, alignment: AlignmentType.JUSTIFIED })))
          ]),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export async function toPdfBuffer(rawPayload: ExportPayload): Promise<Buffer> {
  const payload: ExportPayload = { ...rawPayload, sections: flattenSections(rawPayload.sections) };
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const pageSize: [number, number] = [PAGE_PT.width, PAGE_PT.height];
  const contentWidth = pageSize[0] - MARGIN_PT.left - MARGIN_PT.right;

  const pages: PDFPage[] = [];
  let page = pdf.addPage(pageSize);
  pages.push(page);
  let y = pageSize[1] - MARGIN_PT.top;

  function ensureSpace(lineHeight: number) {
    if (y - lineHeight < MARGIN_PT.bottom) {
      page = pdf.addPage(pageSize);
      pages.push(page);
      y = pageSize[1] - MARGIN_PT.top;
    }
  }

  function wrapText(text: string, size: number, useFont: typeof font, maxWidth: number) {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (useFont.widthOfTextAtSize(trial, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = trial;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function writeParagraph(text: string, size: number, useFont: typeof font, opts?: { x?: number; maxWidth?: number }) {
    const x = opts?.x ?? MARGIN_PT.left;
    const maxWidth = opts?.maxWidth ?? contentWidth;
    const lineHeight = size * LINE_SPACING;
    for (const line of wrapText(text, size, useFont, maxWidth)) {
      ensureSpace(lineHeight);
      page.drawText(line, { x, y, size, font: useFont, color: rgb(0.09, 0.14, 0.17) });
      y -= lineHeight;
    }
  }

  function writeCentered(text: string, size: number, useFont: typeof font) {
    const lineHeight = size * LINE_SPACING;
    for (const line of wrapText(text, size, useFont, contentWidth)) {
      ensureSpace(lineHeight);
      const textWidth = useFont.widthOfTextAtSize(line, size);
      page.drawText(line, { x: MARGIN_PT.left + (contentWidth - textWidth) / 2, y, size, font: useFont, color: rgb(0.09, 0.14, 0.17) });
      y -= lineHeight;
    }
  }

  writeCentered(payload.title, FONT_SIZE_PT.title, bold);
  y -= 4;
  for (const meta of [payload.authors, payload.affiliation].filter((v): v is string => Boolean(v))) {
    writeCentered(meta, FONT_SIZE_PT.author, font);
  }
  y -= 4;
  writeParagraph(WATERMARK(payload.ownerName), FONT_SIZE_PT.caption, italic);
  y -= 8;

  if (payload.keywords) {
    writeParagraph(`Keywords: ${payload.keywords}`, FONT_SIZE_PT.body, font);
    y -= 8;
  }

  for (const section of payload.sections) {
    y -= 8;
    writeParagraph(section.title, FONT_SIZE_PT.heading1, bold);
    y -= 4;
    if (isReferencesSection(section)) {
      section.content
        .split(/\n+/)
        .filter(Boolean)
        .forEach((entry, i) => {
          writeParagraph(`${i + 1}. ${stripReferenceNumbering(entry)}`, FONT_SIZE_PT.body, font, {
            x: MARGIN_PT.left + 18,
            maxWidth: contentWidth - 18,
          });
          y -= 2;
        });
    } else {
      for (const para of section.content.split(/\n+/).filter(Boolean)) {
        writeParagraph(para, FONT_SIZE_PT.body, font);
        y -= 4;
      }
    }
  }

  const total = pages.length;
  pages.forEach((p, i) => {
    const label = `${i + 1} / ${total}`;
    const width = font.widthOfTextAtSize(label, FONT_SIZE_PT.caption);
    p.drawText(label, {
      x: (pageSize[0] - width) / 2,
      y: MARGIN_PT.bottom / 2,
      size: FONT_SIZE_PT.caption,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export function toTxtBuffer(rawPayload: ExportPayload): Buffer {
  const payload: ExportPayload = { ...rawPayload, sections: flattenSections(rawPayload.sections) };
  const lines = [
    payload.title,
    ...[payload.authors, payload.affiliation].filter((v): v is string => Boolean(v)),
    WATERMARK(payload.ownerName),
    "",
    ...(payload.keywords ? [`Keywords: ${payload.keywords}`, ""] : []),
    ...payload.sections.flatMap((s) => [
      s.title.toUpperCase(),
      "",
      isReferencesSection(s)
        ? s.content
            .split(/\n+/)
            .filter(Boolean)
            .map((entry, i) => `${i + 1}. ${stripReferenceNumbering(entry)}`)
            .join("\n")
        : s.content,
      "",
    ]),
  ];
  return Buffer.from(lines.join("\n"), "utf-8");
}

export function toHtmlString(payload: ExportPayload): string {
  return buildHtmlDocument({
    title: payload.title,
    authors: payload.authors,
    affiliation: payload.affiliation,
    keywords: payload.keywords,
    sections: payload.sections,
    watermark: WATERMARK(payload.ownerName),
  });
}

export function toHtmlBuffer(payload: ExportPayload): Buffer {
  return Buffer.from(toHtmlString(payload), "utf-8");
}
