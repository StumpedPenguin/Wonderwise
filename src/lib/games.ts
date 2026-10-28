import type { Difficulty, Question, Subject } from "./types";
import { WORD_PROBLEMS } from "./wordProblems";
import { READING_PROMPTS } from "./readingPrompts";
import { DIGRAPH_WORDS, DIGRAPH_CHOICES } from "./digraphs";
import { SIGHT_WORDS } from "./sightWords";
import { VOWELS, CONSONANTS, VOWEL_WORDS } from "./vowels";
import { DIZZY_MAX, DIZZY_PUZZLES, type DizzyEquation, type DizzyPuzzle } from "./dizzy";
import { SPECIAL_COUNT, periodKey, hashString, type LessonKind } from "./lessons";

// Standard lessons are 10 questions. Some games override this (story problems
// are 5; reading is one story per lesson).
const DEFAULT_QUESTIONS = 10;

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
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
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
  let prev = -1;
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    const item = COUNTABLES[randInt(0, COUNTABLES.length - 1)];
    // Never ask the same count twice in a row (cap >= 5, so a different value
    // always exists).
    let n = randInt(1, cap);
    while (n === prev) n = randInt(1, cap);
    prev = n;
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

// --- Find the Letter/Number (listen & choose) -------------------------------

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Easy: numbers 1-10 + all letters. Medium: 1-20 + all letters. Hard: numbers
// up to 200 (no letters — the challenge is bigger numbers).
const FIND_MAX: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 200 };
const FIND_LETTERS: Record<Difficulty, boolean> = { easy: true, medium: true, hard: false };

function generateFind(difficulty: Difficulty): Question[] {
  const maxNum = FIND_MAX[difficulty];
  const useLetters = FIND_LETTERS[difficulty];
  const out: Question[] = [];
  let prev = "";
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    const isLetter = useLetters && Math.random() < 0.5;
    let answer: string;
    let spoken: string;
    const set = new Set<string>();

    if (isLetter) {
      do {
        answer = LETTERS[randInt(0, 25)];
      } while (answer === prev);
      spoken = `Find the letter ${answer}.`;
      set.add(answer);
      while (set.size < 4) set.add(LETTERS[randInt(0, 25)]);
    } else {
      let n: number;
      do {
        n = randInt(1, maxNum);
      } while (String(n) === prev);
      answer = String(n);
      spoken = `Find the number ${n}.`;
      set.add(answer);
      // Distractors: close by, so it's a real "recognize this number" test.
      let guard = 0;
      while (set.size < 4 && guard++ < 60) {
        const spread = maxNum <= 20 ? maxNum : 20;
        const c = n + randInt(-spread, spread);
        if (c >= 1 && c <= maxNum) set.add(String(c));
      }
      for (let f = 1; set.size < 4; f++) if (f !== n) set.add(String(f));
    }

    prev = answer;
    out.push({
      id: crypto.randomUUID(),
      kind: "choice",
      difficulty,
      spoken,
      promptText: "👂",
      answer,
      choices: shuffle([...set]),
    });
  }
  return out;
}

// --- Domino Addition (count both halves and add) ----------------------------

// Highest number of pips per domino half, by difficulty. A standard domino set
// tops out at six pips a side, so no half ever exceeds 6.
const DOMINO_MAX: Record<Difficulty, number> = { easy: 3, medium: 5, hard: 6 };

function generateDomino(difficulty: Difficulty): Question[] {
  const half = DOMINO_MAX[difficulty];
  const maxSum = half * 2;
  const out: Question[] = [];
  let prev = "";
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    let a = randInt(0, half);
    let b = randInt(0, half);
    // Don't repeat the exact same tile back to back (either orientation).
    while (`${a}|${b}` === prev || `${b}|${a}` === prev) {
      a = randInt(0, half);
      b = randInt(0, half);
    }
    prev = `${a}|${b}`;
    const answer = a + b;
    out.push({
      id: crypto.randomUUID(),
      kind: "domino",
      difficulty,
      spoken: "Count the dots and add them up!",
      promptText: `${a}|${b}`, // the two halves, drawn as pips by the UI
      answer: String(answer),
      choices: numberChoices(answer, maxSum),
    });
  }
  return out;
}

// --- Digraph Sounds (phonics: sh, ch, th, wh, ck, ng, ph) -------------------

