import { prisma } from "@/lib/prisma";
import type { ArticleStatus, EngineJobStatus } from "@prisma/client";
import { stripHtmlToText } from "@/lib/format/htmlDocument";

export function sectionWordCount(sections: { content: string }[]): number {
  return sections.reduce((sum, s) => {
    const text = stripHtmlToText(s.content).trim();
    return sum + (text ? text.split(/\s+/).length : 0);
  }, 0);
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export interface DashboardStats {
  totalArticles: number;
  totalArticlesThisMonth: number;
  translateProjects: number;
  translateProjectsThisMonth: number;
  readyArticles: number;
  readyArticlesThisMonth: number;
}

/** Reusable dashboard stat query — counts against the user's own articles/jobs only. */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const since = startOfMonth();

  const [totalArticles, totalArticlesThisMonth, translateProjects, translateProjectsThisMonth, readyArticles, readyArticlesThisMonth] =
    await Promise.all([
      prisma.article.count({ where: { ownerId: userId } }),
      prisma.article.count({ where: { ownerId: userId, createdAt: { gte: since } } }),
      prisma.engineJob.count({ where: { userId, type: "TRANSLATE" } }),
      prisma.engineJob.count({ where: { userId, type: "TRANSLATE", createdAt: { gte: since } } }),
      prisma.article.count({ where: { ownerId: userId, status: "FINAL" } }),
      prisma.article.count({ where: { ownerId: userId, status: "FINAL", updatedAt: { gte: since } } }),
    ]);

  return {
    totalArticles,
    totalArticlesThisMonth,
    translateProjects,
    translateProjectsThisMonth,
    readyArticles,
    readyArticlesThisMonth,
  };
}

export type ProjectItem =
  | {
      type: "article";
      id: string;
      title: string;
      updatedAt: Date;
      wordCount: number;
      status: ArticleStatus;
      href: string;
    }
  | {
      type: "translate";
      id: string;
      sourceLang: string;
      targetLang: string;
      updatedAt: Date;
      status: EngineJobStatus;
      href: string;
    };

/** Reusable "recent projects" query — merges the user's articles and translation jobs by recency. */
export async function getRecentProjects(userId: string, limit = 5): Promise<ProjectItem[]> {
  const [articles, translateJobs] = await Promise.all([
    prisma.article.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { sections: true },
    }),
    prisma.engineJob.findMany({
      where: { userId, type: "TRANSLATE" },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  const articleItems: ProjectItem[] = articles.map((a) => ({
    type: "article",
    id: a.id,
    title: a.title,
    updatedAt: a.updatedAt,
    wordCount: sectionWordCount(a.sections),
    status: a.status,
    href: `/editor/${a.id}`,
  }));

  const translateItems: ProjectItem[] = translateJobs.map((j) => {
    const input = j.input ? (JSON.parse(j.input) as { sourceLang?: string; targetLang?: string }) : {};
    return {
      type: "translate",
      id: j.id,
      sourceLang: input.sourceLang ?? "?",
      targetLang: input.targetLang ?? "?",
      updatedAt: j.createdAt,
      status: j.status,
      href: `/translate/${j.id}`,
    };
  });

  return [...articleItems, ...translateItems]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}

const UZBEK_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

export function formatUzbekDate(date: Date): string {
  return `${date.getDate()} ${UZBEK_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatThousands(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function articleStatusBadge(status: ArticleStatus): { label: string; className: string } {
  switch (status) {
    case "DRAFT":
      return { label: "Qoralama", className: "bg-tint text-muted" };
    case "IN_REVIEW":
      return { label: "Ko'rib chiqilmoqda", className: "bg-accent-soft text-accent-strong" };
    case "FINAL":
      return { label: "Tayyor", className: "bg-green-soft text-green-strong" };
    default:
      return { label: "Arxivlangan", className: "bg-tint text-muted" };
  }
}
