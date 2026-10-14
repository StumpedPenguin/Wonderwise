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

// --- Adaptive difficulty ----------------------------------------------------

export const LEVELS: Difficulty[] = ["easy", "medium", "hard"];

/**
 * The recommended next level after a lesson: nail it (≥90%) and move up, really
 * struggle (<60%) and move down, otherwise stay. Used by the "Auto" level.
 */
export function nextLevel(played: Difficulty, accuracy: number): Difficulty {
  const i = LEVELS.indexOf(played);
  if (accuracy >= 0.9 && i < LEVELS.length - 1) return LEVELS[i + 1];
  if (accuracy < 0.6 && i > 0) return LEVELS[i - 1];
  return played;
}
