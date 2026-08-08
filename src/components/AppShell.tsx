import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { PlanBadge } from "./PlanBadge";
import { Logo } from "./Logo";
import { ThemeToggle } from "./theme/ThemeToggle";
import { LanguageSwitcher } from "./language/LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { NavTabs } from "./NavTabs";
import { SessionGuard } from "./SessionGuard";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <SessionGuard />
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/dashboard" className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-full border border-border-strong bg-background px-4 h-9 text-sm text-muted">
            <SearchIcon />
            <input
              type="text"
              placeholder="Qidiruv: maqola, jurnal, muallif..."
              className="flex-1 bg-transparent outline-none placeholder:text-muted"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {user.subscription && <PlanBadge plan={user.subscription.plan} />}
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu name={user.name || user.email.split("@")[0]} />
          </div>
        </div>
        <div className="border-t border-border">
          <NavTabs />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
