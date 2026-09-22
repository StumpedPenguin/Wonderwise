import type { Child, Question, Subject } from "./types";
import { QUESTIONS_PER_SESSION, difficultyWeight, nextMaxSum } from "./economy";

// ---------------------------------------------------------------------------
// Procedural games — free, infinite, instant, and inherently safe.
// Each game plugs into one registry: it knows how to generate a round, how
// much its correct answers are worth (weight), and how difficulty adapts.
// ---------------------------------------------------------------------------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function numberChoices(answer: number, maxSum: number): string[] {
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 4 && guard++ < 50) {
    const delta = randInt(1, 3) * (Math.random() < 0.5 ? -1 : 1);
    const c = answer + delta;
    if (c >= 0 && c <= maxSum + 3) set.add(c);
  }
  let filler = 0;
  while (set.size < 4) set.add(maxSum + 1 + filler++);
  return shuffle([...set]).map(String);
}

// --- Math: add & subtract ---------------------------------------------------

function generateMath(maxSum: number, count: number): Question[] {
  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    const isAdd = Math.random() < 0.55;
    let a: number, b: number, answer: number, promptText: string, spoken: string;
    if (isAdd) {
      // Both operands >= 1 and answer >= 2 (no +0 and no 0 answers).
      a = randInt(1, Math.max(1, maxSum - 1));
      b = randInt(1, Math.max(1, maxSum - a));
      answer = a + b;
      promptText = `${a} + ${b}`;
      spoken = `What is ${a} plus ${b}?`;
    } else {
      // a >= 2, 1 <= b <= a-1  → answer between 1 and a-1 (never 0, never −0).
      a = randInt(2, Math.max(2, maxSum));
      b = randInt(1, a - 1);
      answer = a - b;
      promptText = `${a} − ${b}`;
      spoken = `What is ${a} minus ${b}?`;
    }
    out.push({
      id: crypto.randomUUID(),
      kind: "choice",
      spoken,
      promptText,
      answer: String(answer),
      choices: numberChoices(answer, maxSum),
    });
  }
  return out;
}

// --- Count & Tap ------------------------------------------------------------

const COUNTABLES = [
  { emoji: "🍎", name: "apples" },
  { emoji: "⭐", name: "stars" },
  { emoji: "🐟", name: "fish" },
  { emoji: "🌸", name: "flowers" },
  { emoji: "🎈", name: "balloons" },
  { emoji: "🍌", name: "bananas" },
  { emoji: "🐝", name: "bees" },
  { emoji: "🚗", name: "cars" },
];

function generateCount(maxSum: number, count: number): Question[] {
  const cap = Math.min(Math.max(maxSum, 5), 10);
  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    const item = COUNTABLES[randInt(0, COUNTABLES.length - 1)];
    const n = randInt(1, cap);
    out.push({
      id: crypto.randomUUID(),
      kind: "choice",
      spoken: `How many ${item.name}? Count them!`,
      promptText: item.emoji.repeat(n),
      answer: String(n),
      choices: numberChoices(n, cap),
    });
  }
  return out;
}

// --- Words (shared by Read the Word and Build a Word) ------------------------

const WORDS = [
  // 3-letter
  { w: "cat", e: "🐱" }, { w: "dog", e: "🐶" }, { w: "sun", e: "☀️" },
  { w: "hat", e: "🎩" }, { w: "bed", e: "🛏️" }, { w: "pig", e: "🐷" },
  { w: "cup", e: "🥤" }, { w: "bus", e: "🚌" }, { w: "box", e: "📦" },
  { w: "fox", e: "🦊" }, { w: "pen", e: "🖊️" }, { w: "bag", e: "🎒" },
  { w: "hen", e: "🐔" }, { w: "bee", e: "🐝" }, { w: "owl", e: "🦉" },
  // 4-letter
  { w: "fish", e: "🐟" }, { w: "frog", e: "🐸" }, { w: "star", e: "⭐" },
  { w: "moon", e: "🌙" }, { w: "cake", e: "🍰" }, { w: "ball", e: "⚽" },
  { w: "bird", e: "🐦" }, { w: "tree", e: "🌳" }, { w: "boat", e: "⛵" },
  { w: "milk", e: "🥛" }, { w: "duck", e: "🦆" }, { w: "lion", e: "🦁" },
  { w: "bear", e: "🐻" }, { w: "corn", e: "🌽" }, { w: "leaf", e: "🍃" },
];

