import { ArticleFormatEntry } from "@/components/ArticleFormatEntry";
import { getCurrentUser } from "@/lib/session";

export default async function EditorEntryPage() {
  await getCurrentUser();

  return <ArticleFormatEntry />;
}
