export interface ScholarReadinessResult {
  url: string;
  title: string | null;
  reachable: boolean;
  httpStatus: number | null;
  contentType: string | null;
  metadataOk: boolean;
  presentTags: string[];
  missingTags: string[];
  pdfNote: string | null;
  error: string | null;
}

const REQUIRED_TAGS = [
  "citation_title",
  "citation_author",
  "citation_publication_date",
  "citation_journal_title",
  "citation_pdf_url",
];

/**
 * A real check, not an AI mock: fetches the given URL and scans the HTML for
 * Highwire Press citation meta tags Google Scholar looks for. No third-party
 * API involved — this is the same signal a crawler would see.
 */
export async function checkScholarReadiness(url: string): Promise<ScholarReadinessResult> {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const contentType = res.headers.get("content-type");

    if (!res.ok) {
      return {
        url,
        title: null,
        reachable: false,
        httpStatus: res.status,
        contentType,
        metadataOk: false,
        presentTags: [],
        missingTags: REQUIRED_TAGS,
        pdfNote: null,
        error: `The URL responded with HTTP ${res.status} — it needs to be publicly reachable for Scholar to crawl it.`,
      };
    }

    if (contentType?.includes("application/pdf")) {
      return {
        url,
        title: null,
        reachable: true,
        httpStatus: res.status,
        contentType,
        metadataOk: false,
        presentTags: [],
        missingTags: REQUIRED_TAGS,
        pdfNote:
          "This URL points directly at a PDF. Citation meta tags belong on the HTML landing page that links to the PDF, not the PDF itself — point this check at that landing page instead.",
        error: null,
      };
    }

    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const presentTags = REQUIRED_TAGS.filter((tag) => new RegExp(`name=["']${tag}["']`, "i").test(html));
    const missingTags = REQUIRED_TAGS.filter((tag) => !presentTags.includes(tag));

    return {
      url,
      title: titleMatch ? titleMatch[1].trim() : null,
      reachable: true,
      httpStatus: res.status,
      contentType,
      metadataOk: missingTags.length === 0,
      presentTags,
      missingTags,
      pdfNote: null,
      error: null,
    };
  } catch (err) {
    return {
      url,
      title: null,
      reachable: false,
      httpStatus: null,
      contentType: null,
      metadataOk: false,
      presentTags: [],
      missingTags: REQUIRED_TAGS,
      pdfNote: null,
      error: err instanceof Error ? err.message : "Could not reach the URL.",
    };
  }
}
