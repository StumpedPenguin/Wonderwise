import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session cookie on each request. No-ops entirely
// when auth isn't configured (single-family / local dev).
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next();

  let response = NextResponse.next({ request });

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
    return NextResponse.next({ request });
  }
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and the auth callback.
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