function generateDigraphs(difficulty: Difficulty): Question[] {
  const pool = DIGRAPH_WORDS[difficulty];
  const choicePool = DIGRAPH_CHOICES[difficulty];
  const nChoices = Math.min(difficulty === "easy" ? 3 : 4, choicePool.length);
  return shuffle(pool)
    .slice(0, DEFAULT_QUESTIONS)
    .map(({ word, emoji, digraph }) => {
      const masked = word.replace(digraph, "＿＿");
      const distractors = shuffle(choicePool.filter((d) => d !== digraph)).slice(
        0,
        nChoices - 1,
      );
      return {
        id: crypto.randomUUID(),
        kind: "choice" as const,
        difficulty,
        spoken: `The word is ${word}. Which two letters are missing?`,
        promptText: `${emoji}  ${masked}`,
        answer: digraph,
        choices: shuffle([digraph, ...distractors]),
      };
    });
}

// --- Words (shared by Read the Word and Build a Word) ------------------------

const WORDS = [
  // 3-letter
  { w: "cat", e: "🐱" }, { w: "dog", e: "🐶" }, { w: "sun", e: "☀️" },
  { w: "hat", e: "🎩" }, { w: "bed", e: "🛏️" }, { w: "pig", e: "🐷" },
  { w: "cup", e: "🥤" }, { w: "bus", e: "🚌" }, { w: "box", e: "📦" },
  { w: "fox", e: "🦊" }, { w: "pen", e: "🖊️" }, { w: "bag", e: "🎒" },
  { w: "hen", e: "🐔" }, { w: "bee", e: "🐝" }, { w: "owl", e: "🦉" },
  { w: "ant", e: "🐜" }, { w: "cow", e: "🐮" }, { w: "van", e: "🚐" },
  { w: "key", e: "🔑" }, { w: "map", e: "🗺️" }, { w: "mug", e: "☕" },
  { w: "bat", e: "🦇" }, { w: "car", e: "🚗" }, { w: "cap", e: "🧢" },
  { w: "egg", e: "🥚" }, { w: "web", e: "🕸️" }, { w: "saw", e: "🪚" },
  { w: "axe", e: "🪓" }, { w: "pie", e: "🥧" }, { w: "ear", e: "👂" },
  { w: "ram", e: "🐏" }, { w: "rat", e: "🐀" }, { w: "bug", e: "🐛" },
  { w: "fly", e: "🪰" }, { w: "ice", e: "🧊" }, { w: "nut", e: "🥜" },
  { w: "log", e: "🪵" }, { w: "paw", e: "🐾" }, { w: "ski", e: "🎿" },
  { w: "tea", e: "🍵" }, { w: "ham", e: "🍖" }, { w: "eye", e: "👁️" },
  // 4-letter
  { w: "fish", e: "🐟" }, { w: "frog", e: "🐸" }, { w: "star", e: "⭐" },
  { w: "moon", e: "🌙" }, { w: "cake", e: "🍰" }, { w: "ball", e: "⚽" },
  { w: "bird", e: "🐦" }, { w: "tree", e: "🌳" }, { w: "boat", e: "⛵" },
  { w: "milk", e: "🥛" }, { w: "duck", e: "🦆" }, { w: "lion", e: "🦁" },
  { w: "bear", e: "🐻" }, { w: "corn", e: "🌽" }, { w: "leaf", e: "🍃" },
  { w: "drum", e: "🥁" }, { w: "lamp", e: "💡" }, { w: "sock", e: "🧦" },
  { w: "ring", e: "💍" }, { w: "door", e: "🚪" }, { w: "bell", e: "🔔" },
  { w: "book", e: "📖" }, { w: "hand", e: "✋" }, { w: "snow", e: "❄️" },
  { w: "king", e: "🤴" }, { w: "crab", e: "🦀" }, { w: "goat", e: "🐐" },
  { w: "kite", e: "🪁" }, { w: "gift", e: "🎁" }, { w: "rose", e: "🌹" },
  { w: "wolf", e: "🐺" }, { w: "deer", e: "🦌" }, { w: "swan", e: "🦢" },
  { w: "lamb", e: "🐑" }, { w: "seal", e: "🦭" }, { w: "worm", e: "🪱" },
  { w: "dove", e: "🕊️" }, { w: "bone", e: "🦴" }, { w: "rain", e: "🌧️" },
  { w: "pear", e: "🍐" }, { w: "kiwi", e: "🥝" }, { w: "taco", e: "🌮" },
  { w: "boot", e: "🥾" }, { w: "coat", e: "🧥" }, { w: "nest", e: "🪺" },
  { w: "fire", e: "🔥" }, { w: "ship", e: "🚢" }, { w: "wave", e: "🌊" },
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

// --- Read the Word (reading) -----------------------------------------------

function generateReadWord(difficulty: Difficulty): Question[] {
  const len = difficulty === "easy" ? 3 : 4;
  const nChoices = difficulty === "hard" ? 6 : 4;
  const pool = WORDS.filter((x) => x.w.length === len);
  return shuffle(pool)
    .slice(0, DEFAULT_QUESTIONS)
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
    .slice(0, DEFAULT_QUESTIONS)
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

const TRACE_EASY = "017CLOITUVXYHEF".split("");
const TRACE_MED = "ABDEFGHJKMNPRS234568".split("");
const TRACE_HARD = "ABCDEFGHJKLMNOPRSTUW0123456789".split("");

function generateTrace(difficulty: Difficulty): Question[] {
  const pool =
    difficulty === "easy" ? TRACE_EASY : difficulty === "medium" ? TRACE_MED : TRACE_HARD;
  return shuffle(pool)
    .slice(0, DEFAULT_QUESTIONS)
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

// --- Story Problems (read-only math word problems) --------------------------

const STORY_PROBLEMS_PER_LESSON = 5;

function generateStoryProblems(difficulty: Difficulty): Question[] {
  return shuffle(WORD_PROBLEMS)
    .slice(0, STORY_PROBLEMS_PER_LESSON)
    .map(({ text, answer }) => ({
      id: crypto.randomUUID(),
      kind: "choice" as const,
      difficulty,
      spoken: text,
      promptText: text,
      answer: String(answer),
      choices: numberChoices(answer, answer + 3),
      silent: true, // the child reads the problem — no audio
    }));
}

// --- Story Time (read-only reading comprehension) ---------------------------

function generateStoryTime(difficulty: Difficulty): Question[] {
  const pool = READING_PROMPTS[difficulty];
  const story = pool[randInt(0, pool.length - 1)];
  return story.questions.map((q) => ({
    id: crypto.randomUUID(),
    kind: "reading" as const,
    difficulty,
    spoken: q.q,
    promptText: q.q,
    answer: q.answer,
    choices: shuffle(q.choices),
    passage: story.passage,
    silent: true, // the child reads the story — no audio
  }));
}

// --- What Comes Next? (number sequence) -------------------------------------

const SEQ_MAX: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 };

function generateNumberLine(difficulty: Difficulty): Question[] {
  const max = SEQ_MAX[difficulty];
  const out: Question[] = [];
  let prev = "";
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    let start = randInt(1, max - 2); // run of three: start, start+1, start+2
    const blank = randInt(0, 2); // which position is missing
    const run = [start, start + 1, start + 2];
    const answer = run[blank];
    const key = `${start}-${blank}`;
    if (key === prev) {
      start = randInt(1, max - 2);
    }
    prev = `${start}-${blank}`;
    const shown = run.map((n, idx) => (idx === blank ? "＿" : String(n))).join("   ");
    out.push({
      id: crypto.randomUUID(),
      kind: "choice",
      difficulty,
      spoken: "What number is missing?",
      promptText: shown,
      answer: String(answer),
      choices: numberChoices(answer, max),
    });
  }
  return out;
}

// --- More or Less (compare numbers) -----------------------------------------

const COMPARE_MAX: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 50 };

