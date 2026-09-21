import dns from "node:dns";
import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Prefer IPv4 when resolving the database host. Supabase's pooler can resolve
// to an IPv6 address that serverless functions (e.g. Vercel) often can't route,
// which shows up as a connection that hangs with no reply. Forcing IPv4-first
// avoids that black hole. Harmless if the host is already IPv4-only.
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* older runtimes may not support this; ignore */
}
import { and, eq, gt, gte, sql } from "drizzle-orm";
import * as schema from "../schema";
import type {
  Child,
  DB,
  GameSession,
  LedgerEntry,
  Prize,
  Redemption,
  RedemptionStatus,
} from "../types";
import type { Store, Tx } from "./index";

// ---------------------------------------------------------------------------
// Postgres/Drizzle backend. Activates when DATABASE_URL is set (e.g. a
// Supabase connection string). Use the pooled ("Transaction") connection
// string on serverless; `prepare: false` is required for that pooler.
//
// NOTE: this backend is code-complete and type-checked but has not yet been
// run against a live database in this environment — the first Supabase
// connection is the moment to verify it end to end.
// ---------------------------------------------------------------------------

type Database = PostgresJsDatabase<typeof schema>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

let db: Database | null = null;

function getDb(): Database {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Supabase requires TLS; the transaction pooler needs prepared statements off
  // and works best with type-fetching disabled. Short timeouts make a bad
  // connection fail fast (with a clear error) instead of hanging the request.
  const client = postgres(url, {
    prepare: false,
    max: 1,
    ssl: "require",
    fetch_types: false,
    connect_timeout: 10,
    idle_timeout: 20,
  });
  db = drizzle(client, { schema });
  return db;
}

const iso = (d: Date | null | undefined): string | undefined =>
  d ? new Date(d).toISOString() : undefined;

function toChild(r: typeof schema.children.$inferSelect): Child {
  return {
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    color: r.color,
    mathMaxSum: r.mathMaxSum,
    createdAt: iso(r.createdAt)!,
  };
}

function toLedger(r: typeof schema.ledger.$inferSelect): LedgerEntry {
  return {
    id: r.id,
    childId: r.childId,
    delta: r.delta,
    reason: r.reason,
    createdAt: iso(r.createdAt)!,
  };
}

function toPrize(r: typeof schema.prizes.$inferSelect): Prize {
  return { id: r.id, name: r.name, emoji: r.emoji, cost: r.cost, active: r.active };
}

function toRedemption(r: typeof schema.redemptions.$inferSelect): Redemption {
  return {
    id: r.id,
    childId: r.childId,
    prizeId: r.prizeId,
    status: r.status as RedemptionStatus,
    createdAt: iso(r.createdAt)!,
    decidedAt: iso(r.decidedAt),
  };
}

