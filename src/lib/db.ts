import type { Child, ContentItem, ContentStatus, DB, Family } from "./types";
import { getStore, balanceOf, earnedTodayOf, type Tx } from "./store";

// Thin facade over the active store backend (file or Postgres). Everything is
// scoped by familyId — callers derive it from the request (see lib/family.ts).

export { balanceOf, earnedTodayOf };
export type { Tx };

/** Read one family's dataset for a page render. */
export function readDB(familyId: string): Promise<DB> {
  return getStore().snapshot(familyId);
}

/** Run a set of writes atomically, scoped to one family. */
export function transaction<T>(familyId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return getStore().transaction(familyId, fn);
}

export async function getChild(familyId: string, id: string): Promise<Child | null> {
  const db = await readDB(familyId);
  return db.children.find((c) => c.id === id) ?? null;
}

// AI reading content
export function listContent(familyId: string, status?: ContentStatus): Promise<ContentItem[]> {
  return getStore().listContent(familyId, status);
}
export function addContentItems(familyId: string, items: ContentItem[]): Promise<void> {
  return getStore().addContentItems(familyId, items);
}
export function setContentStatus(familyId: string, id: string, status: ContentStatus): Promise<void> {
  return getStore().setContentStatus(familyId, id, status);
}
export function deleteContent(familyId: string, id: string): Promise<void> {
  return getStore().deleteContent(familyId, id);
}

// Families
export function getFamily(id: string): Promise<Family | null> {
  return getStore().getFamily(id);
}
export function getFamilyByOwner(ownerUserId: string): Promise<Family | null> {
  return getStore().getFamilyByOwner(ownerUserId);
}
export function createFamily(family: Family): Promise<void> {
  return getStore().createFamily(family);
}