function generateCompare(difficulty: Difficulty): Question[] {
  const max = COMPARE_MAX[difficulty];
  const out: Question[] = [];
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    let a = randInt(1, max);
    let b = randInt(1, max);
    while (b === a) b = randInt(1, max);
    const wantBigger = Math.random() < 0.5;
    const answer = wantBigger ? Math.max(a, b) : Math.min(a, b);
    out.push({
      id: crypto.randomUUID(),
      kind: "choice",
      difficulty,
      spoken: wantBigger ? "Tap the bigger number." : "Tap the smaller number.",
      promptText: wantBigger ? "Which is more? ⬆️" : "Which is less? ⬇️",
      answer: String(answer),
      choices: shuffle([String(a), String(b)]),
    });
  }
  return out;
}

// --- Big & Little Letters (uppercase / lowercase match) ---------------------

const CASE_RANGE: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 26 };

function generateCaseMatch(difficulty: Difficulty): Question[] {
  const span = CASE_RANGE[difficulty];
  const out: Question[] = [];
  let prev = "";
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    let idx = randInt(0, span - 1);
    while (LETTERS[idx] === prev) idx = randInt(0, span - 1);
    prev = LETTERS[idx];
    const showUpper = Math.random() < 0.5;
    const shown = showUpper ? LETTERS[idx] : LETTERS[idx].toLowerCase();
    const answer = showUpper ? LETTERS[idx].toLowerCase() : LETTERS[idx];
    const set = new Set<string>([answer]);
    while (set.size < 4) {
      const d = LETTERS[randInt(0, span - 1)];
      set.add(showUpper ? d.toLowerCase() : d);
    }
    out.push({
      id: crypto.randomUUID(),
      kind: "choice",
      difficulty,
      spoken: `Find the ${showUpper ? "little" : "big"} letter that matches ${LETTERS[idx]}.`,
      promptText: shown,
      answer,
      choices: shuffle([...set]),
    });
  }
  return out;
}