function toSession(r: typeof schema.sessions.$inferSelect): GameSession {
  return {
    id: r.id,
    childId: r.childId,
    gameId: r.gameId,
    questions: r.questions,
    startedAt: iso(r.startedAt)!,
    finishedAt: iso(r.finishedAt),
  };
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function makeTx(tx: Transaction): Tx {
  return {
    async getChild(id) {
      const [r] = await tx.select().from(schema.children).where(eq(schema.children.id, id));
      return r ? toChild(r) : null;
    },
    async setChildMaxSum(id, maxSum) {
      await tx.update(schema.children).set({ mathMaxSum: maxSum }).where(eq(schema.children.id, id));
    },
    async addLedger(childId, delta, reason) {
      await tx.insert(schema.ledger).values({ id: crypto.randomUUID(), childId, delta, reason });
    },
    async balance(childId) {
      const [row] = await tx
        .select({ total: sql<string>`coalesce(sum(${schema.ledger.delta}), 0)` })
        .from(schema.ledger)
        .where(eq(schema.ledger.childId, childId));
      return Number(row?.total ?? 0);
    },
    async earnedToday(childId) {
      const [row] = await tx
        .select({ total: sql<string>`coalesce(sum(${schema.ledger.delta}), 0)` })
        .from(schema.ledger)
        .where(
          and(
            eq(schema.ledger.childId, childId),
            gt(schema.ledger.delta, 0),
            gte(schema.ledger.createdAt, startOfToday()),
          ),
        );
      return Number(row?.total ?? 0);
    },
    async getSession(id) {
      const [r] = await tx.select().from(schema.sessions).where(eq(schema.sessions.id, id));
      return r ? toSession(r) : null;
    },
    async addSession(session) {
      await tx.insert(schema.sessions).values({
        id: session.id,
        childId: session.childId,
        gameId: session.gameId,
        questions: session.questions,
        startedAt: new Date(session.startedAt),
      });
    },
    async markSessionFinished(id) {
      await tx.update(schema.sessions).set({ finishedAt: new Date() }).where(eq(schema.sessions.id, id));
    },
    async getPrize(id) {
      const [r] = await tx.select().from(schema.prizes).where(eq(schema.prizes.id, id));
      return r ? toPrize(r) : null;
    },
    async findPendingRedemption(childId, prizeId) {
      const [r] = await tx
        .select()
        .from(schema.redemptions)
        .where(
          and(
            eq(schema.redemptions.childId, childId),
            eq(schema.redemptions.prizeId, prizeId),
            eq(schema.redemptions.status, "pending"),
          ),
        )
        .limit(1);
      return r ? toRedemption(r) : null;
    },
    async getRedemption(id) {
      const [r] = await tx.select().from(schema.redemptions).where(eq(schema.redemptions.id, id));
      return r ? toRedemption(r) : null;
    },
    async addRedemption(redemption) {
      await tx.insert(schema.redemptions).values({
        id: redemption.id,
        childId: redemption.childId,
        prizeId: redemption.prizeId,
        status: redemption.status,
        createdAt: new Date(redemption.createdAt),
      });
    },
    async setRedemptionStatus(id, status, decidedAt) {
      await tx
        .update(schema.redemptions)
        .set({ status, decidedAt: new Date(decidedAt) })
        .where(eq(schema.redemptions.id, id));
    },
    async upsertChild(child) {
      await tx
        .insert(schema.children)
        .values({
          id: child.id,
          name: child.name,
          avatar: child.avatar,
          color: child.color,
          mathMaxSum: child.mathMaxSum,
        })
        .onConflictDoUpdate({
          target: schema.children.id,
          set: {
            name: child.name,
            avatar: child.avatar,
            color: child.color,
            mathMaxSum: child.mathMaxSum,
          },
        });
    },
    async deleteChild(id) {
      await tx.delete(schema.ledger).where(eq(schema.ledger.childId, id));
      await tx.delete(schema.sessions).where(eq(schema.sessions.childId, id));
      await tx.delete(schema.redemptions).where(eq(schema.redemptions.childId, id));
      await tx.delete(schema.children).where(eq(schema.children.id, id));
    },
    async upsertPrize(prize) {
      await tx
        .insert(schema.prizes)
        .values({
          id: prize.id,
          name: prize.name,
          emoji: prize.emoji,
          cost: prize.cost,
          active: prize.active,
        })
        .onConflictDoUpdate({
          target: schema.prizes.id,
          set: {
            name: prize.name,
            emoji: prize.emoji,
            cost: prize.cost,
            active: prize.active,
          },
        });
    },
    async deletePrize(id) {
      await tx.delete(schema.redemptions).where(eq(schema.redemptions.prizeId, id));
      await tx.delete(schema.prizes).where(eq(schema.prizes.id, id));
    },
  };
}

// Hard cap on any single DB operation, so a stalled connection surfaces a
// readable error fast instead of hanging the whole request.
const OP_TIMEOUT_MS = 12000;

function withTimeout<T>(p: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `DB ${label} timed out after ${OP_TIMEOUT_MS}ms — the database ` +
                `did not respond (unreachable, wrong host/port, or blocked).`,
            ),
          ),
        OP_TIMEOUT_MS,
      ),
    ),
  ]);
}

export function createPgStore(): Store {
  return {
    snapshot(): Promise<DB> {
      const d = getDb();
      return withTimeout(
        (async () => {
          const [children, ledger, prizes, redemptions, sessions] =
            await Promise.all([
              d.select().from(schema.children),
              d.select().from(schema.ledger),
              d.select().from(schema.prizes),
              d.select().from(schema.redemptions),
              d.select().from(schema.sessions),
            ]);
          return {
            children: children.map(toChild),
            ledger: ledger.map(toLedger),
            prizes: prizes.map(toPrize),
            redemptions: redemptions.map(toRedemption),
            sessions: sessions.map(toSession),
          };
        })(),
        "read",
      );
    },
    transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
      return withTimeout(getDb().transaction((tx) => fn(makeTx(tx))), "write");
    },
  };
}
