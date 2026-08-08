"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_TABS } from "./nav/tabsConfig";

export function NavTabs() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = NAV_TABS.findIndex((tab) => tab.match(pathname));
    itemRefs.current[activeIndex]?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <nav className="hidden sm:flex flex-1 min-w-0 overflow-x-auto justify-center">
      <div className="flex items-center gap-1 min-w-max">
        {NAV_TABS.map((tab, index) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              href={tab.href}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 h-16 text-sm font-medium border-b-2 transition-colors ${
                active ? "border-accent-strong text-accent-strong" : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <tab.Icon />
              {t(tab.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
