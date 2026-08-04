"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const t = useTranslations("auth.login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-tint px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-lg p-8">
        <Link href="/" className="flex justify-center mb-6">
          <Logo />
        </Link>

        <h1 className="font-serif text-xl font-semibold text-center mb-6">{t("heading")}</h1>

        <LoginForm />
      </div>
    </div>
  );
}
