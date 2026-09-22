import type { Difficulty, Question, Subject } from "./types";
import { QUESTIONS_PER_SESSION } from "./economy";

// ---------------------------------------------------------------------------
// Procedural games — free, infinite, instant, safe. Each game generates a
// round at the chosen difficulty; difficulty scales the content and (via the
// economy) the token reward. Every question is tagged with its difficulty so
// grading and awarding stay server-authoritative.
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
  while (set.size < 4 && guard++ < 60) {
    const delta = randInt(1, 3) * (Math.random() < 0.5 ? -1 : 1);
    const c = answer + delta;
    if (c >= 0 && c <= maxSum + 3) set.add(c);
  }
  let filler = 0;
  while (set.size < 4) set.add(maxSum + 1 + filler++);
  return shuffle([...set]).map(String);
}

// --- Math: add & subtract ---------------------------------------------------

const MATH_MAX: Record<Difficulty, number> = { easy: 5, medium: 10, hard: 20 };

function generateMath(difficulty: Difficulty): Question[] {
  const maxSum = MATH_MAX[difficulty];
  const out: Question[] = [];
  for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
    const isAdd = Math.random() < 0.55;
    let a: number, b: number, answer: number, promptText: string, spoken: string;
    if (isAdd) {
      a = randInt(1, Math.max(1, maxSum - 1));
      b = randInt(1, Math.max(1, maxSum - a));
      answer = a + b;
      promptText = `${a} + ${b}`;
      spoken = `What is ${a} plus ${b}?`;
    } else {
      a = randInt(2, Math.max(2, maxSum));
      b = randInt(1, a - 1);
      answer = a - b;
      promptText = `${a} − ${b}`;
      spoken = `What is ${a} minus ${b}?`;
    }
    out.push({
      id: crypto.randomUUID(),
      kind: "choice",
      difficulty,
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

const COUNT_CAP: Record<Difficulty, number> = { easy: 5, medium: 8, hard: 12 };

function generateCount(difficulty: Difficulty): Question[] {
  const cap = COUNT_CAP[difficulty];
  const out: Question[] = [];
  for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
    const item = COUNTABLES[randInt(0, COUNTABLES.length - 1)];
    const n = randInt(1, cap);
    out.push({
      id: crypto.randomUUID(),
      kind: "choice",
      difficulty,
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

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

// --- Read the Word (reading) -----------------------------------------------

function generateReadWord(difficulty: Difficulty): Question[] {
  const len = difficulty === "easy" ? 3 : 4;
  const nChoices = difficulty === "hard" ? 6 : 4;
  const pool = WORDS.filter((x) => x.w.length === len);
  return shuffle(pool)
    .slice(0, QUESTIONS_PER_SESSION)
    .map(({ w, e }) => {
      const distractors = shuffle(pool.filter((x) => x.w !== w))
        .slice(0, nChoices - 1)
        .map((x) => x.w);
      return {
        id: crypto.randomUUID(),
        kind: "choice" as const,
        difficulty,
        spoken: `Find the word ${w}.`,
        promptText: e,
        answer: w,
        choices: shuffle([w, ...distractors]),
      };
    });
}

// --- Build a Word (spelling) ------------------------------------------------

function generateSpell(difficulty: Difficulty): Question[] {
  const len = difficulty === "easy" ? 3 : 4;
  const extra = difficulty === "hard" ? 2 : 1;
  const pool = WORDS.filter((x) => x.w.length === len);
  return shuffle(pool)
    .slice(0, QUESTIONS_PER_SESSION)
    .map(({ w, e }) => {
      const bank = w.split("");
      for (let k = 0; k < extra; k++) {
        let d = ALPHABET[randInt(0, 25)];
        let guard = 0;
        while (bank.includes(d) && guard++ < 30) d = ALPHABET[randInt(0, 25)];
        bank.push(d);
      }
      return {
        id: crypto.randomUUID(),
        kind: "spell" as const,
        difficulty,
        spoken: `Spell the word: ${w}!`,
        promptText: e,
        answer: w,
        choices: shuffle(bank),
      };
    });
}

// --- Tracing (handwriting) --------------------------------------------------

const TRACE_EASY = "017CLOITU".split("");
const TRACE_MED = "ABDEFGHJKMNPRS234568".split("");
const TRACE_HARD = "ABCDEFGHJKLMNOPRSTUW0123456789".split("");

function generateTrace(difficulty: Difficulty): Question[] {
  const pool =
    difficulty === "easy" ? TRACE_EASY : difficulty === "medium" ? TRACE_MED : TRACE_HARD;
  return shuffle(pool)
    .slice(0, QUESTIONS_PER_SESSION)
    .map((glyph) => {
      const isLetter = /[A-Z]/.test(glyph);
      return {
        id: crypto.randomUUID(),
        kind: "trace" as const,
        difficulty,
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
  color: string;
  generate: (difficulty: Difficulty) => Question[];
}

export const GAMES: GameDef[] = [
  { id: "math-add-sub", subject: "math", title: "Add & Subtract", emoji: "➕", color: "sky", generate: generateMath },
  { id: "count-tap", subject: "math", title: "Count & Tap", emoji: "🔢", color: "teal", generate: generateCount },
  { id: "read-the-word", subject: "reading", title: "Read the Word", emoji: "📖", color: "indigo", generate: generateReadWord },
  { id: "build-a-word", subject: "writing", title: "Build a Word", emoji: "✏️", color: "violet", generate: generateSpell },
  { id: "tracing", subject: "writing", title: "Tracing", emoji: "✍️", color: "emerald", generate: generateTrace },
  // Read & Answer is built from approved AI content in startSession, so its
  // generate() is never called — it's here for the picker, title, and colors.
  { id: "read-answer", subject: "reading", title: "Read & Answer", emoji: "📚", color: "sky", generate: () => [] },
];

export function getGame(id: string): GameDef | undefined {
  return GAMES.find((g) => g.id === id);
}
