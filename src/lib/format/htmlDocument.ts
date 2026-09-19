import { FIRST_LINE_INDENT_MM, FONT_FAMILY, FONT_SIZE_PT, LINE_SPACING, MARGIN_MM, PAGE_MM } from "./config";

export interface HtmlDocumentSection {
  title: string;
  content: string;
}

export interface HtmlDocumentPayload {
  title: string;
  authors?: string;
  affiliation?: string;
  email?: string;
  keywords?: string;
  sections: HtmlDocumentSection[];
  watermark?: string;
}

export interface ContentBlock {
  type: "paragraph" | "bullet" | "numbered" | "quote";
  text: string;
}

/** No HTML-escaping library is in package.json — a small manual escaper avoids adding one for four characters. */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function isReferencesSection(section: HtmlDocumentSection): boolean {
  return /references|bibliography/i.test(section.title);
}

function sectionClass(section: HtmlDocumentSection): string {
  if (isReferencesSection(section)) return "references-section";
  if (/^abstract\.?$/i.test(section.title.trim())) return "abstract-section";
  return "article-section";
}

function formattedSectionTitle(title: string): string {
  const trimmed = title.trim().replace(/\.+$/, "");
  if (/^(references|bibliography)$/i.test(trimmed)) return "References";
  return `${trimmed}.`;
}

/**
 * ArticleSection.content is HTML (TipTap's own schema output, or AI text
 * already wrapped by plainTextToHtml below) — never raw third-party input —
 * so it's safe to flatten/re-embed without an extra escaping pass.
 */
export function stripHtmlToText(html: string): string {
  return html
    .replace(/<\/(p|li|div|h[1-6]|blockquote|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

/** Preserves the block/list structure needed by the DOCX and PDF renderers. */
export function parseHtmlBlocks(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const blockPattern = /<(p|div|blockquote|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>|<(ul|ol)\b[^>]*>([\s\S]*?)<\/\3>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  const pushPlainText = (fragment: string, type: ContentBlock["type"] = "paragraph") => {
    const text = stripHtmlToText(fragment);
    for (const line of text.split(/\n+/).map((item) => item.trim()).filter(Boolean)) {
      blocks.push({ type, text: line });
    }
  };

  while ((match = blockPattern.exec(html)) !== null) {
    pushPlainText(html.slice(cursor, match.index));

    if (match[1]) {
      pushPlainText(match[2], match[1].toLowerCase() === "blockquote" ? "quote" : "paragraph");
    } else {
      const listType: ContentBlock["type"] = match[3].toLowerCase() === "ol" ? "numbered" : "bullet";
      const itemPattern = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = itemPattern.exec(match[4])) !== null) pushPlainText(itemMatch[1], listType);
    }

    cursor = blockPattern.lastIndex;
  }

  pushPlainText(html.slice(cursor));
  return blocks.length
    ? blocks
    : stripHtmlToText(html).split(/\n+/).filter(Boolean).map((text) => ({ type: "paragraph" as const, text }));
}

/** Wraps AI-generated plain prose into safe HTML paragraphs before it's stored as ArticleSection.content. */
export function plainTextToHtml(text: string): string {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function referenceListHtml(content: string): string {
  const entries = stripHtmlToText(content).split("\n").filter(Boolean);
  return `<ol class="references">\n${entries
    .map((entry) => `<li>${escapeHtml(entry.replace(/^\s*(\[\d+\]|\d+[.)])\s*/, ""))}</li>`)
    .join("\n")}\n</ol>`;
}

/**
 * Pure string template — no Node-only APIs — so it can run both server-side
 * (export route, via toHtmlBuffer) and client-side (DocumentPreview's live
 * A4 preview) from the exact same renderer, keeping preview and export in sync.
 */
export function buildHtmlDocument(payload: HtmlDocumentPayload): string {
  const { title, authors, affiliation, email, keywords, sections, watermark } = payload;

  const metaLines = [authors, affiliation].filter(Boolean).map((line) => `<p class="meta">${escapeHtml(line!)}</p>`).join("\n");
  const emailHtml = email ? `<p class="meta"><a href="mailto:${escapeHtml(email)}">E-mail: ${escapeHtml(email)}</a></p>` : "";
  const keywordsHtml = keywords
    ? `<p class="keywords"><strong>Keywords:</strong> ${escapeHtml(keywords)}</p>`
    : "";

  const sectionsHtml = sections
    .map(
      (section) => `
      <section class="${sectionClass(section)}">
        <h2>${escapeHtml(formattedSectionTitle(section.title))}</h2>
        ${isReferencesSection(section) ? referenceListHtml(section.content) : section.content}
      </section>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: ${MARGIN_MM.top}mm ${MARGIN_MM.right}mm ${MARGIN_MM.bottom}mm ${MARGIN_MM.left}mm; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: '${FONT_FAMILY}', Times, serif;
    font-size: ${FONT_SIZE_PT.body}pt;
    line-height: ${LINE_SPACING};
    color: #111;
    background: #fff;
  }
  .page {
    width: ${PAGE_MM.width}mm;
    min-height: ${PAGE_MM.height}mm;
    margin: 0 auto;
    padding: ${MARGIN_MM.top}mm ${MARGIN_MM.right}mm ${MARGIN_MM.bottom}mm ${MARGIN_MM.left}mm;
    box-sizing: border-box;
    background: #fff;
  }
  h1 { font-size: ${FONT_SIZE_PT.title}pt; text-align: center; margin: 0 0 0.5em; font-weight: 700; }
  .meta { font-size: ${FONT_SIZE_PT.author}pt; text-align: center; margin: 0.2em 0; }
  .meta a { color: #0645ad; text-decoration: underline; }
  .keywords { font-size: ${FONT_SIZE_PT.body}pt; margin: 1em 0; }
  h2 { font-size: ${FONT_SIZE_PT.heading1}pt; margin: 1.4em 0 0.5em; text-align: left; font-weight: 700; }
  h3 { font-size: ${FONT_SIZE_PT.heading2}pt; margin: 1.2em 0 0.4em; }
  section p { margin: 0 0 0.75em; text-align: justify; text-indent: ${FIRST_LINE_INDENT_MM}mm; }
  .abstract-section p { text-indent: 0; }
  .references-section h2 { text-align: center; }
  section ul, section ol { margin: 0 0 0.75em; padding-left: 1.5em; }
  section blockquote { margin: 0 0 0.75em; padding-left: 1em; border-left: 3px solid #ccc; color: #444; }
  section table { border-collapse: collapse; width: 100%; margin: 0 0 0.75em; }
  section th, section td { border: 1px solid #999; padding: 0.3em 0.5em; text-align: left; }
  section img { max-width: 100%; }
  .references { padding-left: ${FIRST_LINE_INDENT_MM}mm; }
  .references li { padding-left: 0; text-indent: -${FIRST_LINE_INDENT_MM}mm; margin-bottom: 0.5em; }
  .watermark { font-size: ${FONT_SIZE_PT.caption}pt; font-style: italic; text-align: center; color: #666; margin-top: 0.5em; }
</style>
</head>
<body>
  <div class="page">
    <h1>${escapeHtml(title)}</h1>
    ${metaLines}
    ${emailHtml}
    ${watermark ? `<p class="watermark">${escapeHtml(watermark)}</p>` : ""}
    ${keywordsHtml}
    ${sectionsHtml}
  </div>
</body>
</html>`;
}
