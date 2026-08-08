import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// /reset-password must stay public: the recovery code Supabase appends to
// the link is only exchanged for a session client-side, after this page's
// own JS runs — a server-side auth check here would redirect before that.
const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/auth/callback", "/reset-password"]);
const LOCALE_PATTERN = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

const handleI18nRouting = createIntlMiddleware(routing);

function splitLocale(pathname: string) {
  const match = pathname.match(LOCALE_PATTERN);
  if (!match) return { locale: routing.defaultLocale, rest: pathname };
  return { locale: match[1], rest: pathname.slice(match[0].length) || "/" };
}

// The default locale (English) is unprefixed under "as-needed" routing —
// building `/${locale}${path}` unconditionally would send it through an
// extra redirect hop when next-intl's own middleware strips that prefix back off.
function localizedPath(locale: string, path: string) {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Route handlers live outside the [locale] segment and must never be
  // locale-prefixed, so next-intl's routing (which would otherwise redirect
  // them to add a locale) is skipped for these paths.
  const skipIntl = pathname.startsWith("/api") || pathname.startsWith("/auth/");

  const intlResponse = skipIntl ? NextResponse.next({ request }) : handleI18nRouting(request);
  if (!skipIntl && intlResponse.headers.has("location")) {
    return intlResponse;
  }

  const response = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { locale, rest } = skipIntl ? { locale: routing.defaultLocale, rest: pathname } : splitLocale(pathname);
  const isPublic = PUBLIC_PATHS.has(rest);

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL(localizedPath(locale, "/login"), request.url));
  }

  if (user && (rest === "/login" || rest === "/signup")) {
    return NextResponse.redirect(new URL(localizedPath(locale, "/dashboard"), request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
