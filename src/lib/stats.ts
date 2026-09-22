import type { DB } from "./types";
import { getGame } from "./games";

export interface DayBucket {
  label: string;
  earned: number;
}

export interface ChildStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  sessionsPlayed: number;
  perGame: { title: string; emoji: string; count: number }[];
  last7: DayBucket[];
  maxEarned: number;
  recent: { reason: string; delta: number; day: string }[];
}

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function childStats(db: DB, childId: string): ChildStats {
  const ledger = db.ledger
    .filter((e) => e.childId === childId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const balance = ledger.reduce((s, e) => s + e.delta, 0);
  const totalEarned = ledger.filter((e) => e.delta > 0).reduce((s, e) => s + e.delta, 0);
  const totalSpent = -ledger.filter((e) => e.delta < 0).reduce((s, e) => s + e.delta, 0);

  const finished = db.sessions.filter((s) => s.childId === childId && s.finishedAt);
  const sessionsPlayed = finished.length;

  const counts = new Map<string, number>();
  for (const s of finished) counts.set(s.gameId, (counts.get(s.gameId) ?? 0) + 1);
  const perGame = [...counts.entries()]
    .map(([gameId, count]) => {
      const g = getGame(gameId);
      return { title: g?.title ?? gameId, emoji: g?.emoji ?? "🎮", count };
    })
    .sort((a, b) => b.count - a.count);

  // Last 7 days of tokens earned (UTC days).
  const last7: DayBucket[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = dayKey(d);
    const earned = ledger
      .filter((e) => e.delta > 0 && e.createdAt.slice(0, 10) === key)
      .reduce((s, e) => s + e.delta, 0);
    last7.push({ label: WEEKDAY[d.getUTCDay()], earned });
  }
  const maxEarned = Math.max(1, ...last7.map((d) => d.earned));

  const recent = ledger.slice(0, 8).map((e) => ({
    reason: e.reason,
    delta: e.delta,
    day: WEEKDAY[new Date(e.createdAt).getUTCDay()],
  }));

  return {
    balance,
    totalEarned,
    totalSpent,
    sessionsPlayed,
    perGame,
    last7,
    maxEarned,
    recent,
  };
}
