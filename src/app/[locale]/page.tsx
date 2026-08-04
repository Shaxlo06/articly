import { setRequestLocale } from "next-intl/server";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Loop } from "@/components/landing/Loop";
import { Pricing } from "@/components/landing/Pricing";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import type { AppLocale } from "@/i18n/routing";

export default async function RootPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthModalProvider>
      <div className="min-h-screen flex flex-col">
        <LandingNav />
        <main className="flex-1">
          <Hero />
          <Loop />
          <Pricing />
          <Contact />
        </main>
        <Footer />
      </div>
    </AuthModalProvider>
  );
}
