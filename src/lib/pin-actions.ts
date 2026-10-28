"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { currentFamilyId } from "./family";
import { getFamily, setFamilyPin } from "./db";
import { PARENT_COOKIE, PARENT_UNLOCK_MAXAGE, pinToken } from "./parent-pin";

function cookieOpts() {
  return { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: PARENT_UNLOCK_MAXAGE };
}

/** Try to unlock the grown-up zone with a PIN. */
export async function unlockParent(pin: string): Promise<{ ok: boolean }> {
  const familyId = await currentFamilyId();
  const family = await getFamily(familyId);
  if (family?.parentPin && family.parentPin === pin.replace(/\D/g, "")) {
    (await cookies()).set(PARENT_COOKIE, pinToken(familyId, family.parentPin), cookieOpts());
    return { ok: true };
  }
  return { ok: false };
}

/** Set a new 4-digit PIN, or clear it with null. Called from inside the zone. */
export async function setParentPin(pin: string | null): Promise<{ ok: boolean; message: string }> {
  const familyId = await currentFamilyId();
  let clean: string | null = null;
  if (pin != null) {
    clean = pin.replace(/\D/g, "");
    if (clean.length !== 4) return { ok: false, message: "Use a 4-digit code." };
  }
  await setFamilyPin(familyId, clean);
  const c = await cookies();
  if (clean) c.set(PARENT_COOKIE, pinToken(familyId, clean), cookieOpts());
  else c.delete(PARENT_COOKIE);
  revalidatePath("/parent");
  return { ok: true, message: clean ? "Lock is on 🔒" : "Lock removed" };
}
