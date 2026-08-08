import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canExportFormat } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { toDocxBuffer, toHtmlBuffer, toPdfBuffer, toTxtBuffer, type ExportPayload } from "@/lib/export/generate";

const CONTENT_TYPE: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  txt: "text/plain; charset=utf-8",
  html: "text/html; charset=utf-8",
};

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const body = (await request.json()) as {
    format: "docx" | "pdf" | "txt" | "html";
    title: string;
    sections: { title: string; content: string }[];
    articleId?: string;
  };

  if (!canExportFormat(user.subscription, body.format)) {
    return NextResponse.json(
      { error: `Export to ${body.format.toUpperCase()} isn't included in your plan.`, upgradeRequired: true },
      { status: 403 }
    );
  }

  // Title-page metadata (authors/affiliation/keywords) lives on the Article
  // row, not in the client-submitted body — fetched here (scoped to the
  // caller's own article) rather than trusted from the request.
  let authors: string | null = null;
  let affiliation: string | null = null;
  let keywords: string | null = null;
  if (body.articleId) {
    const owned = await prisma.article.findUnique({ where: { id: body.articleId } });
    if (owned && owned.ownerId === user.id) {
      authors = owned.authors;
      affiliation = owned.affiliation;
      keywords = owned.keywords;
    }
  }

  const payload: ExportPayload = {
    title: body.title,
    sections: body.sections,
    ownerName: user.name,
    authors: authors ?? undefined,
    affiliation: affiliation ?? undefined,
    keywords: keywords ?? undefined,
  };

  const buffer =
    body.format === "docx"
      ? await toDocxBuffer(payload)
      : body.format === "pdf"
        ? await toPdfBuffer(payload)
        : body.format === "html"
          ? toHtmlBuffer(payload)
          : toTxtBuffer(payload);

  if (body.articleId) {
    // downloadUrl left empty: the file streams directly in this response
    // rather than being persisted to blob storage — swap in real storage
    // before relying on this field for re-download later.
    await prisma.exportRecord.create({
      data: {
        articleId: body.articleId,
        format: body.format.toUpperCase() as "DOCX" | "PDF" | "TXT" | "HTML",
        requestedBy: user.id,
        downloadUrl: "",
      },
    });
  }

  const filename = `${body.title.replace(/[^a-z0-9-_ ]/gi, "").trim() || "article"}.${body.format}`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPE[body.format],
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
