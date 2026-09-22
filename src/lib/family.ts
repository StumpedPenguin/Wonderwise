import { redirect } from "next/navigation";
import { getFamilyByOwner } from "./db";
import { createClient } from "./supabase/server";

// Resolving the current family for a request.
//
// When Supabase auth is configured, the family is the one owned by the signed-in
// parent. When it isn't (local dev / the single-family deployment), everything
// falls back to the default family so the app behaves exactly as before.

export const DEFAULT_FAMILY_ID = "family-default";

export function authConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** The signed-in auth user, or null (also null when auth isn't configured). */
export async function getUser(): Promise<{ id: string; email?: string } | null> {
  if (!authConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null;
}

/** For server actions: the current family, or throws if not signed in. */
export async function currentFamilyId(): Promise<string> {
  if (!authConfigured()) return DEFAULT_FAMILY_ID;
  const user = await getUser();
  if (!user) throw new Error("NOT_AUTHENTICATED");
  const family = await getFamilyByOwner(user.id);
  if (!family) throw new Error("NO_FAMILY");
  return family.id;
}

/** For pages: redirects to login / onboarding when there's no family yet. */
export async function requireFamily(): Promise<string> {
  if (!authConfigured()) return DEFAULT_FAMILY_ID;
  const user = await getUser();
  if (!user) redirect("/login");
  const family = await getFamilyByOwner(user.id);
  if (!family) redirect("/welcome");
  return family.id;
}
