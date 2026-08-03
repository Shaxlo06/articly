"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tint px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-lg p-8">
        <Link href="/" className="flex justify-center mb-6">
          <Logo />
        </Link>

        <h1 className="font-serif text-xl font-semibold text-center">Log in</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-muted uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-muted uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 text-center text-sm font-semibold px-4 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-accent-strong">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
