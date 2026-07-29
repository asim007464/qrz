import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirectPath } from "@/lib/authRedirect";
import { isAuthPublicPath, isGuestAccessiblePath, isLockdownBypass } from "@/lib/authPaths";
import { DEFAULT_LOCKDOWN, type LockdownSettings } from "@/lib/siteSettings";

async function getLockdownEnabled(supabase: ReturnType<typeof createServerClient>): Promise<boolean> {
  try {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "lockdown").maybeSingle();
    return Boolean((data?.value as LockdownSettings | undefined)?.enabled);
  } catch {
    return DEFAULT_LOCKDOWN.enabled;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { pathname } = request.nextUrl;
  const { data: { user } } = await supabase.auth.getUser();

  if (!isLockdownBypass(pathname)) {
    const locked = await getLockdownEnabled(supabase);
    if (locked && pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  if (pathname === "/maintenance") {
    const locked = await getLockdownEnabled(supabase);
    if (!locked) return NextResponse.redirect(new URL("/", request.url));
  }

  if (user && isAuthPublicPath(pathname)) {
    const next = request.nextUrl.searchParams.get("next");
    return NextResponse.redirect(new URL(getSafeRedirectPath(next), request.url));
  }

  if (!user && !isLockdownBypass(pathname) && !isGuestAccessiblePath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|downloads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|apk|ipa|webmanifest)$).*)",
  ],
};