// --- Shapes -----------------------------------------------------------------

// Shape ids are drawn as real SVG by the UI (see ShapeGlyph in PlayGame), so
// each shape is depicted correctly — not an approximate emoji.
const SHAPE_POOL: Record<Difficulty, string[]> = {
  easy: ["circle", "square", "triangle", "star", "heart"],
  medium: ["circle", "square", "triangle", "star", "heart", "rectangle", "oval", "diamond"],
  hard: [
    "circle", "square", "triangle", "star", "heart", "rectangle", "oval",
    "diamond", "pentagon", "hexagon", "crescent", "cross",
  ],
};

function generateShapes(difficulty: Difficulty): Question[] {
  const pool = SHAPE_POOL[difficulty];
  const nChoices = difficulty === "easy" ? 3 : 4;
  const out: Question[] = [];
  let prev = "";
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    let target = pool[randInt(0, pool.length - 1)];
    while (target === prev) target = pool[randInt(0, pool.length - 1)];
    prev = target;
    const distractors = shuffle(pool.filter((s) => s !== target)).slice(0, nChoices - 1);
    out.push({
      id: crypto.randomUUID(),
      kind: "shape",
      difficulty,
      spoken: `Find the ${target}.`,
      promptText: target, // the shape name (for the prompt / answer)
      answer: target,
      choices: shuffle([target, ...distractors]),
    });
  }
  return out;
}

// --- Put In Order (sequence letters/numbers) --------------------------------

const ORDER_COUNT: Record<Difficulty, number> = { easy: 3, medium: 4, hard: 5 };

function generateOrder(difficulty: Difficulty): Question[] {
  const count = ORDER_COUNT[difficulty];
  const out: Question[] = [];
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    const useNumbers = Math.random() < 0.5;
    // A consecutive run, so the answer is a real sequence (3 4 5 6, not 2 4 7 9).
    const run: string[] = [];
    if (useNumbers) {
      const start = randInt(1, 10 - count); // digits 1-9, run fits within
      for (let k = 0; k < count; k++) run.push(String(start + k));
    } else {
      const start = randInt(0, 26 - count);
      for (let k = 0; k < count; k++) run.push(LETTERS[start + k]);
    }
    out.push({
      id: crypto.randomUUID(),
      kind: "spell",
      difficulty,
      spoken: useNumbers
        ? "Put the numbers in order, smallest first."
        : "Put the letters in A B C order.",
      promptText: useNumbers ? "🔢" : "🔤",
      answer: run.join(""),
      choices: shuffle([...run]),
    });
  }
  return out;
}

// --- Letter Hunt (tap every matching letter) --------------------------------

const HUNT: Record<Difficulty, { cells: number; targets: number }> = {
  easy: { cells: 6, targets: 2 },
  medium: { cells: 9, targets: 3 },
  hard: { cells: 12, targets: 4 },
};

