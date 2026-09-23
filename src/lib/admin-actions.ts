"use server";

import { revalidatePath } from "next/cache";
import { transaction } from "./db";
import { currentFamilyId } from "./family";
import { isParentAuthed } from "./auth";
import type { Child, Prize } from "./types";

// ---------------------------------------------------------------------------
// Parent-only admin actions. Each one re-checks auth on the server, so they
// can't be invoked directly by someone who isn't through the grown-up gate.
// ---------------------------------------------------------------------------

const COLORS = ["sky", "violet", "teal", "indigo"];

export interface AdminResult {
  ok: boolean;
  message: string;
}

const DENIED: AdminResult = { ok: false, message: "Not allowed." };

async function requireParent(): Promise<boolean> {
  return isParentAuthed();
}

export async function saveChild(input: {
  id?: string;
  name: string;
  avatar: string;
  color: string;
}): Promise<AdminResult> {
  if (!(await requireParent())) return DENIED;

  const name = input.name.trim();
  const avatar = input.avatar.trim() || "🐣";
  const color = COLORS.includes(input.color) ? input.color : "sky";
  if (!name) return { ok: false, message: "Please enter a name." };

  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
    if (input.id) {
      const existing = await tx.getChild(input.id);
      if (!existing) return { ok: false, message: "That kid no longer exists." };
      await tx.upsertChild({ ...existing, name, avatar, color });
    } else {
      const child: Child = {
        id: `child-${crypto.randomUUID().slice(0, 8)}`,
        familyId,
        name,
        avatar,
        color,
        mathMaxSum: 5,
        createdAt: new Date().toISOString(),
      };
      await tx.upsertChild(child);
    }
    revalidatePath("/");
    revalidatePath("/parent");
    return { ok: true, message: "Saved!" };
  });
}

export async function deleteChild(id: string): Promise<AdminResult> {
  if (!(await requireParent())) return DENIED;
  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
    await tx.deleteChild(id);
    revalidatePath("/");
    revalidatePath("/parent");
    return { ok: true, message: "Removed." };
  });
}

export async function savePrize(input: {
  id?: string;
  name: string;
  emoji: string;
  cost: number;
  active: boolean;
}): Promise<AdminResult> {
  if (!(await requireParent())) return DENIED;

  const name = input.name.trim();
  const emoji = input.emoji.trim() || "🎁";
  const cost = Math.max(0, Math.round(Number(input.cost) || 0));
  if (!name) return { ok: false, message: "Please enter a prize name." };

  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
    const prize: Prize = {
      id: input.id ?? `prize-${crypto.randomUUID().slice(0, 8)}`,
      familyId,
      name,
      emoji,
      cost,
      active: input.active,
    };
    await tx.upsertPrize(prize);
    revalidatePath("/parent");
    return { ok: true, message: "Saved!" };
  });
}

export async function deletePrize(id: string): Promise<AdminResult> {
  if (!(await requireParent())) return DENIED;
  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
    await tx.deletePrize(id);
    revalidatePath("/parent");
    return { ok: true, message: "Removed." };
  });
}

/** Reset every kid's token balance in this family back to 0. */
export async function resetTokens(): Promise<AdminResult> {
  if (!(await requireParent())) return DENIED;
  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
    await tx.resetTokens();
    revalidatePath("/parent");
    revalidatePath("/");
    return { ok: true, message: "All token counts reset to 0." };
  });
}
