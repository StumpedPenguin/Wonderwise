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

// --- Date helpers -----------------------------------------------------------
// Day/week boundaries are anchored to a local timezone (default US Eastern, so
// the daily resets at local midnight and the weekly at midnight Sun→Mon).
// Override with the APP_TIMEZONE env var (an IANA zone like "America/Chicago").
// All computed server-side with Intl, so it's correct regardless of DST or the
// server's own timezone.

const APP_TZ = process.env.APP_TIMEZONE || "America/New_York";
const DAY_MS = 86_400_000;

/** How far local wall-clock in APP_TZ is ahead of UTC at `date`, in ms. */
function tzOffsetMs(date: Date): number {
  const p: Record<string, string> = {};
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  const asUTC = Date.UTC(
    +p.year,
    +p.month - 1,
    +p.day,
    +p.hour % 24,
    +p.minute,
    +p.second,
  );
  return asUTC - date.getTime();
}

/** The local calendar date (in APP_TZ) of an instant, as "YYYY-MM-DD". */
function localYMD(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** The UTC instant of local midnight (in APP_TZ) on the given date's day. */
export function startOfToday(d = new Date()): Date {
  const [y, m, day] = localYMD(d).split("-").map(Number);
  const guess = Date.UTC(y, m - 1, day); // local wall-clock midnight as if UTC
  return new Date(guess - tzOffsetMs(new Date(guess)));
}

/** Local day of week in APP_TZ: 0 = Sun … 6 = Sat. */
function localDayOfWeek(d: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: APP_TZ, weekday: "short" }).format(d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

/** The UTC instant of local midnight on this week's Monday (week starts Mon). */
export function startOfWeek(d = new Date()): Date {
  const dow = localDayOfWeek(d);
  const sinceMonday = dow === 0 ? 6 : dow - 1;
  const mondayish = new Date(startOfToday(d).getTime() - sinceMonday * DAY_MS);
  return startOfToday(mondayish); // re-anchor to local midnight (handles DST)
}

/** A stable key for the current period — changes each day / each week. */
export function periodKey(kind: LessonKind, d = new Date()): string {
  return localYMD(kind === "daily" ? startOfToday(d) : startOfWeek(d));
}

export function periodStart(kind: LessonKind): Date {
  return kind === "daily" ? startOfToday() : startOfWeek();
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
