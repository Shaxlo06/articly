"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    // With "Confirm email" on, Supabase returns a user but no session yet.
    if (!data.session) {
      setNeedsConfirmation(true);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tint px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-lg p-8">
        <Link href="/" className="flex justify-center mb-6">
          <Logo />
        </Link>

        <h1 className="font-serif text-xl font-semibold text-center">Sign up</h1>

        {needsConfirmation ? (
          <p className="mt-6 text-sm text-muted text-center leading-relaxed">
            Check <span className="font-semibold">{email}</span> for a confirmation link, then log in.
          </p>
        ) : (
          <>
            <div className="mt-6">
              <GoogleSignInButton />
            </div>

            <div className="mt-5 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
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
                  minLength={6}
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
                {loading ? "Signing up…" : "Sign up"}
              </button>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent-strong">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
