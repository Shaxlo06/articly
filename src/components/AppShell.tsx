import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { PlanBadge } from "./PlanBadge";
import { Logo } from "./Logo";
import { ThemeToggle } from "./theme/ThemeToggle";
import { LanguageSwitcher } from "./language/LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { NavTabs } from "./NavTabs";
import { MobileMenu } from "./MobileMenu";
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
  const displayName = user.name || user.email.split("@")[0];

  return (
    <div className="min-h-screen flex flex-col">
      <SessionGuard />
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/dashboard" className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border-strong bg-background px-4 h-9 text-sm text-muted sm:w-32 md:w-48 lg:flex-1 lg:w-auto lg:max-w-md">
            <SearchIcon />
            <input
              type="text"
              placeholder="Qidiruv: maqola, jurnal, muallif..."
              className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 lg:gap-3 shrink-0">
            {user.subscription && <PlanBadge plan={user.subscription.plan} />}
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu name={displayName} />
          </div>

          <MobileMenu name={displayName} plan={user.subscription?.plan} />
        </div>
        <div className="border-t border-border">
          <NavTabs />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10">{children}</main>
    </div>
  );
}