function generateHunt(difficulty: Difficulty): Question[] {
  const { cells, targets } = HUNT[difficulty];
  const out: Question[] = [];
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    const target = LETTERS[randInt(0, 25)];
    const grid: string[] = [];
    for (let t = 0; t < targets; t++) grid.push(target);
    while (grid.length < cells) {
      const d = LETTERS[randInt(0, 25)];
      if (d !== target) grid.push(d);
    }
    out.push({
      id: crypto.randomUUID(),
      kind: "hunt",
      difficulty,
      spoken: `Find all the letter ${target}! Tap each one.`,
      promptText: target, // the letter to hunt for
      answer: "found",
      choices: shuffle(grid), // the grid cells
    });
  }
  return out;
}

// --- Vowels (what they are + short-vowel sounds) ----------------------------

function generateVowels(difficulty: Difficulty): Question[] {
  const out: Question[] = [];
  let prev = "";
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    if (difficulty === "easy") {
      // Which letter is a vowel? (learn what they are)
      let vowel = VOWELS[randInt(0, VOWELS.length - 1)];
      while (vowel === prev) vowel = VOWELS[randInt(0, VOWELS.length - 1)];
      prev = vowel;
      const set = new Set<string>([vowel.toUpperCase()]);
      while (set.size < 4) set.add(CONSONANTS[randInt(0, CONSONANTS.length - 1)].toUpperCase());
      out.push({
        id: crypto.randomUUID(),
        kind: "choice",
        difficulty,
        spoken: "Which letter is a vowel? A, E, I, O, and U are vowels.",
        promptText: "🅰️",
        answer: vowel.toUpperCase(),
        choices: shuffle([...set]),
      });
    } else {
      // Which vowel sound is in this word? (learn to sound them)
      const w = VOWEL_WORDS[randInt(0, VOWEL_WORDS.length - 1)];
      const masked = w.word.replace(w.vowel, "＿");
      const nChoices = difficulty === "hard" ? 5 : 3;
      const set = new Set<string>([w.vowel]);
      while (set.size < nChoices) set.add(VOWELS[randInt(0, VOWELS.length - 1)]);
      out.push({
        id: crypto.randomUUID(),
        kind: "choice",
        difficulty,
        spoken: `Which vowel is missing? The word is ${w.word}.`,
        promptText: `${w.emoji}  ${masked}`,
        answer: w.vowel,
        choices: shuffle([...set]),
      });
    }
  }
  return out;
}

// --- Sight Words (Dolch word recognition) -----------------------------------

function generateSightWords(difficulty: Difficulty): Question[] {
  const pool = SIGHT_WORDS[difficulty];
  const nChoices = difficulty === "easy" ? 3 : 4;
  const out: Question[] = [];
  let prev = "";
  for (let i = 0; i < DEFAULT_QUESTIONS; i++) {
    let target = pool[randInt(0, pool.length - 1)];
    while (target === prev) target = pool[randInt(0, pool.length - 1)];
    prev = target;
    // Prefer look-alike distractors (same first letter) to make it a real
    // reading test, then fill with any other words.
    const sameStart = shuffle(pool.filter((w) => w !== target && w[0] === target[0]));
    const others = shuffle(pool.filter((w) => w !== target && w[0] !== target[0]));
    const distractors = [...sameStart, ...others].slice(0, nChoices - 1);
    out.push({
      id: crypto.randomUUID(),
      kind: "choice",
      difficulty,
      spoken: `Find the word ${target}.`,
      promptText: "👂",
      answer: target,
      choices: shuffle([target, ...distractors]),
    });
  }
  return out;
}

// --- Dizzy Digits (use each digit 0..N once to fill the blanks) -------------

