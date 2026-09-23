// Core data shapes for Wonderwise.

export type Subject = "math" | "reading" | "writing";

export type Difficulty = "easy" | "medium" | "hard";

/** A household. Every child/prize/token belongs to exactly one family. */
export interface Family {
  id: string;
  name: string;
  /** The auth user who owns this family (null for the pre-auth default). */
  ownerUserId: string | null;
  createdAt: string;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  avatar: string; // an emoji, for now
  color: string; // a tailwind gradient pair id, e.g. "sky"
  /** Difficulty for math: the largest sum/minuend used. Adapts with accuracy. */
  mathMaxSum: number;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  familyId: string;
  childId: string;
  /** Positive = earned, negative = spent. Balance is the sum of these. */
  delta: number;
  reason: string;
  createdAt: string;
}

export interface Prize {
  id: string;
  familyId: string;
  name: string;
  emoji: string;
  cost: number;
  active: boolean;
}

export type RedemptionStatus = "pending" | "approved" | "denied" | "claimed";

export interface Redemption {
  id: string;
  familyId: string;
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
  /** When true, the child must READ (no text-to-speech, no 🔊 buttons). */
  silent?: boolean;
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
  familyId: string;
  type: "reading";
  status: ContentStatus;
  payload: ReadingPayload;
  createdAt: string;
}

export interface GameSession {
  id: string;
  familyId: string;
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
