"use client";

import { buildHtmlDocument } from "@/lib/format/htmlDocument";

export function DocumentPreview({
  title,
  authors,
  affiliation,
  keywords,
  sections,
}: {
  title: string;
  authors?: string;
  affiliation?: string;
  keywords?: string;
  sections: { title: string; content: string }[];
}) {
  const html = buildHtmlDocument({ title, authors, affiliation, keywords, sections });

  return (
    <div className="rounded-lg border border-border bg-tint/30 p-3">
      <iframe title="A4 document preview" srcDoc={html} className="w-full rounded border border-border-strong bg-white" style={{ height: "80vh" }} />
    </div>
  );
}
