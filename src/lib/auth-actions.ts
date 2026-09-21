"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PARENT_COOKIE, expectedToken, isParentConfigured } from "./auth";

export async function parentLogin(
  passcode: string,
): Promise<{ ok: boolean; message: string }> {
  if (!isParentConfigured()) return { ok: true, message: "" }; // open mode

  if (passcode !== process.env.PARENT_PASSCODE) {
    return { ok: false, message: "That passcode isn't right." };
  }

  (await cookies()).set(PARENT_COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  revalidatePath("/parent");
  return { ok: true, message: "" };
}

export async function parentLogout(): Promise<void> {
  (await cookies()).delete(PARENT_COOKIE);
  revalidatePath("/parent");
}
