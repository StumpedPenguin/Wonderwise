import type { DB, Family } from "./types";
import { DEFAULT_FAMILY_ID } from "./family";

export function seedFamily(): Family {
  return {
    id: DEFAULT_FAMILY_ID,
    name: "My Family",
    ownerUserId: null,
    createdAt: new Date().toISOString(),
  };
}

// Initial data the app starts with, under the default family.
export function seedData(): DB {
  const now = new Date().toISOString();
  const familyId = DEFAULT_FAMILY_ID;
  return {
    children: [
      { id: "child-fox", familyId, name: "Fox", avatar: "🦊", color: "sky", mathMaxSum: 5, createdAt: now },
      { id: "child-penguin", familyId, name: "Penguin", avatar: "🐧", color: "violet", mathMaxSum: 10, createdAt: now },
    ],
    ledger: [],
    prizes: [
      { id: "prize-screen", familyId, name: "30 min screen time", emoji: "🎮", cost: 30, active: true },
      { id: "prize-dinner", familyId, name: "Pick tonight's dinner", emoji: "🍕", cost: 50, active: true },
      { id: "prize-icecream", familyId, name: "Ice cream trip", emoji: "🍦", cost: 80, active: true },
      { id: "prize-trampoline", familyId, name: "Trampoline park trip", emoji: "🤸", cost: 200, active: true },
    ],
    redemptions: [],
    sessions: [],
    contentItems: [],
  };
}
