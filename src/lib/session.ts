import { transaction } from "./db";
import { getGame } from "./games";
import type { GameSession } from "./types";

// Starts a new session for a child + game: generates the questions on the
// SERVER and stores the answer key server-side, so awarding is graded
// independently of anything the client sends back.
export async function startSession(
  childId: string,
  gameId: string,
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
      questions: game.generate(child),
      startedAt: new Date().toISOString(),
    };

    await tx.addSession(session);
    return session;
  });
}
