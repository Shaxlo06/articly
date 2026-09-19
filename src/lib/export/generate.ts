import {
  AlignmentType,
  convertMillimetersToTwip,
  Document,
  ExternalHyperlink,
  Footer,
  HeadingLevel,
  LevelFormat,
  LineRuleType,
  Packer,
  PageNumber,
  PageOrientation,
  Paragraph,
  TextRun,
  UnderlineType,
} from "docx";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import {
  FIRST_LINE_INDENT_MM,
  FONT_SIZE_PT,
  LINE_SPACING,
  MARGIN_MM,
  MARGIN_PT,
  PAGE_PT,
  mmToPt,
} from "@/lib/format/config";
import { buildHtmlDocument, parseHtmlBlocks, stripHtmlToText, type ContentBlock } from "@/lib/format/htmlDocument";

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
  email?: string;
  keywords?: string;
}

const WATERMARK = (owner: string) => `Prepared with ArticlyApp — owner: ${owner}`;
const DOCX_LINE = Math.round(240 * LINE_SPACING);
const DOCX_BODY_SIZE = FONT_SIZE_PT.body * 2;
const DOCX_INDENT = convertMillimetersToTwip(FIRST_LINE_INDENT_MM);
const PDF_INDENT = mmToPt(FIRST_LINE_INDENT_MM);
const PDF_BLACK = rgb(0, 0, 0);
const PDF_LINK = rgb(0.02, 0.32, 0.68);

function isReferencesSection(section: ExportSection): boolean {
  return /references|bibliography/i.test(section.title);
}

function isAbstractSection(section: ExportSection): boolean {
  return /^abstract\.?$/i.test(section.title.trim());
}

function formattedSectionTitle(title: string): string {
  const trimmed = title.trim().replace(/\.+$/, "");
  if (/^(references|bibliography)$/i.test(trimmed)) return "References";
  return `${trimmed}.`;
}

function stripReferenceNumbering(entry: string): string {
  return entry.replace(/^\s*(\[\d+\]|\d+[.)])\s*/, "");
}

function documentSpacing(after = 120) {
  return { line: DOCX_LINE, lineRule: LineRuleType.AUTO, after } as const;
}

function docxBodyRun(text: string) {
  return new TextRun({ text, font: "Times New Roman", size: DOCX_BODY_SIZE });
}

function docxContentParagraph(block: ContentBlock, abstract: boolean, numberingInstance: number): Paragraph {
  const base = {
    spacing: documentSpacing(),
    alignment: AlignmentType.JUSTIFIED,
    children: [docxBodyRun(block.text)],
  };

  if (block.type === "bullet") {
    return new Paragraph({ ...base, alignment: AlignmentType.LEFT, numbering: { reference: "article-bullets", level: 0 } });
  }
  if (block.type === "numbered") {
    return new Paragraph({ ...base, alignment: AlignmentType.LEFT, numbering: { reference: "article-numbering", level: 0, instance: numberingInstance } });
  }
  if (block.type === "quote") {
    return new Paragraph({ ...base, indent: { left: DOCX_INDENT } });
  }
  return new Paragraph({ ...base, indent: abstract ? undefined : { firstLine: DOCX_INDENT } });
}

