import { transaction, listContent, getChild } from "./db";
import { getGame, buildMixedLesson } from "./games";
import type { Difficulty, GameSession, Question } from "./types";

// Starts a round for a child + game at a difficulty, within one family.
export async function startSession(
  familyId: string,
  childId: string,
  gameId: string,
  difficulty: Difficulty,
): Promise<GameSession | null> {
  const game = getGame(gameId);
  let questions: Question[] | null;
  if (game?.special) {
    // Daily/Weekly: only pull from games this child can access (not hidden).
    const child = await getChild(familyId, childId);
    questions = buildMixedLesson(game.special, child?.hiddenGames ?? [], childId);
  } else if (gameId === "read-answer") {
    questions = await buildReadAnswer(familyId, difficulty);
  } else {
    questions = game?.generate(difficulty) ?? null;
  }

  if (!questions || questions.length === 0) return null;

  return transaction(familyId, async (tx) => {
    const child = await tx.getChild(childId);
    if (!child) return null;

    const session: GameSession = {
      id: crypto.randomUUID(),
      familyId,
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

async function buildReadAnswer(
  familyId: string,
  difficulty: Difficulty,
): Promise<Question[] | null> {
  const approved = await listContent(familyId, "approved");
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
