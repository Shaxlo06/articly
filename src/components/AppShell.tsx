import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PlanBadge } from "./PlanBadge";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/indexing/new", label: "Scholar Indexing" },
  { href: "/history", label: "History" },
  { href: "/favorites", label: "Favorites" },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user.onboardedAt) redirect("/onboarding");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/dashboard">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent-strong transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted uppercase tracking-wide">
              {user.preferredLanguage}
            </span>
            {user.subscription && <PlanBadge plan={user.subscription.plan} />}
            <Link
              href="/account"
              className="h-8 w-8 rounded-full bg-tint border border-border-strong flex items-center justify-center text-xs font-semibold"
              title={user.name}
            >
              {user.name.slice(0, 1)}
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
