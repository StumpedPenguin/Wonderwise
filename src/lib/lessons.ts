import type { LedgerEntry } from "./types";

// Special "lesson" challenges: a Daily and a Weekly mixed quiz that can be
// earned once per period. Content is seeded from the date so it's the same for
// everyone that day/week and changes each period.

export type LessonKind = "daily" | "weekly";

/** How many questions each special lesson has. */
export const SPECIAL_COUNT: Record<LessonKind, number> = { daily: 20, weekly: 25 };

/** Flat token/coin reward for passing, by lesson. */
export const SPECIAL_REWARD: Record<LessonKind, number> = { daily: 15, weekly: 25 };

/** Ledger reason written when a lesson is earned (used to gate once-per-period). */
export const SPECIAL_REASON: Record<LessonKind, string> = {
  daily: "Daily Lesson",
  weekly: "Weekly Lesson",
};

export const SPECIAL_LABEL: Record<LessonKind, string> = {
  daily: "Daily Lesson",
  weekly: "Weekly Lesson",
};

// --- Date helpers (UTC, so a day/week boundary is the same everywhere) ------

export function startOfTodayUTC(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Monday 00:00 UTC of the given date's week. */
export function startOfWeekUTC(d = new Date()): Date {
  const x = startOfTodayUTC(d);
  const dow = x.getUTCDay(); // 0 = Sun … 6 = Sat
  const sinceMonday = dow === 0 ? 6 : dow - 1;
  x.setUTCDate(x.getUTCDate() - sinceMonday);
  return x;
}

/** A stable key for the current period — changes each day / each week. */
export function periodKey(kind: LessonKind, d = new Date()): string {
  return (kind === "daily" ? startOfTodayUTC(d) : startOfWeekUTC(d)).toISOString().slice(0, 10);
}

export function periodStart(kind: LessonKind): Date {
  return kind === "daily" ? startOfTodayUTC() : startOfWeekUTC();
}

/** Deterministic 32-bit seed from a string (FNV-1a). */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/** Has this child already earned this period's lesson? */
export function lessonDone(
  ledger: LedgerEntry[],
  childId: string,
  kind: LessonKind,
): boolean {
  const since = periodStart(kind);
  const reason = SPECIAL_REASON[kind];
  return ledger.some(
    (e) => e.childId === childId && e.reason === reason && new Date(e.createdAt) >= since,
  );
}
