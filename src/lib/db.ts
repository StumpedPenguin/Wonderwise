import { promises as fs } from "fs";
import path from "path";
import type { DB, LedgerEntry } from "./types";
import { seedData } from "./seed";

// ---------------------------------------------------------------------------
// File-backed store for the Stage 1 slice.
//
// Why not Supabase yet? The vertical slice exists to prove the whole
// learn -> earn -> redeem -> approve loop works. That needs real persistence
// across requests, not a hosted Postgres. This store gives us that with zero
// setup: locally it writes to ./.data, on a serverless host it uses /tmp.
//
// Everything the app does goes through the small set of functions below, so
// swapping this implementation for Drizzle + Supabase later is a contained
// change — the callers don't move.
// ---------------------------------------------------------------------------

const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === "production";
const DB_PATH = isServerless
  ? path.join("/tmp", "wonderwise-db.json")
  : path.join(process.cwd(), ".data", "wonderwise-db.json");

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(seedData(), null, 2), "utf8");
  }
}

export async function readDB(): Promise<DB> {
  await ensureFile();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as DB;
}

async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// Serialize mutations so concurrent server actions don't clobber the file.
let queue: Promise<unknown> = Promise.resolve();

export function mutate<T>(fn: (db: DB) => Promise<T> | T): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDB();
    const result = await fn(db);
    await writeDB(db);
    return result;
  });
  // Keep the chain going even if one mutation throws.
  queue = run.catch(() => undefined);
  return run;
}

// --- Read helpers -----------------------------------------------------------

export async function getChild(childId: string) {
  const db = await readDB();
  return db.children.find((c) => c.id === childId) ?? null;
}

export function balanceOf(db: DB, childId: string): number {
  return db.ledger
    .filter((e) => e.childId === childId)
    .reduce((sum, e) => sum + e.delta, 0);
}

export async function getBalance(childId: string): Promise<number> {
  const db = await readDB();
  return balanceOf(db, childId);
}

export function earnedTodayOf(db: DB, childId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  return db.ledger
    .filter(
      (e) =>
        e.childId === childId &&
        e.delta > 0 &&
        e.createdAt.slice(0, 10) === today,
    )
    .reduce((sum, e) => sum + e.delta, 0);
}

export function addLedger(
  db: DB,
  childId: string,
  delta: number,
  reason: string,
): LedgerEntry {
  const entry: LedgerEntry = {
    id: crypto.randomUUID(),
    childId,
    delta,
    reason,
    createdAt: new Date().toISOString(),
  };
  db.ledger.push(entry);
  return entry;
}