export async function toDocxBuffer(payload: ExportPayload): Promise<Buffer> {
  const metaParagraphs: Paragraph[] = [];

  if (payload.authors) {
    metaParagraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: documentSpacing(40),
      children: [new TextRun({ text: payload.authors, bold: true, font: "Times New Roman", size: FONT_SIZE_PT.author * 2 })],
    }));
  }
  if (payload.affiliation) {
    metaParagraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: documentSpacing(40),
      children: [new TextRun({ text: payload.affiliation, font: "Times New Roman", size: FONT_SIZE_PT.author * 2 })],
    }));
  }
  if (payload.email) {
    metaParagraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: documentSpacing(120),
      children: [
        new ExternalHyperlink({
          link: `mailto:${payload.email}`,
          children: [new TextRun({ text: `E-mail: ${payload.email}`, color: "0563C1", underline: { type: UnderlineType.SINGLE }, font: "Times New Roman", size: FONT_SIZE_PT.author * 2 })],
        }),
      ],
    }));
  }

  const keywordsParagraph = payload.keywords
    ? [new Paragraph({
        spacing: { ...documentSpacing(), before: 160 },
        children: [
          new TextRun({ text: "Keywords: ", bold: true, font: "Times New Roman", size: DOCX_BODY_SIZE }),
          docxBodyRun(payload.keywords),
        ],
      })]
    : [];

  const sectionParagraphs = payload.sections.flatMap((section, sectionIndex) => {
    const references = isReferencesSection(section);
    const heading = new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: references ? AlignmentType.CENTER : AlignmentType.LEFT,
      keepNext: true,
      spacing: { line: DOCX_LINE, lineRule: LineRuleType.AUTO, before: 240, after: 100 },
      children: [new TextRun({ text: formattedSectionTitle(section.title), bold: true, font: "Times New Roman", size: FONT_SIZE_PT.heading1 * 2 })],
    });

    if (references) {
      const entries = stripHtmlToText(section.content).split(/\n+/).filter(Boolean);
      return [
        heading,
        ...entries.map((entry) => new Paragraph({
          numbering: { reference: "reference-numbering", level: 0, instance: 1 },
          alignment: AlignmentType.LEFT,
          spacing: documentSpacing(),
          children: [docxBodyRun(stripReferenceNumbering(entry))],
        })),
      ];
    }

    return [
      heading,
      ...parseHtmlBlocks(section.content).map((block) => docxContentParagraph(block, isAbstractSection(section), sectionIndex + 1)),
    ];
  });

  const doc = new Document({
    creator: "ArticlyApp",
    title: payload.title,
    description: WATERMARK(payload.ownerName),
    features: { updateFields: true },
    numbering: {
      config: [
        {
          reference: "article-numbering",
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: DOCX_INDENT, hanging: 360 } } },
          }],
        },
        {
          reference: "article-bullets",
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: DOCX_INDENT, hanging: 360 } } },
          }],
        },
        {
          reference: "reference-numbering",
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: DOCX_INDENT, hanging: DOCX_INDENT } } },
          }],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: DOCX_BODY_SIZE, color: "000000" },
          paragraph: { spacing: documentSpacing() },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: convertMillimetersToTwip(210),
            height: convertMillimetersToTwip(297),
            orientation: PageOrientation.PORTRAIT,
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
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], font: "Times New Roman", size: FONT_SIZE_PT.caption * 2 })],
          })],
        }),
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: documentSpacing(120),
          children: [new TextRun({ text: payload.title, bold: true, font: "Times New Roman", size: FONT_SIZE_PT.title * 2 })],
        }),
        ...metaParagraphs,
        ...keywordsParagraph,
        ...sectionParagraphs,
      ],
    }],
  });

  return Packer.toBuffer(doc);
}

