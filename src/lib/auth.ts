import { authConfigured, getUser } from "./family";

// The grown-up gate. With Supabase auth on, being signed in IS being the
// parent (each account owns one family). Without auth (local dev), it's open.

export function isParentConfigured(): boolean {
  return authConfigured();
}

export async function isParentAuthed(): Promise<boolean> {
  if (!authConfigured()) return true;
  return !!(await getUser());
}
