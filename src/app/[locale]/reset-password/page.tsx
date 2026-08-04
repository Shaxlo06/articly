"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();

  // Supabase's browser client exchanges the recovery token in the URL for a
  // session automatically; PASSWORD_RECOVERY only fires once that's done.
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) setHasRecoverySession(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasRecoverySession((prev) => prev ?? Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setError(t("genericError"));
      return;
    }
    setSaved(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tint px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-lg p-8">
        <Link href="/" className="flex justify-center mb-6">
          <Logo />
        </Link>

        <h1 className="font-serif text-xl font-semibold text-center">{t("heading")}</h1>

        <div className="mt-6">
          {hasRecoverySession === null ? null : hasRecoverySession === false ? (
            <div className="flex flex-col gap-4 items-center text-center">
              <p className="text-sm text-muted">{t("invalidLinkNotice")}</p>
              <Link href="/login" className="text-sm font-semibold text-accent-strong">
                {t("goToLogin")}
              </Link>
            </div>
          ) : saved ? (
            <div className="flex flex-col gap-4 items-center text-center">
              <p className="text-sm text-muted">{t("successNotice")}</p>
              <button
                type="button"
                onClick={() => {
                  router.push("/dashboard");
                  router.refresh();
                }}
                className="text-sm font-semibold text-accent-strong"
              >
                {t("goToLogin")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-password" className="text-xs font-semibold text-muted uppercase tracking-wide">
                  {t("newPasswordLabel")}
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-new-password" className="text-xs font-semibold text-muted uppercase tracking-wide">
                  {t("confirmPasswordLabel")}
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="mt-2 text-center text-sm font-semibold px-4 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors disabled:opacity-60"
              >
                {saving ? t("saving") : t("saveCta")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
