import { cookies } from "next/headers";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Grown-up (parent) gate for the /parent zone — and, later, the owner-only
// content generator.
//
// A single household passcode (PARENT_PASSCODE) unlocks the grown-up zone.
// We store an HMAC-signed marker in an httpOnly cookie so the passcode itself
// never rides along in the cookie, and the marker can't be forged without it.
//
// If PARENT_PASSCODE is not set, the zone is OPEN (local dev). Set the env var
// — locally or in Vercel — to lock it. A full multi-parent login (Supabase
// Auth, magic links) is the later upgrade; this is deployable now.
// ---------------------------------------------------------------------------

export const PARENT_COOKIE = "ww_parent";
const SALT = "wonderwise:parent:v1";

export function isParentConfigured(): boolean {
  return !!process.env.PARENT_PASSCODE;
}

/** The signed marker we expect in the cookie for the current passcode. */
export function expectedToken(): string {
  const passcode = process.env.PARENT_PASSCODE ?? "";
  return crypto
    .createHmac("sha256", passcode + SALT)
    .update("parent-ok")
    .digest("base64url");
}

export async function isParentAuthed(): Promise<boolean> {
  if (!isParentConfigured()) return true; // open mode for local dev

  const token = (await cookies()).get(PARENT_COOKIE)?.value ?? "";
  const expected = expectedToken();
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
