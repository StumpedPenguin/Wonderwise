// 50 math story problems for the "Story Problems" game. The child READS each
// one (no audio) and taps the answer. Answers are computed here so the
// arithmetic is always correct; the game shows 5 random problems per lesson.

export interface WordProblem {
  text: string;
  answer: number;
}

// Builders keep the numbers and the computed answer in sync.
const takeAway = (a: string, n1: number, b: string, n2: number, item: string): WordProblem => ({
  text: `${a} has ${n1} ${item} and gives ${b} ${n2}. How many ${item} does ${a} have left?`,
  answer: n1 - n2,
});

const putTogether = (a: string, n1: number, b: string, n2: number, item: string): WordProblem => ({
  text: `${a} has ${n1} ${item}. ${b} has ${n2} ${item}. How many ${item} do they have altogether?`,
  answer: n1 + n2,
});

const findMore = (a: string, n1: number, n2: number, item: string): WordProblem => ({
  text: `${a} had ${n1} ${item}, then found ${n2} more. How many ${item} does ${a} have now?`,
  answer: n1 + n2,
});

const loseSome = (a: string, n1: number, n2: number, item: string): WordProblem => ({
  text: `${a} had ${n1} ${item}, but ${n2} floated away. How many ${item} are left?`,
  answer: n1 - n2,
});

const eatSome = (a: string, n1: number, n2: number, item: string): WordProblem => ({
  text: `There were ${n1} ${item} on the plate. ${a} ate ${n2}. How many ${item} are left?`,
  answer: n1 - n2,
});

export const WORD_PROBLEMS: WordProblem[] = [
  takeAway("Alex", 5, "Sophia", 2, "bananas"),
  takeAway("Mia", 8, "Noah", 3, "stickers"),
  takeAway("Liam", 7, "Emma", 4, "crayons"),
  takeAway("Ava", 9, "Ben", 5, "grapes"),
  takeAway("Lucas", 6, "Zoe", 1, "cookies"),
  takeAway("Ella", 10, "Max", 6, "marbles"),
  takeAway("Owen", 4, "Ruby", 2, "toy cars"),
  takeAway("Grace", 12, "Leo", 5, "seashells"),
  takeAway("Jack", 11, "Nora", 4, "blueberries"),
  takeAway("Chloe", 7, "Sam", 3, "pencils"),

  putTogether("Sophia", 3, "Alex", 4, "apples"),
  putTogether("Noah", 5, "Mia", 2, "balloons"),
  putTogether("Emma", 6, "Liam", 3, "buttons"),
  putTogether("Ben", 4, "Ava", 4, "acorns"),
  putTogether("Zoe", 2, "Lucas", 7, "leaves"),
  putTogether("Max", 5, "Ella", 5, "rocks"),
  putTogether("Ruby", 6, "Owen", 2, "flowers"),
  putTogether("Leo", 3, "Grace", 6, "coins"),
  putTogether("Nora", 4, "Jack", 5, "berries"),
  putTogether("Sam", 7, "Chloe", 1, "shells"),

  findMore("Alex", 4, 3, "toy dinosaurs"),
  findMore("Mia", 6, 2, "hair clips"),
  findMore("Liam", 5, 5, "bouncy balls"),
  findMore("Ava", 7, 1, "ladybugs"),
  findMore("Lucas", 3, 4, "pinecones"),
  findMore("Ella", 8, 2, "beads"),
  findMore("Owen", 2, 6, "trading cards"),
  findMore("Grace", 5, 3, "feathers"),
  findMore("Jack", 6, 4, "pennies"),
  findMore("Chloe", 9, 1, "daisies"),

  loseSome("Sophia", 6, 2, "balloons"),
  loseSome("Noah", 9, 4, "bubbles"),
  loseSome("Emma", 5, 1, "kites"),
  loseSome("Ben", 8, 3, "leaves"),
  loseSome("Zoe", 7, 5, "petals"),
  loseSome("Max", 10, 6, "snowflakes"),
  loseSome("Ruby", 4, 2, "balloons"),
  loseSome("Leo", 11, 4, "bubbles"),
  loseSome("Nora", 6, 3, "feathers"),
  loseSome("Sam", 12, 7, "leaves"),

  eatSome("Alex", 6, 2, "crackers"),
  eatSome("Mia", 8, 5, "grapes"),
  eatSome("Liam", 5, 3, "cherries"),
  eatSome("Ava", 9, 4, "carrots"),
  eatSome("Lucas", 7, 1, "pretzels"),
  eatSome("Ella", 10, 3, "strawberries"),
  eatSome("Owen", 4, 2, "cookies"),
  eatSome("Grace", 11, 6, "raisins"),
  eatSome("Jack", 6, 4, "orange slices"),
  eatSome("Chloe", 8, 2, "peas"),
];
