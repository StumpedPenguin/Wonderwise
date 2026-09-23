import type { Difficulty } from "./types";

// The token economy.
//
// The child picks a difficulty before each game and plays one lesson. If they
// get at least 80% of the lesson correct, they earn a FLAT number of tokens set
// by that difficulty — the same number shown on the level button. Below the
// bar, the lesson earns nothing. (Tokens are per-lesson, NOT per question, so
// "Hard = 5" always means 5 tokens for the lesson.)

/** Tokens earned for passing a lesson, by difficulty. */
export const PER_LESSON: Record<Difficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 5,
};

/** Fraction of the lesson that must be correct to earn any tokens. */
export const ACCURACY_GATE = 0.8;

export interface AwardInput {
  correct: number;
  total: number;
  difficulty: Difficulty;
}

export interface AwardResult {
  tokens: number;
  accuracy: number;
  passed: boolean;
}

export function computeAward({ correct, total, difficulty }: AwardInput): AwardResult {
  const accuracy = total > 0 ? correct / total : 0;
  const passed = accuracy >= ACCURACY_GATE;
  const tokens = passed ? PER_LESSON[difficulty] : 0;
  return { tokens, accuracy, passed };
}
