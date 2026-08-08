import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "./Logo";
import { ThemeToggle } from "./theme/ThemeToggle";
import { LanguageSwitcher } from "./language/LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { NavTabs } from "./NavTabs";
import { MobileMenu } from "./MobileMenu";
import { StickyHeader } from "./StickyHeader";
import { SessionGuard } from "./SessionGuard";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const displayName = user.name || user.email.split("@")[0];

  return (
    <div className="min-h-screen flex flex-col">
      <SessionGuard />
      <StickyHeader>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="shrink-0">
            <Logo />
          </Link>

          <NavTabs />

          <div className="hidden sm:flex items-center gap-2 lg:gap-3 shrink-0 ml-auto">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu name={displayName} />
          </div>

          <MobileMenu name={displayName} />
        </div>
      </StickyHeader>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10">{children}</main>
    </div>
  );
}
