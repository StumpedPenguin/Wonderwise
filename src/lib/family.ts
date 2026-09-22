// The current family for a request.
//
// Push 1 (this change) always returns the default family, so the app behaves
// exactly like the single-family app while every query is now scoped by
// familyId. Push 2 (Supabase auth) will resolve this from the signed-in
// parent's session and redirect to login when there isn't one.

export const DEFAULT_FAMILY_ID = "family-default";

export async function currentFamilyId(): Promise<string> {
  return DEFAULT_FAMILY_ID;
}
