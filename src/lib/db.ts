import type { Child, DB } from "./types";
import { getStore, balanceOf, earnedTodayOf, type Tx } from "./store";

// Thin facade over the active store backend (file or Postgres). Screens and
// server actions import from here and never care which backend is running.

export { balanceOf, earnedTodayOf };
export type { Tx };

/** Read the whole dataset for a page render. */
export function readDB(): Promise<DB> {
  return getStore().snapshot();
}

/** Run a set of writes atomically. */
export function transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return getStore().transaction(fn);
}

export async function getChild(id: string): Promise<Child | null> {
  const db = await readDB();
  return db.children.find((c) => c.id === id) ?? null;
}
