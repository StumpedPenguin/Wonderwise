import type { DB } from "./types";

// Initial data the app starts with. Names/avatars are placeholders you can
// change later — the point of the slice is to prove the loop end to end.
export function seedData(): DB {
  const now = new Date().toISOString();
  return {
    children: [
      {
        id: "child-fox",
        name: "Fox",
        avatar: "🦊",
        color: "sky",
        mathMaxSum: 5,
        createdAt: now,
      },
      {
        id: "child-penguin",
        name: "Penguin",
        avatar: "🐧",
        color: "violet",
        mathMaxSum: 10,
        createdAt: now,
      },
    ],
    ledger: [],
    prizes: [
      { id: "prize-screen", name: "30 min screen time", emoji: "🎮", cost: 30, active: true },
      { id: "prize-dinner", name: "Pick tonight's dinner", emoji: "🍕", cost: 50, active: true },
      { id: "prize-icecream", name: "Ice cream trip", emoji: "🍦", cost: 80, active: true },
      { id: "prize-trampoline", name: "Trampoline park trip", emoji: "🤸", cost: 200, active: true },
    ],
    redemptions: [],
    sessions: [],
    contentItems: [],
  };
}
