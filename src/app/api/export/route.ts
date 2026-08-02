import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canExportFormat } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";
import { toDocxBuffer, toPdfBuffer, toTxtBuffer, type ExportPayload } from "@/lib/export/generate";

const CONTENT_TYPE: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  txt: "text/plain; charset=utf-8",
};

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user.subscription) return NextResponse.json({ error: "No subscription" }, { status: 403 });

  const body = (await request.json()) as {
    format: "docx" | "pdf" | "txt";
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

  const payload: ExportPayload = { title: body.title, sections: body.sections, ownerName: user.name };

  const buffer =
    body.format === "docx" ? await toDocxBuffer(payload) : body.format === "pdf" ? await toPdfBuffer(payload) : toTxtBuffer(payload);

  if (body.articleId) {
    // downloadUrl left empty: the file streams directly in this response
    // rather than being persisted to blob storage — swap in real storage
    // before relying on this field for re-download later.
    await prisma.exportRecord.create({
      data: { articleId: body.articleId, format: body.format.toUpperCase() as "DOCX" | "PDF" | "TXT", requestedBy: user.id, downloadUrl: "" },
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
