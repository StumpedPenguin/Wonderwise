import dns from "node:dns";
import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Prefer IPv4 when resolving the database host (Supabase's pooler can resolve to
// an IPv6 address serverless functions can't route). Harmless if already IPv4.
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* older runtimes may not support this; ignore */
}
import { and, eq, gt, gte, sql } from "drizzle-orm";
import * as schema from "../schema";
import type {
  Child,
  ContentItem,
  ContentStatus,
  DB,
  Family,
  GameSession,
  LedgerEntry,
  Prize,
  Redemption,
  RedemptionStatus,
} from "../types";
import type { Store, Tx } from "./index";

// ---------------------------------------------------------------------------
// Postgres/Drizzle backend, scoped by family_id. Activates when DATABASE_URL
// is set. Requires migration 0002 (family_id columns + families table).
// ---------------------------------------------------------------------------

type Database = PostgresJsDatabase<typeof schema>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

let db: Database | null = null;

function getDb(): Database {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
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
    familyId: r.familyId,
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
    familyId: r.familyId,
    childId: r.childId,
    delta: r.delta,
    reason: r.reason,
    createdAt: iso(r.createdAt)!,
  };
}

function toPrize(r: typeof schema.prizes.$inferSelect): Prize {
  return {
    id: r.id,
    familyId: r.familyId,
    name: r.name,
    emoji: r.emoji,
    cost: r.cost,
    active: r.active,
  };
}

function toRedemption(r: typeof schema.redemptions.$inferSelect): Redemption {
  return {
    id: r.id,
    familyId: r.familyId,
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
    familyId: r.familyId,
    childId: r.childId,
    gameId: r.gameId,
    questions: r.questions,
    startedAt: iso(r.startedAt)!,
    finishedAt: iso(r.finishedAt),
  };
}

function toContent(r: typeof schema.contentItems.$inferSelect): ContentItem {
  return {
    id: r.id,
    familyId: r.familyId,
    type: r.type as "reading",
    status: r.status as ContentStatus,
    payload: r.payload,
    createdAt: iso(r.createdAt)!,
  };
}

