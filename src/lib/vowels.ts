// Vowels game data. Easy teaches WHAT the vowels are (A E I O U); medium/hard
// teach the short-vowel SOUND via simple CVC words with the vowel blanked.

export const VOWELS = ["a", "e", "i", "o", "u"];
export const CONSONANTS = "bcdfghjklmnpqrstvwxyz".split("");

export interface VowelWord {
  word: string;
  emoji?: string; // optional — no picture means the child reads from the audio
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
  // No-picture CVC words — the child reads/sounds these out from the audio.
  { word: "can", vowel: "a" }, { word: "cab", vowel: "a" },
  { word: "dad", vowel: "a" }, { word: "fan", vowel: "a" },
  { word: "ham", vowel: "a" }, { word: "jam", vowel: "a" },
  { word: "man", vowel: "a" }, { word: "pan", vowel: "a" },
  { word: "ran", vowel: "a" }, { word: "tap", vowel: "a" },
  { word: "nap", vowel: "a" }, { word: "rag", vowel: "a" },
  { word: "beg", vowel: "e" }, { word: "den", vowel: "e" },
  { word: "get", vowel: "e" }, { word: "leg", vowel: "e" },
  { word: "led", vowel: "e" }, { word: "met", vowel: "e" },
  { word: "peg", vowel: "e" }, { word: "red", vowel: "e" },
  { word: "set", vowel: "e" }, { word: "ten", vowel: "e" },
  { word: "wet", vowel: "e" }, { word: "pet", vowel: "e" },
  { word: "bib", vowel: "i" }, { word: "dig", vowel: "i" },
  { word: "fin", vowel: "i" }, { word: "fit", vowel: "i" },
  { word: "hit", vowel: "i" }, { word: "kid", vowel: "i" },
  { word: "lid", vowel: "i" }, { word: "mix", vowel: "i" },
  { word: "sit", vowel: "i" }, { word: "win", vowel: "i" },
  { word: "zip", vowel: "i" }, { word: "rib", vowel: "i" },
  { word: "cob", vowel: "o" }, { word: "cot", vowel: "o" },
  { word: "hop", vowel: "o" }, { word: "hot", vowel: "o" },
  { word: "job", vowel: "o" }, { word: "mob", vowel: "o" },
  { word: "nod", vowel: "o" }, { word: "pop", vowel: "o" },
  { word: "top", vowel: "o" }, { word: "rod", vowel: "o" },
  { word: "cop", vowel: "o" }, { word: "jog", vowel: "o" },
  { word: "cub", vowel: "u" }, { word: "cut", vowel: "u" },
  { word: "fun", vowel: "u" }, { word: "gum", vowel: "u" },
  { word: "hug", vowel: "u" }, { word: "jug", vowel: "u" },
  { word: "mud", vowel: "u" }, { word: "rub", vowel: "u" },
  { word: "run", vowel: "u" }, { word: "tub", vowel: "u" },
  { word: "pup", vowel: "u" }, { word: "rug", vowel: "u" },
];