function makeDizzyPuzzle(maxDigit: number): DizzyPuzzle {
  const pool = shuffle(Array.from({ length: maxDigit + 1 }, (_, i) => i));
  const equations: DizzyEquation[] = [];
  let i = 0;
  while (i < pool.length) {
    const remaining = pool.length - i;
    const twoBlank = remaining >= 2 && Math.random() < 0.5;
    if (twoBlank) {
      // blank + blank = (sum shown)
      const a = pool[i];
      const b = pool[i + 1];
      i += 2;
      equations.push({
        a: { v: a, blank: true },
        b: { v: b, blank: true },
        c: { v: a + b, blank: false },
      });
    } else {
      const x = pool[i];
      i += 1;
      const pattern = randInt(0, 2);
      if (pattern === 0) {
        // fixed + blank = fixed
        const f = randInt(0, 4);
        equations.push({ a: { v: f, blank: false }, b: { v: x, blank: true }, c: { v: f + x, blank: false } });
      } else if (pattern === 1) {
        // blank + fixed = fixed
        const f = randInt(0, 4);
        equations.push({ a: { v: x, blank: true }, b: { v: f, blank: false }, c: { v: x + f, blank: false } });
      } else {
        // fixed + fixed = blank (the result is the blank)
        const a = randInt(0, x);
        equations.push({ a: { v: a, blank: false }, b: { v: x - a, blank: false }, c: { v: x, blank: true } });
      }
    }
  }
  return { maxDigit, equations: shuffle(equations) };
}

function generateDizzy(difficulty: Difficulty): Question[] {
  const maxDigit = DIZZY_MAX[difficulty];
  const out: Question[] = [];
  for (let p = 0; p < DIZZY_PUZZLES[difficulty]; p++) {
    out.push({
      id: crypto.randomUUID(),
      kind: "dizzy",
      difficulty,
      spoken: `Use each number from 0 to ${maxDigit} one time to fill the boxes.`,
      promptText: JSON.stringify(makeDizzyPuzzle(maxDigit)), // parsed by the UI
      answer: "solved",
      choices: [],
    });
  }
  return out;
}

// --- Memory Match -----------------------------------------------------------

const MEMORY_PAIRS: Record<Difficulty, number> = { easy: 3, medium: 4, hard: 5 };
const MEMORY_BOARDS = 3;

function generateMemory(difficulty: Difficulty): Question[] {
  const nPairs = MEMORY_PAIRS[difficulty];
  const out: Question[] = [];
  for (let board = 0; board < MEMORY_BOARDS; board++) {
    // Each pair is an uppercase letter with its lowercase (quick to read, so
    // the tiles don't need to be studied before they flip back).
    const pairs: [string, string][] = [];
    const used = new Set<string>();
    for (let p = 0; p < nPairs; p++) {
      let L = LETTERS[randInt(0, 25)];
      while (used.has(L)) L = LETTERS[randInt(0, 25)];
      used.add(L);
      pairs.push([L, L.toLowerCase()]);
    }
    out.push({
      id: crypto.randomUUID(),
      kind: "match",
      difficulty,
      spoken: "Find the matching pairs!",
      promptText: JSON.stringify(pairs), // parsed by the UI
      answer: "matched",
      choices: [],
    });
  }
  return out;
}

// --- Daily / Weekly mixed lessons -------------------------------------------

// Regular games the mixed lessons draw from (not the specials or AI content).
const MIX_GAME_IDS = [
  "math-add-sub",
  "count-tap",
  "domino-add",
  "find-it",
  "number-line",
  "more-less",
  "order-it",
  "shapes",
  "story-problems",
  "read-the-word",
  "digraphs",
  "big-little",
  "vowels",
  "sight-words",
  "letter-hunt",
  "build-a-word",
  "story-time",
  "tracing",
  // memory-match is a multi-board board game, too long for a quick mixed quiz.
];

// Run `fn` with Math.random replaced by a seeded generator, so the content is
// identical for a given seed (same for everyone that day/week) and restored
// afterwards. Generation is synchronous, so nothing else observes the swap.
function withSeed<T>(seed: number, fn: () => T): T {
  const orig = Math.random;
  let s = seed >>> 0;
  Math.random = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  try {
    return fn();
  } finally {
    Math.random = orig;
  }
}

/**
 * Build a mixed lesson of medium/hard questions pulled from across the games.
 * Only draws from games the child can access (not hidden), so a kid never gets
 * a question type they can't play. Seeded from the period + child so it's
 * stable across retries that day/week.
 */
