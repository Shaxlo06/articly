import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ArticleWorkspace } from "@/components/ArticleWorkspace";

export default async function EditorPage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findUnique({ where: { id: articleId }, include: { sections: true } });
  if (!article || article.ownerId !== user.id) notFound();

  return <ArticleWorkspace article={article} sections={article.sections} />;
}
