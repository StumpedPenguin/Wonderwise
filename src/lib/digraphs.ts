import type { Difficulty } from "./types";

// Consonant-digraph words for the "Digraph Sounds" phonics game. The child
// hears the word, sees it with the two digraph letters blanked out (e.g.
// "🐑 __eep"), and picks the digraph that spells the missing sound.
//
// Each word contains its digraph exactly once, so masking is unambiguous.

export interface DigraphWord {
  word: string;
  emoji?: string; // optional — no picture means the child reads from the audio
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
  { word: "shop", digraph: "sh" }, { word: "shed", digraph: "sh" },
  { word: "shut", digraph: "sh" }, { word: "wish", digraph: "sh" },
  { word: "dish", digraph: "sh" }, { word: "cash", digraph: "sh" },
  { word: "fresh", digraph: "sh" }, { word: "shelf", digraph: "sh" },
  { word: "chop", digraph: "ch" }, { word: "chin", digraph: "ch" },
  { word: "chat", digraph: "ch" }, { word: "much", digraph: "ch" },
  { word: "rich", digraph: "ch" }, { word: "lunch", digraph: "ch" },
  { word: "bench", digraph: "ch" }, { word: "chest", digraph: "ch" },
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
  { word: "shop", digraph: "sh" }, { word: "wish", digraph: "sh" },
  { word: "wash", digraph: "sh" }, { word: "dish", digraph: "sh" },
  { word: "chop", digraph: "ch" }, { word: "much", digraph: "ch" },
  { word: "lunch", digraph: "ch" }, { word: "beach", digraph: "ch" },
  { word: "moth", digraph: "th" }, { word: "path", digraph: "th" },
  { word: "with", digraph: "th" }, { word: "math", digraph: "th" },
  { word: "thin", digraph: "th" }, { word: "cloth", digraph: "th" },
  { word: "when", digraph: "wh" }, { word: "whip", digraph: "wh" },
  { word: "wheat", digraph: "wh" }, { word: "white", digraph: "wh" },
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
  { word: "back", digraph: "ck" }, { word: "kick", digraph: "ck" },
  { word: "lock", digraph: "ck" }, { word: "neck", digraph: "ck" },
  { word: "pick", digraph: "ck" }, { word: "sack", digraph: "ck" },
  { word: "sick", digraph: "ck" }, { word: "deck", digraph: "ck" },
  { word: "rack", digraph: "ck" }, { word: "black", digraph: "ck" },
  { word: "bang", digraph: "ng" }, { word: "hang", digraph: "ng" },
  { word: "long", digraph: "ng" }, { word: "lung", digraph: "ng" },
  { word: "rang", digraph: "ng" }, { word: "sung", digraph: "ng" },
  { word: "wing", digraph: "ng" }, { word: "gong", digraph: "ng" },
  { word: "sing", digraph: "ng" }, { word: "hung", digraph: "ng" },
  { word: "graph", digraph: "ph" }, { word: "dolphin", digraph: "ph" },
  { word: "nephew", digraph: "ph" }, { word: "trophy", digraph: "ph" },
  { word: "moth", digraph: "th" }, { word: "path", digraph: "th" },
  { word: "with", digraph: "th" }, { word: "math", digraph: "th" },
  { word: "thorn", digraph: "th" }, { word: "north", digraph: "th" },
  { word: "wish", digraph: "sh" }, { word: "wash", digraph: "sh" },
  { word: "fresh", digraph: "sh" }, { word: "shop", digraph: "sh" },
  { word: "when", digraph: "wh" }, { word: "whip", digraph: "wh" },
  { word: "wheat", digraph: "wh" }, { word: "white", digraph: "wh" },
  { word: "much", digraph: "ch" }, { word: "rich", digraph: "ch" },
  { word: "beach", digraph: "ch" }, { word: "chop", digraph: "ch" },
];

export const DIGRAPH_WORDS: Record<Difficulty, DigraphWord[]> = {
  easy: EASY,
  medium: MEDIUM,
  hard: HARD,
};
