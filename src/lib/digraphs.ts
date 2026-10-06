import type { Difficulty } from "./types";

// Consonant-digraph words for the "Digraph Sounds" phonics game. The child
// hears the word, sees it with the two digraph letters blanked out (e.g.
// "🐑 __eep"), and picks the digraph that spells the missing sound.
//
// Each word contains its digraph exactly once, so masking is unambiguous.

export interface DigraphWord {
  word: string;
  emoji: string;
  digraph: string;
}

// Which digraphs can appear as answer choices at each level.
export const DIGRAPH_CHOICES: Record<Difficulty, string[]> = {
  easy: ["sh", "ch", "th"],
  medium: ["sh", "ch", "th", "wh"],
  hard: ["sh", "ch", "th", "wh", "ck", "ng", "ph"],
};

const EASY: DigraphWord[] = [
  { word: "ship", emoji: "🚢", digraph: "sh" },
  { word: "shell", emoji: "🐚", digraph: "sh" },
  { word: "shoe", emoji: "👟", digraph: "sh" },
  { word: "sheep", emoji: "🐑", digraph: "sh" },
  { word: "shark", emoji: "🦈", digraph: "sh" },
  { word: "shirt", emoji: "👕", digraph: "sh" },
  { word: "chair", emoji: "🪑", digraph: "ch" },
  { word: "cheese", emoji: "🧀", digraph: "ch" },
  { word: "chick", emoji: "🐤", digraph: "ch" },
  { word: "cherry", emoji: "🍒", digraph: "ch" },
  { word: "cheetah", emoji: "🐆", digraph: "ch" },
  { word: "chain", emoji: "⛓️", digraph: "ch" },
];

const MEDIUM: DigraphWord[] = [
  { word: "ship", emoji: "🚢", digraph: "sh" },
  { word: "fish", emoji: "🐟", digraph: "sh" },
  { word: "brush", emoji: "🖌️", digraph: "sh" },
  { word: "chick", emoji: "🐤", digraph: "ch" },
  { word: "cheese", emoji: "🧀", digraph: "ch" },
  { word: "cherry", emoji: "🍒", digraph: "ch" },
  { word: "thumb", emoji: "👍", digraph: "th" },
  { word: "three", emoji: "3️⃣", digraph: "th" },
  { word: "teeth", emoji: "🦷", digraph: "th" },
  { word: "bath", emoji: "🛁", digraph: "th" },
  { word: "whale", emoji: "🐳", digraph: "wh" },
  { word: "wheel", emoji: "☸️", digraph: "wh" },
  { word: "whisk", emoji: "🥄", digraph: "wh" },
];

const HARD: DigraphWord[] = [
  { word: "fish", emoji: "🐟", digraph: "sh" },
  { word: "teeth", emoji: "🦷", digraph: "th" },
  { word: "whale", emoji: "🐳", digraph: "wh" },
  { word: "duck", emoji: "🦆", digraph: "ck" },
  { word: "sock", emoji: "🧦", digraph: "ck" },
  { word: "rock", emoji: "🪨", digraph: "ck" },
  { word: "clock", emoji: "🕐", digraph: "ck" },
  { word: "truck", emoji: "🚚", digraph: "ck" },
  { word: "ring", emoji: "💍", digraph: "ng" },
  { word: "king", emoji: "🤴", digraph: "ng" },
  { word: "swing", emoji: "🛝", digraph: "ng" },
  { word: "song", emoji: "🎵", digraph: "ng" },
  { word: "phone", emoji: "📞", digraph: "ph" },
  { word: "photo", emoji: "📷", digraph: "ph" },
];

export const DIGRAPH_WORDS: Record<Difficulty, DigraphWord[]> = {
  easy: EASY,
  medium: MEDIUM,
  hard: HARD,
};
