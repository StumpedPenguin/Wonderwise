import type { Difficulty } from "./types";

// Dolch sight words — the high-frequency words early readers learn to
// recognize on sight. The child hears a word and taps it from a few choices.
//   easy   — pre-primer
//   medium — primer
//   hard   — first grade

const PRE_PRIMER = [
  "a", "and", "away", "big", "blue", "can", "come", "down", "find", "for",
  "funny", "go", "help", "here", "in", "is", "it", "jump", "little", "look",
  "make", "me", "my", "not", "one", "play", "red", "run", "said", "see",
  "the", "three", "to", "two", "up", "we", "where", "yellow", "you",
];

const PRIMER = [
  "all", "am", "are", "at", "ate", "be", "black", "brown", "but", "came",
  "did", "do", "eat", "four", "get", "good", "have", "he", "into", "like",
  "must", "new", "no", "now", "on", "our", "out", "please", "ran", "ride",
  "saw", "say", "she", "so", "soon", "that", "there", "they", "this", "too",
  "under", "want", "was", "well", "went", "what", "white", "who", "will",
  "with", "yes",
];

const FIRST = [
  "after", "again", "an", "any", "as", "ask", "by", "could", "every", "fly",
  "from", "give", "going", "had", "has", "her", "him", "his", "how", "just",
  "know", "let", "live", "may", "of", "old", "once", "open", "over", "put",
  "round", "some", "stop", "take", "thank", "them", "then", "think", "walk",
  "were", "when",
];

export const SIGHT_WORDS: Record<Difficulty, string[]> = {
  easy: PRE_PRIMER,
  medium: PRIMER,
  hard: FIRST,
};