export async function toPdfBuffer(payload: ExportPayload): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
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

  function wrapText(text: string, size: number, useFont: PDFFont, maxWidth: number, firstLineWidth = maxWidth) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";
    let limit = firstLineWidth;
    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (useFont.widthOfTextAtSize(trial, size) > limit && current) {
        lines.push(current);
        current = word;
        limit = maxWidth;
      } else {
        current = trial;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function writeParagraph(text: string, size: number, useFont: PDFFont, opts?: { x?: number; maxWidth?: number; firstLineIndent?: number; color?: ReturnType<typeof rgb> }) {
    const x = opts?.x ?? MARGIN_PT.left;
    const maxWidth = opts?.maxWidth ?? contentWidth;
    const firstLineIndent = opts?.firstLineIndent ?? 0;
    const lineHeight = size * LINE_SPACING;
    const lines = wrapText(text, size, useFont, maxWidth, maxWidth - firstLineIndent);
    lines.forEach((line, index) => {
      ensureSpace(lineHeight);
      page.drawText(line, {
        x: x + (index === 0 ? firstLineIndent : 0),
        y,
        size,
        font: useFont,
        color: opts?.color ?? PDF_BLACK,
      });
      y -= lineHeight;
    });
  }

  function writeCentered(text: string, size: number, useFont: PDFFont, color = PDF_BLACK) {
    const lineHeight = size * LINE_SPACING;
    for (const line of wrapText(text, size, useFont, contentWidth)) {
      ensureSpace(lineHeight);
      const textWidth = useFont.widthOfTextAtSize(line, size);
      page.drawText(line, { x: MARGIN_PT.left + (contentWidth - textWidth) / 2, y, size, font: useFont, color });
      y -= lineHeight;
    }
  }

  function writeEmail(email: string) {
    const label = `E-mail: ${email}`;
    const width = font.widthOfTextAtSize(label, FONT_SIZE_PT.author);
    const x = MARGIN_PT.left + (contentWidth - width) / 2;
    ensureSpace(FONT_SIZE_PT.author * LINE_SPACING);
    page.drawText(label, { x, y, size: FONT_SIZE_PT.author, font, color: PDF_LINK });
    page.drawLine({ start: { x, y: y - 1 }, end: { x: x + width, y: y - 1 }, thickness: 0.5, color: PDF_LINK });
    y -= FONT_SIZE_PT.author * LINE_SPACING;
  }

  function writeLabelledParagraph(label: string, text: string) {
    const size = FONT_SIZE_PT.body;
    const gap = 4;
    const labelWidth = bold.widthOfTextAtSize(label, size);
    const lineHeight = size * LINE_SPACING;
    const lines = wrapText(text, size, font, contentWidth, contentWidth - labelWidth - gap);
    lines.forEach((line, index) => {
      ensureSpace(lineHeight);
      if (index === 0) {
        page.drawText(label, { x: MARGIN_PT.left, y, size, font: bold, color: PDF_BLACK });
        page.drawText(line, { x: MARGIN_PT.left + labelWidth + gap, y, size, font, color: PDF_BLACK });
      } else {
        page.drawText(line, { x: MARGIN_PT.left, y, size, font, color: PDF_BLACK });
      }
      y -= lineHeight;
    });
  }

  function writeListItem(marker: string, text: string) {
    const size = FONT_SIZE_PT.body;
    const lineHeight = size * LINE_SPACING;
    const textX = MARGIN_PT.left + PDF_INDENT;
    const lines = wrapText(text, size, font, contentWidth - PDF_INDENT);
    lines.forEach((line, index) => {
      ensureSpace(lineHeight);
      if (index === 0) page.drawText(marker, { x: MARGIN_PT.left + 8, y, size, font, color: PDF_BLACK });
      page.drawText(line, { x: textX, y, size, font, color: PDF_BLACK });
      y -= lineHeight;
    });
  }

  writeCentered(payload.title, FONT_SIZE_PT.title, bold);
  y -= 4;
  if (payload.authors) writeCentered(payload.authors, FONT_SIZE_PT.author, bold);
  if (payload.affiliation) writeCentered(payload.affiliation, FONT_SIZE_PT.author, font);
  if (payload.email) writeEmail(payload.email);
  y -= 6;

  if (payload.keywords) {
    writeLabelledParagraph("Keywords:", payload.keywords);
    y -= 6;
  }

  for (const section of payload.sections) {
    y -= 7;
    const heading = formattedSectionTitle(section.title);
    if (isReferencesSection(section)) writeCentered(heading, FONT_SIZE_PT.heading1, bold);
    else writeParagraph(heading, FONT_SIZE_PT.heading1, bold);
    y -= 3;

    if (isReferencesSection(section)) {
      stripHtmlToText(section.content).split(/\n+/).filter(Boolean).forEach((entry, index) => {
        writeListItem(`${index + 1}.`, stripReferenceNumbering(entry));
        y -= 2;
      });
      continue;
    }

    let numberedItem = 0;
    for (const block of parseHtmlBlocks(section.content)) {
      if (block.type === "numbered") {
        numberedItem += 1;
        writeListItem(`${numberedItem}.`, block.text);
      } else if (block.type === "bullet") {
        writeListItem("•", block.text);
      } else if (block.type === "quote") {
        numberedItem = 0;
        writeParagraph(block.text, FONT_SIZE_PT.body, font, { x: MARGIN_PT.left + PDF_INDENT, maxWidth: contentWidth - PDF_INDENT });
      } else {
        numberedItem = 0;
        writeParagraph(block.text, FONT_SIZE_PT.body, font, { firstLineIndent: isAbstractSection(section) ? 0 : PDF_INDENT });
      }
      y -= 4;
    }
  }

  pages.forEach((currentPage, index) => {
    const label = `${index + 1}`;
    const width = font.widthOfTextAtSize(label, FONT_SIZE_PT.caption);
    currentPage.drawText(label, {
      x: (pageSize[0] - width) / 2,
      y: MARGIN_PT.bottom / 2,
      size: FONT_SIZE_PT.caption,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
  });

  return Buffer.from(await pdf.save());
}

export function toTxtBuffer(payload: ExportPayload): Buffer {
  const lines = [
    payload.title,
    ...[payload.authors, payload.affiliation, payload.email ? `E-mail: ${payload.email}` : undefined].filter((value): value is string => Boolean(value)),
    "",
    ...(payload.keywords ? [`Keywords: ${payload.keywords}`, ""] : []),
    ...payload.sections.flatMap((section) => [
      formattedSectionTitle(section.title),
      "",
      isReferencesSection(section)
        ? stripHtmlToText(section.content).split(/\n+/).filter(Boolean).map((entry, index) => `${index + 1}. ${stripReferenceNumbering(entry)}`).join("\n")
        : stripHtmlToText(section.content),
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
    email: payload.email,
    keywords: payload.keywords,
    sections: payload.sections,
  });
}

export function toHtmlBuffer(payload: ExportPayload): Buffer {
  return Buffer.from(toHtmlString(payload), "utf-8");
}
