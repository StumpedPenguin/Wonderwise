// Core data shapes for Wonderwise.
//
// In this Stage 1 slice these live in a file-backed JSON store (see db.ts).
// The same shapes map cleanly onto Postgres tables when we move to Supabase +
// Drizzle in a later stage — this file becomes the Drizzle schema's source of truth.

export type Subject = "math" | "reading" | "writing";

export type Difficulty = "easy" | "medium" | "hard";

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

export type RedemptionStatus = "pending" | "approved" | "denied" | "claimed";

export interface Redemption {
  id: string;
  childId: string;
  prizeId: string;
  status: RedemptionStatus;
  createdAt: string;
  decidedAt?: string;
}

export type QuestionKind = "choice" | "spell" | "trace" | "reading";

export interface Question {
  id: string;
  kind: QuestionKind;
  /** The difficulty this round was played at (drives the token reward). */
  difficulty: Difficulty;
  /** Read aloud to the child. */
  spoken: string;
  /** The big on-screen prompt: a math expression, a row of emojis, a picture,
   *  or "🔊" for listen-only games. */
  promptText: string;
  /** The canonical correct answer, as a string (e.g. "7", "B", "cat"). */
  answer: string;
  /** For "choice": the tappable options. For "spell": the shuffled letter bank. */
  choices: string[];
  /** For "reading": the passage to show and read aloud. */
  passage?: string;
}

// --- AI reading content -----------------------------------------------------

export type ContentStatus = "pending" | "approved" | "rejected";

export interface ReadingQuestion {
  q: string;
  choices: string[];
  answer: string;
}

export interface ReadingPayload {
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

export interface ContentItem {
  id: string;
  type: "reading";
  status: ContentStatus;
  payload: ReadingPayload;
  createdAt: string;
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
  contentItems: ContentItem[];
}
