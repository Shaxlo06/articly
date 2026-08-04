import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

// The proxy sets this cookie to remember the locale the user was browsing in,
// so the post-OAuth redirect can land back in the same language.
function resolveLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  return routing.locales.includes(cookieLocale as (typeof routing.locales)[number])
    ? cookieLocale
    : routing.defaultLocale;
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
      return NextResponse.redirect(`${origin}/${locale}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=oauth`);
}
