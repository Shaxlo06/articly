"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  );
}

const ITEM_COUNT = 2;

export function UserMenu({ name }: { name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
  }, [open]);

  function focusItem(index: number) {
    const next = (index + ITEM_COUNT) % ITEM_COUNT;
    itemRefs.current[next]?.focus();
  }

  async function handleLogout() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function onItemKeyDown(e: React.KeyboardEvent, index: number) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusItem(index + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusItem(index - 1);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const firstName = name.trim() ? name.trim().split(" ")[0] : "";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="h-9 flex items-center gap-2 rounded-full bg-accent text-ink-fixed pl-3 pr-2.5 hover:brightness-95 transition"
      >
        <UserIcon />
        <span className="text-sm font-semibold max-w-[10rem] truncate">{firstName || name}</span>
        <ChevronIcon className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-border bg-surface p-1 shadow-lg z-50"
        >
          <Link
            ref={(el) => {
              itemRefs.current[0] = el;
            }}
            href="/account"
            role="menuitem"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            onKeyDown={(e) => onItemKeyDown(e, 0)}
            className="block w-full rounded-md px-2.5 py-1.5 text-sm text-foreground hover:bg-tint transition-colors"
          >
            Sozlamalar
          </Link>
          <button
            ref={(el) => {
              itemRefs.current[1] = el;
            }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={handleLogout}
            onKeyDown={(e) => onItemKeyDown(e, 1)}
            className="w-full text-left rounded-md px-2.5 py-1.5 text-sm text-foreground hover:bg-tint transition-colors"
          >
            Chiqish
          </button>
        </div>
      )}
    </div>
  );
}
