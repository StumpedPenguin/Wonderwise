// The token economy — the rules that make earning track real effort and
// resist grinding. All of this runs on the server; the client never decides
// how many tokens it gets.

export const QUESTIONS_PER_SESSION = 5;
export const BASE_PER_CORRECT = 2;
export const COMPLETION_BONUS = 5; // for hitting the accuracy bar
export const ACCURACY_BONUS_BAR = 0.8;
export const DAILY_CAP = 40; // per child, per day

/** Harder math is worth more, so tokens follow difficulty, not just volume. */
export function difficultyWeight(maxSum: number): number {
  if (maxSum <= 5) return 1.0;
  if (maxSum <= 10) return 1.2;
  if (maxSum <= 15) return 1.5;
  return 1.8;
}

export interface AwardInput {
  correct: number;
  total: number;
  /** Difficulty multiplier for this game/level (see difficultyWeight). */
  weight: number;
  earnedToday: number;
}

export interface AwardResult {
  tokens: number;
  hitDailyCap: boolean;
  accuracy: number;
  gotBonus: boolean;
}

/** Compute how many tokens a finished session earns, after the daily cap. */
export function computeAward({
  correct,
  total,
  weight,
  earnedToday,
}: AwardInput): AwardResult {
  const accuracy = total > 0 ? correct / total : 0;

  const gotBonus = accuracy >= ACCURACY_BONUS_BAR;
  const raw = Math.round(correct * BASE_PER_CORRECT * weight) + (gotBonus ? COMPLETION_BONUS : 0);

  const remaining = Math.max(0, DAILY_CAP - earnedToday);
  const tokens = Math.min(raw, remaining);

  return {
    tokens,
    hitDailyCap: raw > tokens,
    accuracy,
    gotBonus,
  };
}

/** Adaptive difficulty: nudge the child's math level from how they did. */
export function nextMaxSum(currentMaxSum: number, accuracy: number): number {
  const levels = [5, 10, 15, 20];
  const i = levels.indexOf(currentMaxSum);
  const idx = i === -1 ? 0 : i;
  if (accuracy >= 0.85 && idx < levels.length - 1) return levels[idx + 1];
  if (accuracy < 0.5 && idx > 0) return levels[idx - 1];
  return levels[idx];
}
