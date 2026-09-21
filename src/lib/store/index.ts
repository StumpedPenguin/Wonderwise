import type {
  Child,
  DB,
  GameSession,
  Prize,
  Redemption,
  RedemptionStatus,
} from "../types";
import { createFileStore } from "./file";
import { createPgStore } from "./postgres";

// ---------------------------------------------------------------------------
// The data layer, behind one small interface with two interchangeable
// backends:
//
//   • File backend  — default. Zero setup, used for local dev and demos.
//   • Postgres/Drizzle backend — activates when DATABASE_URL is set
//     (e.g. a Supabase connection string). Durable and safe on serverless.
//
// Screens read a full snapshot(); every write goes through transaction(),
// which is atomic in both backends. Swapping backends changes nothing above
// this file.
// ---------------------------------------------------------------------------

/** Granular operations available inside a transaction. */
export interface Tx {
  getChild(id: string): Promise<Child | null>;
  setChildMaxSum(id: string, maxSum: number): Promise<void>;

  addLedger(childId: string, delta: number, reason: string): Promise<void>;
  balance(childId: string): Promise<number>;
  earnedToday(childId: string): Promise<number>;

  getSession(id: string): Promise<GameSession | null>;
  addSession(session: GameSession): Promise<void>;
  markSessionFinished(id: string): Promise<void>;

  getPrize(id: string): Promise<Prize | null>;
  findPendingRedemption(
    childId: string,
    prizeId: string,
  ): Promise<Redemption | null>;
  getRedemption(id: string): Promise<Redemption | null>;
  addRedemption(redemption: Redemption): Promise<void>;
  setRedemptionStatus(
    id: string,
    status: RedemptionStatus,
    decidedAt: string,
  ): Promise<void>;
}

export interface Store {
  /** Read the whole (small) dataset for a page render. */
  snapshot(): Promise<DB>;
  /** Run a set of writes atomically. */
  transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
}

// --- Pure helpers over a snapshot (used by page components) ----------------

export function balanceOf(db: DB, childId: string): number {
  return db.ledger
    .filter((e) => e.childId === childId)
    .reduce((sum, e) => sum + e.delta, 0);
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

// --- Backend selection ------------------------------------------------------

let cached: Store | null = null;

export function getStore(): Store {
  if (cached) return cached;
  cached = process.env.DATABASE_URL ? createPgStore() : createFileStore();
  return cached;
}
