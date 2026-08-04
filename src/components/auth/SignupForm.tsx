"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

function mapAuthError(error: { code?: string; message: string }, t: ReturnType<typeof useTranslations>) {
  if (error.code === "user_already_exists") return t("errorUserExists");
  if (error.code === "weak_password") return t("errorWeakPassword");
  return t("genericError");
}

export function SignupForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}) {
  const t = useTranslations("auth.signup");
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    if (!acceptedTerms) {
      setError(t("termsRequired"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    });

    setLoading(false);
    if (error) {
      setError(mapAuthError(error, t));
      return;
    }

    // With "Confirm email" on, Supabase returns a user but no session yet.
    if (!data.session) {
      setNeedsConfirmation(true);
      return;
    }

    onSuccess?.();
    router.push("/dashboard");
    router.refresh();
  }

  if (needsConfirmation) {
    return <p className="text-sm text-muted leading-relaxed">{t("confirmEmailNotice", { email })}</p>;
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
          <label htmlFor="signup-name" className="text-xs font-semibold text-muted uppercase tracking-wide">
            {t("nameLabel")}
          </label>
          <input
            id="signup-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-email" className="text-xs font-semibold text-muted uppercase tracking-wide">
            {t("emailLabel")}
          </label>
          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-password" className="text-xs font-semibold text-muted uppercase tracking-wide">
            {t("passwordLabel")}
          </label>
          <input
            id="signup-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-confirm-password" className="text-xs font-semibold text-muted uppercase tracking-wide">
            {t("confirmPasswordLabel")}
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5"
          />
          {t("termsLabel")}
        </label>

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
        {t("haveAccount")}{" "}
        {onSwitchToLogin ? (
          <button type="button" onClick={onSwitchToLogin} className="font-semibold text-accent-strong">
            {t("loginLink")}
          </button>
        ) : (
          <Link href="/login" className="font-semibold text-accent-strong">
            {t("loginLink")}
          </Link>
        )}
      </p>
    </div>
  );
}
