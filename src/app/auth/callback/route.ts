import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

// The proxy sets this cookie to remember the locale the user was browsing in,
// so the post-OAuth redirect can land back in the same language.
function resolveLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  return cookieLocale && routing.locales.includes(cookieLocale as (typeof routing.locales)[number])
    ? cookieLocale
    : routing.defaultLocale;
}

// The default locale (English) is unprefixed under "as-needed" routing —
// building `/${locale}${path}` unconditionally would send it through an
// extra redirect hop when next-intl's own middleware strips that prefix back off.
function localizedPath(locale: string, path: string) {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

// Supabase redirects here after an OAuth provider (e.g. Google) approves the
// user; ?code must be exchanged for a session before any cookie exists.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = resolveLocale(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${localizedPath(locale, "/dashboard")}`);
    }
  }

  return NextResponse.redirect(`${origin}${localizedPath(locale, "/login?error=oauth")}`);
}
