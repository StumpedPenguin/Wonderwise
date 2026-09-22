"use server";

import { redirect } from "next/navigation";
import { getUser } from "./family";
import { getFamilyByOwner, createFamily, transaction } from "./db";

const DEFAULT_PRIZES = [
  { name: "30 min screen time", emoji: "🎮", cost: 30 },
  { name: "Pick tonight's dinner", emoji: "🍕", cost: 50 },
  { name: "Ice cream trip", emoji: "🍦", cost: 80 },
  { name: "Trampoline park trip", emoji: "🤸", cost: 200 },
];

// Creates the signed-in parent's family (with a starter prize catalog).
export async function createMyFamily(formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/login");

  const existing = await getFamilyByOwner(user.id);
  if (existing) redirect("/");

  const name = (String(formData.get("familyName") ?? "").trim() || "My Family").slice(0, 60);
  const familyId = `family-${crypto.randomUUID().slice(0, 8)}`;

  await createFamily({
    id: familyId,
    name,
    ownerUserId: user.id,
    createdAt: new Date().toISOString(),
  });

  await transaction(familyId, async (tx) => {
    for (const p of DEFAULT_PRIZES) {
      await tx.upsertPrize({
        id: `prize-${crypto.randomUUID().slice(0, 8)}`,
        familyId,
        name: p.name,
        emoji: p.emoji,
        cost: p.cost,
        active: true,
      });
    }
  });

  redirect("/parent");
}
