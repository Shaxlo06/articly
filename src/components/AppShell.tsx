import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { PlanBadge } from "./PlanBadge";
import { Logo } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./theme/ThemeToggle";
import { LanguageSwitcher } from "./language/LanguageSwitcher";
import { SessionGuard } from "./SessionGuard";

const NAV_LINKS = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/indexing/new", key: "indexing" },
  { href: "/history", key: "history" },
  { href: "/favorites", key: "favorites" },
] as const;

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const t = await getTranslations("nav");

  return (
    <div className="min-h-screen flex flex-col">
      <SessionGuard />
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/dashboard">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent-strong transition-colors">
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted uppercase tracking-wide">
              {user.preferredLanguage}
            </span>
            {user.subscription && <PlanBadge plan={user.subscription.plan} />}
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/account"
              className="h-8 w-8 rounded-full bg-tint border border-border-strong flex items-center justify-center text-xs font-semibold"
              title={user.name || user.email}
            >
              {(user.name.trim() || user.email).slice(0, 1).toUpperCase()}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
