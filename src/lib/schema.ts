import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import type { Question, ReadingPayload } from "./types";

// Drizzle schema — the source of truth for the Postgres database.
// Generate SQL with `npm run db:generate` and apply with `npm run db:migrate`.
//
// family_id columns are additive with a "family-default" default so applying
// the migration backfills existing rows and never breaks older code.

const DEFAULT_FAMILY = "family-default";

export const families = pgTable("families", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerUserId: text("owner_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const children = pgTable("children", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().default(DEFAULT_FAMILY),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  color: text("color").notNull(),
  mathMaxSum: integer("math_max_sum").notNull().default(5),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ledger = pgTable("ledger", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().default(DEFAULT_FAMILY),
  childId: text("child_id").notNull(),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const prizes = pgTable("prizes", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().default(DEFAULT_FAMILY),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  cost: integer("cost").notNull(),
  active: boolean("active").notNull().default(true),
});

export const redemptions = pgTable("redemptions", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().default(DEFAULT_FAMILY),
  childId: text("child_id").notNull(),
  prizeId: text("prize_id").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().default(DEFAULT_FAMILY),
  childId: text("child_id").notNull(),
  gameId: text("game_id").notNull(),
  questions: jsonb("questions").$type<Question[]>().notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const contentItems = pgTable("content_items", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().default(DEFAULT_FAMILY),
  type: text("type").notNull(),
  status: text("status").notNull(),
  payload: jsonb("payload").$type<ReadingPayload>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
