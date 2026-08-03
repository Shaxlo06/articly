"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        scrolled
          ? "sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur transition-colors"
          : "sticky top-0 z-20 border-b border-transparent bg-transparent transition-colors"
      }
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-accent-strong transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 rounded-md border border-border-strong hover:border-accent-strong hover:text-accent-strong transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
