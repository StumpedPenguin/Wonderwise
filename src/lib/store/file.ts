import { promises as fs } from "fs";
import path from "path";
import type { DB, Family, RedemptionStatus } from "../types";
import { seedData, seedFamily } from "../seed";
import type { Store, Tx } from "./index";

// ---------------------------------------------------------------------------
// File-backed store: a single JSON document, edited under an in-process lock.
// Everything is scoped by familyId, matching the Postgres backend.
// ---------------------------------------------------------------------------

type FileDB = DB & { families: Family[] };

const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === "production";
const DB_PATH = isServerless
  ? path.join("/tmp", "wonderwise-db.json")
  : path.join(process.cwd(), ".data", "wonderwise-db.json");

function initial(): FileDB {
  return { ...seedData(), families: [seedFamily()] };
}

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initial(), null, 2), "utf8");
  }
}

async function read(): Promise<FileDB> {
  await ensureFile();
  const db = JSON.parse(await fs.readFile(DB_PATH, "utf8")) as FileDB;
  if (!db.contentItems) db.contentItems = [];
  if (!db.families || db.families.length === 0) db.families = [seedFamily()];
  return db;
}

async function write(db: FileDB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// Serialize a read-modify-write against the file.
let queue: Promise<unknown> = Promise.resolve();
function writeOp<T>(fn: (db: FileDB) => Promise<T> | T): Promise<T> {
  const run = queue.then(async () => {
    const db = await read();
    const result = await fn(db);
    await write(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

function isToday(iso: string): boolean {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

/** A family-scoped view of the gameplay tables (no families array). */
function scopedSnapshot(db: FileDB, familyId: string): DB {
  const f = (x: { familyId: string }) => x.familyId === familyId;
  return {
    children: db.children.filter(f),
    ledger: db.ledger.filter(f),
    prizes: db.prizes.filter(f),
    redemptions: db.redemptions.filter(f),
    sessions: db.sessions.filter(f),
    contentItems: db.contentItems.filter(f),
  };
}

function makeTx(db: FileDB, familyId: string): Tx {
  const inFamily = (x: { familyId: string }) => x.familyId === familyId;
  return {
    async getChild(id) {
      return db.children.find((c) => c.id === id && inFamily(c)) ?? null;
    },
    async setChildMaxSum(id, maxSum) {
      const child = db.children.find((c) => c.id === id && inFamily(c));
      if (child) child.mathMaxSum = maxSum;
    },
    async addLedger(childId, delta, reason) {
      db.ledger.push({
        id: crypto.randomUUID(),
        familyId,
        childId,
        delta,
        reason,
        createdAt: new Date().toISOString(),
      });
    },
    async balance(childId) {
      return db.ledger
        .filter((e) => e.childId === childId && inFamily(e))
        .reduce((s, e) => s + e.delta, 0);
    },
    async earnedToday(childId) {
      return db.ledger
        .filter((e) => e.childId === childId && inFamily(e) && e.delta > 0 && isToday(e.createdAt))
        .reduce((s, e) => s + e.delta, 0);
    },
    async getSession(id) {
      return db.sessions.find((s) => s.id === id && inFamily(s)) ?? null;
    },
    async addSession(session) {
      db.sessions.push(session);
    },
    async markSessionFinished(id) {
      const s = db.sessions.find((x) => x.id === id && inFamily(x));
      if (s) s.finishedAt = new Date().toISOString();
    },
    async getPrize(id) {
      return db.prizes.find((p) => p.id === id && inFamily(p)) ?? null;
    },
    async findPendingRedemption(childId, prizeId) {
      return (
        db.redemptions.find(
          (r) =>
            inFamily(r) &&
            r.childId === childId &&
            r.prizeId === prizeId &&
            r.status === "pending",
        ) ?? null
      );
    },
    async getRedemption(id) {
      return db.redemptions.find((r) => r.id === id && inFamily(r)) ?? null;
    },
    async addRedemption(redemption) {
      db.redemptions.push(redemption);
    },
    async setRedemptionStatus(id, status: RedemptionStatus, decidedAt) {
      const r = db.redemptions.find((x) => x.id === id && inFamily(x));
      if (r) {
        r.status = status;
        r.decidedAt = decidedAt;
      }
    },
    async upsertChild(child) {
      const i = db.children.findIndex((c) => c.id === child.id && inFamily(c));
      if (i === -1) db.children.push(child);
      else db.children[i] = child;
    },
    async deleteChild(id) {
      if (!db.children.some((c) => c.id === id && inFamily(c))) return;
      db.children = db.children.filter((c) => c.id !== id);
      db.ledger = db.ledger.filter((e) => e.childId !== id);
      db.sessions = db.sessions.filter((s) => s.childId !== id);
      db.redemptions = db.redemptions.filter((r) => r.childId !== id);
    },
    async upsertPrize(prize) {
      const i = db.prizes.findIndex((p) => p.id === prize.id && inFamily(p));
      if (i === -1) db.prizes.push(prize);
      else db.prizes[i] = prize;
    },
    async deletePrize(id) {
      if (!db.prizes.some((p) => p.id === id && inFamily(p))) return;
      db.prizes = db.prizes.filter((p) => p.id !== id);
      db.redemptions = db.redemptions.filter((r) => r.prizeId !== id);
    },
  };
}

export function createFileStore(): Store {
  return {
    async snapshot(familyId) {
      return scopedSnapshot(await read(), familyId);
    },
    transaction<T>(familyId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
      return writeOp((db) => fn(makeTx(db, familyId)));
    },
    async listContent(familyId, status) {
      const db = await read();
      return db.contentItems.filter(
        (c) => c.familyId === familyId && (!status || c.status === status),
      );
    },
    addContentItems(_familyId, items) {
      return writeOp((db) => {
        db.contentItems.push(...items);
      });
    },
    setContentStatus(familyId, id, status) {
      return writeOp((db) => {
        const c = db.contentItems.find((x) => x.id === id && x.familyId === familyId);
        if (c) c.status = status;
      });
    },
    deleteContent(familyId, id) {
      return writeOp((db) => {
        db.contentItems = db.contentItems.filter(
          (c) => !(c.id === id && c.familyId === familyId),
        );
      });
    },
    async getFamily(id) {
      const db = await read();
      return db.families.find((f) => f.id === id) ?? null;
    },
    async getFamilyByOwner(ownerUserId) {
      const db = await read();
      return db.families.find((f) => f.ownerUserId === ownerUserId) ?? null;
    },
    createFamily(family) {
      return writeOp((db) => {
        db.families.push(family);
      });
    },
  };
}
