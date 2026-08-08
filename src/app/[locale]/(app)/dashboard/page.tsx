import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { getDashboardStats, getRecentProjects } from "@/lib/dashboardStats";
import { HeroModuleCard } from "@/components/dashboard/HeroModuleCard";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { StatCard } from "@/components/dashboard/StatCard";

function WriteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20l1.2-4.8L17.5 3.9l3.6 3.6L9.8 18.8 5 20Z" />
      <path d="M15.5 6 18 8.5" />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h9M8.5 4.5v2c0 4.5-2.2 7.8-5.5 9.5" />
      <path d="M5.5 11c1 2.2 3.2 4 5.5 4.8" />
      <path d="M14 20l4-9.5 4 9.5" />
      <path d="M15.4 17h5.2" />
    </svg>
  );
}

function PublishIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M15 3.5V8h4" />
      <path d="M8.5 13.5l2 2 4-4.2" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 12.5h6M9 16h6" />
    </svg>
  );
}

function TranslateStatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h7M6.5 5.5v1.8c0 3.4-1.7 5.9-4 7.3" />
      <path d="M5 11c.8 1.6 2.3 3 4 3.6" />
      <path d="M14 18.5l3-7.5 3 7.5" />
      <path d="M15.1 16h3.8" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3l2.3 2.3 4.7-5" />
    </svg>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [stats, recentProjects] = await Promise.all([getDashboardStats(user.id), getRecentProjects(user.id, 5)]);

  const firstName = user.name.trim() ? user.name.split(" ")[0] : "";

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Bosh sahifa</p>
        <h1 className="font-serif text-3xl font-semibold mt-1">Xush kelibsiz{firstName ? `, ${firstName}` : ""}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <HeroModuleCard
          href="/editor/new"
          colorway="accent"
          title="Yozing!"
          subtitle="Maqola yaratish"
          icon={<WriteIcon />}
        />
        <HeroModuleCard
          href="/translate/new"
          colorway="pink"
          title="Tarjima qiling!"
          subtitle="Academic tarjima"
          icon={<TranslateIcon />}
        />
        <HeroModuleCard
          href="/journals/new"
          colorway="green"
          title="Chop eting!"
          subtitle="Jurnalga yuborish"
          icon={<PublishIcon />}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-bold">So&apos;nggi loyihalar</h2>
          <Link href="/articles" className="text-sm font-semibold text-accent-strong hover:underline">
            Barchasini ko&apos;rish →
          </Link>
        </div>
        <RecentProjects items={recentProjects} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          colorway="lavender"
          icon={<DocumentIcon />}
          value={stats.totalArticles}
          label="Jami maqolalar"
          deltaLabel={stats.totalArticlesThisMonth > 0 ? `+${stats.totalArticlesThisMonth} bu oy` : undefined}
        />
        <StatCard
          colorway="accent"
          icon={<TranslateStatIcon />}
          value={stats.translateProjects}
          label="Tarjima loyihalari"
          deltaLabel={stats.translateProjectsThisMonth > 0 ? `+${stats.translateProjectsThisMonth} bu oy` : undefined}
        />
        <StatCard
          colorway="green"
          icon={<CheckBadgeIcon />}
          value={stats.readyArticles}
          label="Tayyor maqolalar"
          deltaLabel={stats.readyArticlesThisMonth > 0 ? `+${stats.readyArticlesThisMonth} bu oy` : undefined}
        />
      </div>
    </div>
  );
}
