import { transaction, listContent } from "./db";
import { getGame } from "./games";
import type { Difficulty, GameSession, Question } from "./types";

// Starts a round for a child + game at a difficulty. Questions are generated
// on the SERVER (each tagged with the difficulty) and stored, so grading and
// the token reward are decided server-side.
export async function startSession(
  childId: string,
  gameId: string,
  difficulty: Difficulty,
): Promise<GameSession | null> {
  const questions =
    gameId === "read-answer"
      ? await buildReadAnswer(difficulty)
      : (getGame(gameId)?.generate(difficulty) ?? null);

  if (!questions || questions.length === 0) return null;

  return transaction(async (tx) => {
    const child = await tx.getChild(childId);
    if (!child) return null;

    const session: GameSession = {
      id: crypto.randomUUID(),
      childId,
      gameId,
      questions,
      startedAt: new Date().toISOString(),
    };

    await tx.addSession(session);
    return session;
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Read & Answer: pick a random APPROVED passage and turn its comprehension
// questions into reading questions. Returns null when nothing is approved yet.
async function buildReadAnswer(difficulty: Difficulty): Promise<Question[] | null> {
  const approved = await listContent("approved");
  if (approved.length === 0) return null;
  const pick = approved[Math.floor(Math.random() * approved.length)];
  return pick.payload.questions.map((q) => ({
    id: crypto.randomUUID(),
    kind: "reading" as const,
    difficulty,
    spoken: q.q,
    promptText: q.q,
    answer: q.answer,
    choices: shuffle(q.choices),
    passage: pick.payload.passage,
  }));
}
