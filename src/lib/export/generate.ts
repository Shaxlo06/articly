import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface ExportSection {
  title: string;
  content: string;
}

export interface ExportPayload {
  title: string;
  sections: ExportSection[];
  ownerName: string;
}

const WATERMARK = (owner: string) => `Prepared with ArticlyApp — owner: ${owner}`;

export async function toDocxBuffer(payload: ExportPayload): Promise<Buffer> {
  const doc = new Document({
    creator: "ArticlyApp",
    title: payload.title,
    description: WATERMARK(payload.ownerName),
    sections: [
      {
        children: [
          new Paragraph({ text: payload.title, heading: HeadingLevel.TITLE }),
          new Paragraph({
            children: [new TextRun({ text: WATERMARK(payload.ownerName), italics: true, size: 18 })],
          }),
          ...payload.sections.flatMap((section) => [
            new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1 }),
            ...section.content
              .split(/\n+/)
              .filter(Boolean)
              .map((para) => new Paragraph({ text: para })),
          ]),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export async function toPdfBuffer(payload: ExportPayload): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const margin = 56;
  const pageSize: [number, number] = [612, 792];

  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  function ensureSpace(lineHeight: number) {
    if (y - lineHeight < margin) {
      page = pdf.addPage(pageSize);
      y = pageSize[1] - margin;
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

  function writeParagraph(text: string, size: number, useFont: typeof font) {
    for (const line of wrapText(text, size, useFont, pageSize[0] - margin * 2)) {
      ensureSpace(size * 1.4);
      page.drawText(line, { x: margin, y, size, font: useFont, color: rgb(0.09, 0.14, 0.17) });
      y -= size * 1.4;
    }
  }

  writeParagraph(payload.title, 20, bold);
  y -= 6;
  writeParagraph(WATERMARK(payload.ownerName), 9, font);
  y -= 12;

  for (const section of payload.sections) {
    y -= 8;
    writeParagraph(section.title, 13, bold);
    y -= 4;
    for (const para of section.content.split(/\n+/).filter(Boolean)) {
      writeParagraph(para, 11, font);
      y -= 4;
    }
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export function toTxtBuffer(payload: ExportPayload): Buffer {
  const lines = [
    payload.title,
    WATERMARK(payload.ownerName),
    "",
    ...payload.sections.flatMap((s) => [s.title.toUpperCase(), "", s.content, ""]),
  ];
  return Buffer.from(lines.join("\n"), "utf-8");
}
