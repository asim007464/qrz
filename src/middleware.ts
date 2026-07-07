import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCKDOWN, type LockdownSettings } from "@/lib/siteSettings";

const LOCKDOWN_BYPASS = ["/maintenance", "/admin", "/login", "/register", "/forgot-password", "/auth/", "/api/"];

function isBypass(pathname: string) {
  return LOCKDOWN_BYPASS.some((p) => pathname === p || pathname.startsWith(p));
}

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

  if (!isBypass(pathname)) {
    const locked = await getLockdownEnabled(supabase);
    if (locked && pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  if (pathname === "/maintenance") {
    const locked = await getLockdownEnabled(supabase);
    if (!locked) return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
