"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

function mapAuthError(error: { code?: string; message: string }, t: ReturnType<typeof useTranslations>) {
  if (error.code === "invalid_credentials") return t("errorInvalidCredentials");
  if (error.code === "email_not_confirmed") return t("errorEmailNotConfirmed");
  return t("genericError");
}

export function LoginForm({
  onSuccess,
  onSwitchToSignup,
}: {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}) {
  const t = useTranslations("auth.login");
  const tForgot = useTranslations("auth.forgotPassword");
  const router = useRouter();
  const [view, setView] = useState<"login" | "forgotPassword">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(mapAuthError(error, t));
      return;
    }

    onSuccess?.();
    router.push("/dashboard");
    router.refresh();
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setResetLoading(false);
    if (error) {
      setResetError(tForgot("genericError"));
      return;
    }
    setResetSent(true);
  }

  if (view === "forgotPassword") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-lg font-semibold">{tForgot("heading")}</h2>
          <p className="mt-1 text-sm text-muted">{tForgot("description")}</p>
        </div>

        {resetSent ? (
          <p className="text-sm text-muted">{tForgot("sentNotice", { email: resetEmail })}</p>
        ) : (
          <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reset-email" className="text-xs font-semibold text-muted uppercase tracking-wide">
                {tForgot("emailLabel")}
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            {resetError && <p className="text-sm text-red-600">{resetError}</p>}

            <button
              type="submit"
              disabled={resetLoading}
              className="text-center text-sm font-semibold px-4 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors disabled:opacity-60"
            >
              {resetLoading ? tForgot("sending") : tForgot("sendCta")}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setView("login")}
          className="text-sm font-semibold text-accent-strong self-start"
        >
          {tForgot("backToLogin")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <GoogleSignInButton label={t("googleCta")} />

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        {t("or")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-xs font-semibold text-muted uppercase tracking-wide">
            {t("emailLabel")}
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-semibold text-muted uppercase tracking-wide">
              {t("passwordLabel")}
            </label>
            <button
              type="button"
              onClick={() => setView("forgotPassword")}
              className="text-xs font-semibold text-accent-strong"
            >
              {t("forgotPassword")}
            </button>
          </div>
          <input
            id="login-password"
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
          {loading ? t("submitting") : t("submitCta")}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        {t("noAccount")}{" "}
        {onSwitchToSignup ? (
          <button type="button" onClick={onSwitchToSignup} className="font-semibold text-accent-strong">
            {t("signupLink")}
          </button>
        ) : (
          <Link href="/signup" className="font-semibold text-accent-strong">
            {t("signupLink")}
          </Link>
        )}
      </p>
    </div>
  );
}
