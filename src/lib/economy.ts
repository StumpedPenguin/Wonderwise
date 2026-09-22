import type { Difficulty } from "./types";

// The token economy.
//
// The child picks a difficulty before each game. Tokens are earned per correct
// answer at a rate set by that difficulty — but ONLY if they get at least 80%
// of the round correct. Below the bar, the round earns nothing.

export const QUESTIONS_PER_SESSION = 5;

/** Tokens earned per correct answer, by difficulty. */
export const PER_CORRECT: Record<Difficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 5,
};

/** Fraction of the round that must be correct to earn any tokens. */
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
  const tokens = passed ? correct * PER_CORRECT[difficulty] : 0;
  return { tokens, accuracy, passed };
}
