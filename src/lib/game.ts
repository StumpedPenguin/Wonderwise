import type { Question } from "./types";

// Procedural math — free, infinite, instant, and inherently safe.
// Generates addition and subtraction within the child's level (maxSum).

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeChoices(answer: number, maxSum: number): number[] {
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 4 && guard++ < 50) {
    const delta = randInt(1, 3) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = answer + delta;
    if (candidate >= 0 && candidate <= maxSum + 3) set.add(candidate);
  }
  // Fill if we couldn't find enough distinct distractors.
  let filler = 0;
  while (set.size < 4) set.add(maxSum + 1 + filler++);
  return shuffle([...set]);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateMathQuestions(
  maxSum: number,
  count: number,
): Question[] {
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    const isAdd = Math.random() < 0.6;
    let a: number;
    let b: number;
    let answer: number;
    let prompt: string;
    let spoken: string;

    if (isAdd) {
      a = randInt(0, maxSum);
      b = randInt(0, maxSum - a);
      answer = a + b;
      prompt = `${a} + ${b}`;
      spoken = `What is ${a} plus ${b}?`;
    } else {
      a = randInt(1, maxSum);
      b = randInt(0, a);
      answer = a - b;
      prompt = `${a} − ${b}`;
      spoken = `What is ${a} minus ${b}?`;
    }

    questions.push({
      id: crypto.randomUUID(),
      prompt,
      spoken,
      answer,
      choices: makeChoices(answer, maxSum),
    });
  }
  return questions;
}
