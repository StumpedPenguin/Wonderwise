// Core data shapes for Wonderwise.
//
// In this Stage 1 slice these live in a file-backed JSON store (see db.ts).
// The same shapes map cleanly onto Postgres tables when we move to Supabase +
// Drizzle in a later stage — this file becomes the Drizzle schema's source of truth.

export type Subject = "math" | "reading" | "writing";

export interface Child {
  id: string;
  name: string;
  avatar: string; // an emoji, for now
  color: string; // a tailwind gradient pair id, e.g. "sky"
  /** Difficulty for math: the largest sum/minuend used. Adapts with accuracy. */
  mathMaxSum: number;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  childId: string;
  /** Positive = earned, negative = spent. Balance is the sum of these. */
  delta: number;
  reason: string;
  createdAt: string;
}

export interface Prize {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  active: boolean;
}

export type RedemptionStatus = "pending" | "approved" | "denied";

export interface Redemption {
  id: string;
  childId: string;
  prizeId: string;
  status: RedemptionStatus;
  createdAt: string;
  decidedAt?: string;
}

export type QuestionKind = "choice" | "spell" | "trace";

export interface Question {
  id: string;
  kind: QuestionKind;
  /** Read aloud to the child. */
  spoken: string;
  /** The big on-screen prompt: a math expression, a row of emojis, a picture,
   *  or "🔊" for listen-only games. */
  promptText: string;
  /** The canonical correct answer, as a string (e.g. "7", "B", "cat"). */
  answer: string;
  /** For "choice": the tappable options. For "spell": the shuffled letter bank. */
  choices: string[];
}

export interface GameSession {
  id: string;
  childId: string;
  gameId: string;
  questions: Question[];
  startedAt: string;
  finishedAt?: string;
}

export interface DB {
  children: Child[];
  ledger: LedgerEntry[];
  prizes: Prize[];
  redemptions: Redemption[];
  sessions: GameSession[];
}