function toFamily(r: typeof schema.families.$inferSelect): Family {
  return { id: r.id, name: r.name, ownerUserId: r.ownerUserId, createdAt: iso(r.createdAt)! };
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isMissingRelation(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return (
    err?.code === "42P01" ||
    err?.code === "42703" ||
    /relation .* does not exist|column .* does not exist/i.test(err?.message ?? "")
  );
}

function makeTx(tx: Transaction, familyId: string): Tx {
  const C = schema.children;
  const L = schema.ledger;
  const P = schema.prizes;
  const R = schema.redemptions;
  const S = schema.sessions;

  return {
    async getChild(id) {
      const [r] = await tx.select().from(C).where(and(eq(C.id, id), eq(C.familyId, familyId)));
      return r ? toChild(r) : null;
    },
    async setChildMaxSum(id, maxSum) {
      await tx.update(C).set({ mathMaxSum: maxSum }).where(and(eq(C.id, id), eq(C.familyId, familyId)));
    },
    async addLedger(childId, delta, reason) {
      await tx.insert(L).values({ id: crypto.randomUUID(), familyId, childId, delta, reason });
    },
    async balance(childId) {
      const [row] = await tx
        .select({ total: sql<string>`coalesce(sum(${L.delta}), 0)` })
        .from(L)
        .where(and(eq(L.childId, childId), eq(L.familyId, familyId)));
      return Number(row?.total ?? 0);
    },
    async earnedToday(childId) {
      const [row] = await tx
        .select({ total: sql<string>`coalesce(sum(${L.delta}), 0)` })
        .from(L)
        .where(
          and(
            eq(L.childId, childId),
            eq(L.familyId, familyId),
            gt(L.delta, 0),
            gte(L.createdAt, startOfToday()),
          ),
        );
      return Number(row?.total ?? 0);
    },
    async getSession(id) {
      const [r] = await tx.select().from(S).where(and(eq(S.id, id), eq(S.familyId, familyId)));
      return r ? toSession(r) : null;
    },
    async addSession(session) {
      await tx.insert(S).values({
        id: session.id,
        familyId: session.familyId,
        childId: session.childId,
        gameId: session.gameId,
        questions: session.questions,
        startedAt: new Date(session.startedAt),
      });
    },
    async markSessionFinished(id) {
      await tx.update(S).set({ finishedAt: new Date() }).where(and(eq(S.id, id), eq(S.familyId, familyId)));
    },
    async getPrize(id) {
      const [r] = await tx.select().from(P).where(and(eq(P.id, id), eq(P.familyId, familyId)));
      return r ? toPrize(r) : null;
    },
    async findPendingRedemption(childId, prizeId) {
      const [r] = await tx
        .select()
        .from(R)
        .where(
          and(
            eq(R.familyId, familyId),
            eq(R.childId, childId),
            eq(R.prizeId, prizeId),
            eq(R.status, "pending"),
          ),
        )
        .limit(1);
      return r ? toRedemption(r) : null;
    },
    async getRedemption(id) {
      const [r] = await tx.select().from(R).where(and(eq(R.id, id), eq(R.familyId, familyId)));
      return r ? toRedemption(r) : null;
    },
    async addRedemption(redemption) {
      await tx.insert(R).values({
        id: redemption.id,
        familyId: redemption.familyId,
        childId: redemption.childId,
        prizeId: redemption.prizeId,
        status: redemption.status,
        createdAt: new Date(redemption.createdAt),
      });
    },
    async setRedemptionStatus(id, status, decidedAt) {
      await tx
        .update(R)
        .set({ status, decidedAt: new Date(decidedAt) })
        .where(and(eq(R.id, id), eq(R.familyId, familyId)));
    },
    async upsertChild(child) {
      await tx
        .insert(C)
        .values({
          id: child.id,
          familyId,
          name: child.name,
          avatar: child.avatar,
          color: child.color,
          mathMaxSum: child.mathMaxSum,
        })
        .onConflictDoUpdate({
          target: C.id,
          set: { name: child.name, avatar: child.avatar, color: child.color, mathMaxSum: child.mathMaxSum },
        });
    },
    async deleteChild(id) {
      await tx.delete(L).where(and(eq(L.childId, id), eq(L.familyId, familyId)));
      await tx.delete(S).where(and(eq(S.childId, id), eq(S.familyId, familyId)));
      await tx.delete(R).where(and(eq(R.childId, id), eq(R.familyId, familyId)));
      await tx.delete(C).where(and(eq(C.id, id), eq(C.familyId, familyId)));
    },
    async upsertPrize(prize) {
      await tx
        .insert(P)
        .values({
          id: prize.id,
          familyId,
          name: prize.name,
          emoji: prize.emoji,
          cost: prize.cost,
          active: prize.active,
        })
        .onConflictDoUpdate({
          target: P.id,
          set: { name: prize.name, emoji: prize.emoji, cost: prize.cost, active: prize.active },
        });
    },
    async deletePrize(id) {
      await tx.delete(R).where(and(eq(R.prizeId, id), eq(R.familyId, familyId)));
      await tx.delete(P).where(and(eq(P.id, id), eq(P.familyId, familyId)));
    },
  };
}

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
    snapshot(familyId): Promise<DB> {
      const d = getDb();
      return withTimeout(
        (async () => {
          const [children, ledger, prizes, redemptions, sessions] = await Promise.all([
            d.select().from(schema.children).where(eq(schema.children.familyId, familyId)),
            d.select().from(schema.ledger).where(eq(schema.ledger.familyId, familyId)),
            d.select().from(schema.prizes).where(eq(schema.prizes.familyId, familyId)),
            d.select().from(schema.redemptions).where(eq(schema.redemptions.familyId, familyId)),
            d.select().from(schema.sessions).where(eq(schema.sessions.familyId, familyId)),
          ]);
          return {
            children: children.map(toChild),
            ledger: ledger.map(toLedger),
            prizes: prizes.map(toPrize),
            redemptions: redemptions.map(toRedemption),
            sessions: sessions.map(toSession),
            contentItems: [], // served via listContent
          };
        })(),
        "read",
      );
    },
    transaction<T>(familyId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
      return withTimeout(getDb().transaction((tx) => fn(makeTx(tx, familyId))), "write");
    },
    listContent(familyId, status) {
      const d = getDb();
      return withTimeout(
        (async () => {
          try {
            const where = status
              ? and(eq(schema.contentItems.familyId, familyId), eq(schema.contentItems.status, status))
              : eq(schema.contentItems.familyId, familyId);
            const rows = await d.select().from(schema.contentItems).where(where);
            return rows.map(toContent);
          } catch (e) {
            if (isMissingRelation(e)) return [];
            throw e;
          }
        })(),
        "read",
      );
    },
    async addContentItems(_familyId, items) {
      if (!items.length) return;
      await withTimeout(
        getDb()
          .insert(schema.contentItems)
          .values(
            items.map((i) => ({
              id: i.id,
              familyId: i.familyId,
              type: i.type,
              status: i.status,
              payload: i.payload,
              createdAt: new Date(i.createdAt),
            })),
          ),
        "write",
      );
    },
    async setContentStatus(familyId, id, status) {
      await withTimeout(
        getDb()
          .update(schema.contentItems)
          .set({ status })
          .where(and(eq(schema.contentItems.id, id), eq(schema.contentItems.familyId, familyId))),
        "write",
      );
    },
    async deleteContent(familyId, id) {
      await withTimeout(
        getDb()
          .delete(schema.contentItems)
          .where(and(eq(schema.contentItems.id, id), eq(schema.contentItems.familyId, familyId))),
        "write",
      );
    },
    getFamily(id) {
      const d = getDb();
      return withTimeout(
        (async () => {
          try {
            const [r] = await d.select().from(schema.families).where(eq(schema.families.id, id));
            return r ? toFamily(r) : null;
          } catch (e) {
            if (isMissingRelation(e)) return null;
            throw e;
          }
        })(),
        "read",
      );
    },
    getFamilyByOwner(ownerUserId) {
      const d = getDb();
      return withTimeout(
        (async () => {
          try {
            const [r] = await d
              .select()
              .from(schema.families)
              .where(eq(schema.families.ownerUserId, ownerUserId))
              .limit(1);
            return r ? toFamily(r) : null;
          } catch (e) {
            if (isMissingRelation(e)) return null;
            throw e;
          }
        })(),
        "read",
      );
    },
    async createFamily(family) {
      await withTimeout(
        getDb().insert(schema.families).values({
          id: family.id,
          name: family.name,
          ownerUserId: family.ownerUserId,
          createdAt: new Date(family.createdAt),
        }),
        "write",
      );
    },
  };
}
