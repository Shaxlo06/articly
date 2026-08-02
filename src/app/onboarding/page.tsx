import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (user.onboardedAt) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center bg-tint px-6 py-16">
      <Logo />
      <p className="mt-3 text-sm text-muted text-center max-w-sm">
        A few quick details before your dashboard — this personalizes drafting, translation, and journal
        matching later.
      </p>
      <div className="mt-10 w-full flex justify-center">
        <OnboardingWizard initialName={user.name} />
      </div>
    </div>
  );
}
