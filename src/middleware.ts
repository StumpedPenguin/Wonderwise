import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// The grown-up unlock cookie (kept in sync with lib/parent-pin.ts). Defined
// here too so the Edge middleware doesn't import next/headers.
const PARENT_COOKIE = "ww_parent";

// Two jobs on each request:
//  1) Lock-on-exit: clear the grown-up unlock as soon as you leave /parent, so
//     re-entering the grown-up zone always asks for the code again (important on
//     a shared tablet).
//  2) Refresh the Supabase auth session cookie (when auth is configured).
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const shouldLock = !path.startsWith("/parent") && !!request.cookies.get(PARENT_COOKIE);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  if (url && anon) {
    try {
      const supabase = createServerClient(url, anon, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      });

      // Touch the session so it refreshes if needed. A failure here (network
      // blip, bad key, Supabase down) must never take down every route with a
      // 500 — just continue without a refreshed cookie.
      await supabase.auth.getUser();
    } catch (err) {
      console.error("middleware session refresh failed", err);
      response = NextResponse.next({ request });
    }
  }

  if (shouldLock) {
    response.cookies.set(PARENT_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and the auth callback.
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
