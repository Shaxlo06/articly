import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tint px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-lg p-8">
        <Link href="/" className="flex justify-center mb-6">
          <Logo />
        </Link>

        <h1 className="font-serif text-xl font-semibold text-center">Sign up</h1>
        <p className="mt-2 text-sm text-muted text-center leading-relaxed">
          Account creation (email/password, Google) isn&apos;t wired up in this build yet — continue below
          to enter the workspace as the demo account, same as the rest of the app.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 block text-center text-sm font-semibold px-4 py-2.5 rounded-md bg-accent text-white hover:bg-accent-strong transition-colors"
        >
          Continue to dashboard
        </Link>

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
