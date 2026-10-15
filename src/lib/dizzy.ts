import type { Difficulty } from "./types";

// "Dizzy Digits": fill the blank boxes across several addition equations using
// each digit 0..maxDigit exactly once, so every equation is true.

export interface DizzyCell {
  v: number; // the intended value (a solution exists by construction)
  blank: boolean; // blank = the kid fills it; otherwise shown
}

export interface DizzyEquation {
  a: DizzyCell;
  b: DizzyCell;
  c: DizzyCell; // a + b = c
}

export interface DizzyPuzzle {
  maxDigit: number; // the digit pool is 0..maxDigit
  equations: DizzyEquation[];
}

/** Highest digit in the pool, by difficulty (0-5, 0-7, 0-9). */
export const DIZZY_MAX: Record<Difficulty, number> = { easy: 5, medium: 7, hard: 9 };

/** Puzzles per lesson — fewer as the puzzles get bigger. */
export const DIZZY_PUZZLES: Record<Difficulty, number> = { easy: 3, medium: 2, hard: 1 };
