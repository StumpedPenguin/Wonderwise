// Vowels game data. Easy teaches WHAT the vowels are (A E I O U); medium/hard
// teach the short-vowel SOUND via simple CVC words with the vowel blanked.

export const VOWELS = ["a", "e", "i", "o", "u"];
export const CONSONANTS = "bcdfghjklmnpqrstvwxyz".split("");

export interface VowelWord {
  word: string;
  emoji: string;
  vowel: string; // the (single) short vowel in the middle
}

// Clean CVC words, one short vowel each, with a recognizable picture.
export const VOWEL_WORDS: VowelWord[] = [
  { word: "cat", emoji: "🐱", vowel: "a" },
  { word: "hat", emoji: "🎩", vowel: "a" },
  { word: "bat", emoji: "🦇", vowel: "a" },
  { word: "bag", emoji: "🎒", vowel: "a" },
  { word: "van", emoji: "🚐", vowel: "a" },
  { word: "map", emoji: "🗺️", vowel: "a" },
  { word: "bed", emoji: "🛏️", vowel: "e" },
  { word: "hen", emoji: "🐔", vowel: "e" },
  { word: "pen", emoji: "🖊️", vowel: "e" },
  { word: "net", emoji: "🥅", vowel: "e" },
  { word: "web", emoji: "🕸️", vowel: "e" },
  { word: "jet", emoji: "✈️", vowel: "e" },
  { word: "pig", emoji: "🐷", vowel: "i" },
  { word: "pin", emoji: "📌", vowel: "i" },
  { word: "lip", emoji: "👄", vowel: "i" },
  { word: "six", emoji: "6️⃣", vowel: "i" },
  { word: "wig", emoji: "👩‍🦰", vowel: "i" },
  { word: "dog", emoji: "🐶", vowel: "o" },
  { word: "box", emoji: "📦", vowel: "o" },
  { word: "fox", emoji: "🦊", vowel: "o" },
  { word: "pot", emoji: "🍲", vowel: "o" },
  { word: "log", emoji: "🪵", vowel: "o" },
  { word: "mop", emoji: "🧹", vowel: "o" },
  { word: "sun", emoji: "☀️", vowel: "u" },
  { word: "bus", emoji: "🚌", vowel: "u" },
  { word: "cup", emoji: "🥤", vowel: "u" },
  { word: "bug", emoji: "🐛", vowel: "u" },
  { word: "nut", emoji: "🥜", vowel: "u" },
  { word: "mug", emoji: "☕", vowel: "u" },
];
