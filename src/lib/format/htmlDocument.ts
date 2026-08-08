import { FONT_FAMILY, FONT_SIZE_PT, LINE_SPACING, MARGIN_MM, PAGE_MM } from "./config";

export interface HtmlDocumentSection {
  title: string;
  content: string;
}

export interface HtmlDocumentPayload {
  title: string;
  authors?: string;
  affiliation?: string;
  keywords?: string;
  sections: HtmlDocumentSection[];
  watermark?: string;
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
  const { title, authors, affiliation, keywords, sections, watermark } = payload;

  const metaLines = [authors, affiliation].filter(Boolean).map((line) => `<p class="meta">${escapeHtml(line!)}</p>`).join("\n");
  const keywordsHtml = keywords
    ? `<p class="keywords"><strong>Keywords:</strong> ${escapeHtml(keywords)}</p>`
    : "";

  const sectionsHtml = sections
    .map(
      (section) => `
      <section>
        <h2>${escapeHtml(section.title)}</h2>
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
  h1 { font-size: ${FONT_SIZE_PT.title}pt; text-align: center; margin: 0 0 0.5em; }
  .meta { font-size: ${FONT_SIZE_PT.author}pt; text-align: center; margin: 0.2em 0; }
  .keywords { font-size: ${FONT_SIZE_PT.body}pt; margin: 1em 0; }
  h2 { font-size: ${FONT_SIZE_PT.heading1}pt; margin: 1.4em 0 0.5em; }
  h3 { font-size: ${FONT_SIZE_PT.heading2}pt; margin: 1.2em 0 0.4em; }
  section p { margin: 0 0 0.75em; text-align: justify; }
  section ul, section ol { margin: 0 0 0.75em; padding-left: 1.5em; }
  section blockquote { margin: 0 0 0.75em; padding-left: 1em; border-left: 3px solid #ccc; color: #444; }
  section table { border-collapse: collapse; width: 100%; margin: 0 0 0.75em; }
  section th, section td { border: 1px solid #999; padding: 0.3em 0.5em; text-align: left; }
  section img { max-width: 100%; }
  .references { padding-left: 1.5em; }
  .references li { padding-left: 1.5em; text-indent: -1.5em; margin-bottom: 0.5em; }
  .watermark { font-size: ${FONT_SIZE_PT.caption}pt; font-style: italic; text-align: center; color: #666; margin-top: 0.5em; }
</style>
</head>
<body>
  <div class="page">
    <h1>${escapeHtml(title)}</h1>
    ${metaLines}
    ${watermark ? `<p class="watermark">${escapeHtml(watermark)}</p>` : ""}
    ${keywordsHtml}
    ${sectionsHtml}
  </div>
</body>
</html>`;
}
