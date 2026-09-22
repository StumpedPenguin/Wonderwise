import type { Child, ContentItem, ContentStatus, DB } from "./types";
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

// AI reading content
export function listContent(status?: ContentStatus): Promise<ContentItem[]> {
  return getStore().listContent(status);
}
export function addContentItems(items: ContentItem[]): Promise<void> {
  return getStore().addContentItems(items);
}
export function setContentStatus(id: string, status: ContentStatus): Promise<void> {
  return getStore().setContentStatus(id, status);
}
export function deleteContent(id: string): Promise<void> {
  return getStore().deleteContent(id);
}