// --- Read the Word (reading) -----------------------------------------------

function generateReadWord(count: number): Question[] {
  return shuffle(WORDS)
    .slice(0, count)
    .map(({ w, e }) => {
      const distractors = shuffle(WORDS.filter((x) => x.w !== w))
        .slice(0, 3)
        .map((x) => x.w);
      return {
        id: crypto.randomUUID(),
        kind: "choice" as const,
        // Say the word aloud; the child reads the options to find the match.
        spoken: `Find the word ${w}.`,
        promptText: e,
        answer: w,
        choices: shuffle([w, ...distractors]),
      };
    });
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

function generateSpell(count: number): Question[] {
  const picks = shuffle(WORDS).slice(0, count);
  return picks.map(({ w, e }) => {
    const bank = w.split("");
    // add one distractor letter not already in the word
    let d = ALPHABET[randInt(0, 25)];
    let guard = 0;
    while (bank.includes(d) && guard++ < 30) d = ALPHABET[randInt(0, 25)];
    bank.push(d);
    return {
      id: crypto.randomUUID(),
      kind: "spell" as const,
      spoken: `Spell the word: ${w}!`,
      promptText: e,
      answer: w,
      choices: shuffle(bank),
    };
  });
}

// --- Tracing (handwriting) --------------------------------------------------

const TRACEABLE = "ABCDEFGHJKLMNOPRSTUW".split("").concat("012345678".split(""));

function generateTrace(count: number): Question[] {
  return shuffle(TRACEABLE)
    .slice(0, count)
    .map((glyph) => {
      const isLetter = /[A-Z]/.test(glyph);
      return {
        id: crypto.randomUUID(),
        kind: "trace" as const,
        spoken: `Trace the ${isLetter ? "letter" : "number"} ${glyph}.`,
        promptText: glyph,
        answer: "traced",
        choices: [],
      };
    });
}

// --- Registry ---------------------------------------------------------------

export interface GameDef {
  id: string;
  subject: Subject;
  title: string;
  emoji: string;
  /** Tailwind-ish color key used for the card (see theme). */
  color: string;
  generate: (child: Child) => Question[];
  /** Token multiplier for this game at the child's current level. */
  weight: (child: Child) => number;
  /** Difficulty changes to persist after a round; empty = no change. */
  adapt: (child: Child, accuracy: number) => { mathMaxSum?: number };
}

export const GAMES: GameDef[] = [
  {
    id: "math-add-sub",
    subject: "math",
    title: "Add & Subtract",
    emoji: "➕",
    color: "sky",
    generate: (c) => generateMath(c.mathMaxSum, QUESTIONS_PER_SESSION),
    weight: (c) => difficultyWeight(c.mathMaxSum),
    adapt: (c, acc) => ({ mathMaxSum: nextMaxSum(c.mathMaxSum, acc) }),
  },
  {
    id: "count-tap",
    subject: "math",
    title: "Count & Tap",
    emoji: "🔢",
    color: "teal",
    generate: (c) => generateCount(c.mathMaxSum, QUESTIONS_PER_SESSION),
    weight: (c) => difficultyWeight(c.mathMaxSum),
    adapt: (c, acc) => ({ mathMaxSum: nextMaxSum(c.mathMaxSum, acc) }),
  },
  {
    id: "read-the-word",
    subject: "reading",
    title: "Read the Word",
    emoji: "📖",
    color: "indigo",
    generate: () => generateReadWord(QUESTIONS_PER_SESSION),
    weight: () => 1.3,
    adapt: () => ({}),
  },
  {
    id: "build-a-word",
    subject: "writing",
    title: "Build a Word",
    emoji: "✏️",
    color: "violet",
    generate: () => generateSpell(QUESTIONS_PER_SESSION),
    weight: () => 1.4,
    adapt: () => ({}),
  },
  {
    id: "tracing",
    subject: "writing",
    title: "Tracing",
    emoji: "✍️",
    color: "emerald",
    generate: () => generateTrace(QUESTIONS_PER_SESSION),
    weight: () => 1.3,
    adapt: () => ({}),
  },
];

export function getGame(id: string): GameDef | undefined {
  return GAMES.find((g) => g.id === id);
}