export function buildMixedLesson(
  kind: LessonKind,
  hiddenGameIds: string[] = [],
  salt = "",
): Question[] {
  const count = SPECIAL_COUNT[kind];
  const hidden = new Set(hiddenGameIds);
  let allowed = MIX_GAME_IDS.filter((id) => !hidden.has(id));
  if (allowed.length === 0) allowed = MIX_GAME_IDS; // never produce an empty lesson
  const pool = allowed
    .map((id) => getGame(id))
    .filter((g): g is GameDef => !!g);

  const seed = hashString(`${kind}:${periodKey(kind)}:${salt}`);
  return withSeed(seed, () => {
    const out: Question[] = [];
    // Round-robin across the allowed games; regenerate a fresh set of buckets
    // if we run out before reaching the count (e.g. a kid with few games).
    for (let round = 0; out.length < count && round < 20; round++) {
      const buckets = pool.map((g) => g.generate(Math.random() < 0.5 ? "medium" : "hard"));
      const maxLen = Math.max(0, ...buckets.map((b) => b.length));
      for (let i = 0; i < maxLen && out.length < count; i++) {
        for (const b of buckets) {
          if (b[i] !== undefined) {
            out.push(b[i]);
            if (out.length >= count) break;
          }
        }
      }
    }
    return out;
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
  /** Special mixed lessons: no difficulty picker, fixed reward, once per period. */
  special?: LessonKind;
}

export const GAMES: GameDef[] = [
  { id: "math-add-sub", subject: "math", title: "Add & Subtract", emoji: "➕", color: "sky", generate: generateMath },
  { id: "count-tap", subject: "math", title: "Count & Tap", emoji: "🔢", color: "teal", generate: generateCount },
  { id: "domino-add", subject: "math", title: "Domino Math", emoji: "🎲", color: "blue", generate: generateDomino },
  { id: "find-it", subject: "math", title: "Listen & Find", emoji: "👂", color: "cyan", generate: generateFind },
  { id: "number-line", subject: "math", title: "What Comes Next?", emoji: "🔟", color: "lime", generate: generateNumberLine },
  { id: "more-less", subject: "math", title: "More or Less", emoji: "⚖️", color: "orange", generate: generateCompare },
  { id: "order-it", subject: "math", title: "Put In Order", emoji: "🔢", color: "teal", generate: generateOrder },
  { id: "dizzy-digits", subject: "math", title: "Dizzy Digits", emoji: "🌀", color: "indigo", generate: generateDizzy },
  { id: "shapes", subject: "math", title: "Shapes", emoji: "🔷", color: "purple", generate: generateShapes },
  { id: "memory-match", subject: "math", title: "Memory Match", emoji: "🃏", color: "cyan", generate: generateMemory },
  { id: "story-problems", subject: "math", title: "Story Problems", emoji: "🧮", color: "amber", generate: generateStoryProblems },
  { id: "read-the-word", subject: "reading", title: "Read the Word", emoji: "📖", color: "indigo", generate: generateReadWord },
  { id: "digraphs", subject: "reading", title: "Digraph Sounds", emoji: "🔤", color: "fuchsia", generate: generateDigraphs },
  { id: "big-little", subject: "reading", title: "Big & Little", emoji: "🔡", color: "pink", generate: generateCaseMatch },
  { id: "vowels", subject: "reading", title: "Vowels", emoji: "🅰️", color: "amber", generate: generateVowels },
  { id: "sight-words", subject: "reading", title: "Sight Words", emoji: "👀", color: "indigo", generate: generateSightWords },
  { id: "letter-hunt", subject: "reading", title: "Letter Hunt", emoji: "🔍", color: "rose", generate: generateHunt },
  { id: "story-time", subject: "reading", title: "Story Time", emoji: "📚", color: "rose", generate: generateStoryTime },
  { id: "build-a-word", subject: "writing", title: "Build a Word", emoji: "✏️", color: "violet", generate: generateSpell },
  { id: "tracing", subject: "writing", title: "Tracing", emoji: "✍️", color: "emerald", generate: generateTrace },
  // Read & Answer is built from approved AI content in startSession, so its
  // generate() is never called — it's here for the picker, title, and colors.
  { id: "read-answer", subject: "reading", title: "Read & Answer", emoji: "🤖", color: "sky", generate: () => [] },
  // Special mixed lessons — built in startSession from buildMixedLesson.
  { id: "daily", subject: "math", title: "Daily Lesson", emoji: "🌟", color: "amber", generate: () => [], special: "daily" },
  { id: "weekly", subject: "math", title: "Weekly Lesson", emoji: "🏆", color: "violet", generate: () => [], special: "weekly" },
];

export function getGame(id: string): GameDef | undefined {
  return GAMES.find((g) => g.id === id);
}
