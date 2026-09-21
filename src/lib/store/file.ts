import { promises as fs } from "fs";
import path from "path";
import type { DB, RedemptionStatus } from "../types";
import { seedData } from "../seed";
import type { Store, Tx } from "./index";

// ---------------------------------------------------------------------------
// File-backed store: a single JSON document, edited under an in-process lock.
// Great for local dev and demos with zero setup. Not durable on serverless
// (each instance has its own /tmp) — that's what the Postgres backend is for.
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

async function read(): Promise<DB> {
  await ensureFile();
  return JSON.parse(await fs.readFile(DB_PATH, "utf8")) as DB;
}

async function write(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// Serialize mutations so concurrent server actions don't clobber the file.
let queue: Promise<unknown> = Promise.resolve();

function isToday(iso: string): boolean {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function makeTx(db: DB): Tx {
  return {
    async getChild(id) {
      return db.children.find((c) => c.id === id) ?? null;
    },
    async setChildMaxSum(id, maxSum) {
      const child = db.children.find((c) => c.id === id);
      if (child) child.mathMaxSum = maxSum;
    },
    async addLedger(childId, delta, reason) {
      db.ledger.push({
        id: crypto.randomUUID(),
        childId,
        delta,
        reason,
        createdAt: new Date().toISOString(),
      });
    },
    async balance(childId) {
      return db.ledger
        .filter((e) => e.childId === childId)
        .reduce((s, e) => s + e.delta, 0);
    },
    async earnedToday(childId) {
      return db.ledger
        .filter((e) => e.childId === childId && e.delta > 0 && isToday(e.createdAt))
        .reduce((s, e) => s + e.delta, 0);
    },
    async getSession(id) {
      return db.sessions.find((s) => s.id === id) ?? null;
    },
    async addSession(session) {
      db.sessions.push(session);
    },
    async markSessionFinished(id) {
      const s = db.sessions.find((x) => x.id === id);
      if (s) s.finishedAt = new Date().toISOString();
    },
    async getPrize(id) {
      return db.prizes.find((p) => p.id === id) ?? null;
    },
    async findPendingRedemption(childId, prizeId) {
      return (
        db.redemptions.find(
          (r) =>
            r.childId === childId &&
            r.prizeId === prizeId &&
            r.status === "pending",
        ) ?? null
      );
    },
    async getRedemption(id) {
      return db.redemptions.find((r) => r.id === id) ?? null;
    },
    async addRedemption(redemption) {
      db.redemptions.push(redemption);
    },
    async setRedemptionStatus(id, status: RedemptionStatus, decidedAt) {
      const r = db.redemptions.find((x) => x.id === id);
      if (r) {
        r.status = status;
        r.decidedAt = decidedAt;
      }
    },
  };
}

export function createFileStore(): Store {
  return {
    snapshot: read,
    transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
      const run = queue.then(async () => {
        const db = await read();
        const result = await fn(makeTx(db));
        await write(db);
        return result;
      });
      queue = run.catch(() => undefined);
      return run;
    },
  };
}
