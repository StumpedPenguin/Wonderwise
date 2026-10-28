import { cookies } from "next/headers";

// A lightweight "kid-proof" lock on the grown-up zone. The PIN lives on the
// family; a correct entry sets a cookie holding a token derived from the PIN
// (not the PIN itself), so changing the PIN invalidates old unlocks.

export const PARENT_COOKIE = "ww_parent";
export const PARENT_UNLOCK_MAXAGE = 60 * 60 * 8; // 8 hours

/** A short token tying an unlock cookie to a specific family + PIN. */
export function pinToken(familyId: string, pin: string): string {
  let h = 2166136261;
  const s = `${familyId}:${pin}`;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

/** Is this session allowed into the grown-up zone? (No PIN = always.) */
export async function isUnlocked(familyId: string, pin: string | null): Promise<boolean> {
  if (!pin) return true;
  const c = await cookies();
  return c.get(PARENT_COOKIE)?.value === pinToken(familyId, pin);
}
