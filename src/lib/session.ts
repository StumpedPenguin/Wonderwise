import { transaction } from "./db";
import { getGame } from "./games";
import type { Difficulty, GameSession } from "./types";

// Starts a round for a child + game at a difficulty: generates the questions
// on the SERVER (each tagged with the difficulty) and stores them, so grading
// and the token reward are decided server-side.
export async function startSession(
  childId: string,
  gameId: string,
  difficulty: Difficulty,
): Promise<GameSession | null> {
  const game = getGame(gameId);
  if (!game) return null;

  return transaction(async (tx) => {
    const child = await tx.getChild(childId);
    if (!child) return null;

    const session: GameSession = {
      id: crypto.randomUUID(),
      childId,
      gameId,
      questions: game.generate(difficulty),
      startedAt: new Date().toISOString(),
    };

    await tx.addSession(session);
    return session;
  });
}
